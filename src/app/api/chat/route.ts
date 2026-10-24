import { BUSY_NOTE, leaks, localAnswer, REFUSE_INSTRUCTIONS, refusal, SYSTEM_INSTRUCTION, type ChatTurn } from "@/lib/assistant";
import { answerCache } from "@/lib/cache";
import { providers } from "@/lib/llm";
import { checkRate, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 8;
const TIMEOUT_MS = 20_000;
/** Hold back the opening of each answer until it has been checked for a prompt leak. */
const GUARD_CHARS = 240;

const plain = (body: BodyInit, mode: string) =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Assistant-Mode": mode, "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const rate = checkRate(clientKey(req.headers));
  if (!rate.ok) {
    return Response.json(
      { error: "Too many questions in a short time. Try again shortly, or email Sameer directly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { message?: unknown; history?: unknown };
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  if (!message) return Response.json({ error: "Message is required." }, { status: 400 });

  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history
        .filter((t): t is ChatTurn => !!t && typeof t === "object" && typeof (t as ChatTurn).content === "string")
        .slice(-MAX_HISTORY)
        .map((t) => ({ role: t.role === "assistant" ? "assistant" : "user", content: t.content.slice(0, 1500) }))
    : [];

  // Injection, off-topic, salary, comparison, and personal asks are refused before any model call.
  const blocked = refusal(message);
  if (blocked) return plain(blocked, "guard");

  // Fresh questions (no history) are cached: the starter prompts repeat a lot and model quota is small.
  const cacheable = history.length === 0;
  if (cacheable) {
    const hit = answerCache.get(message);
    if (hit) return plain(hit.text, `cache:${hit.provider}`);
  }

  const live = providers();

  // Try each configured provider until one produces output.
  for (const provider of live) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const tokens = provider.stream({ system: SYSTEM_INSTRUCTION, history, message, signal: controller.signal });

    // Read the opening before committing to this provider, so a failure can still fall through
    // and a leaked prompt never reaches the browser.
    let head = "";
    let finished = false;
    try {
      while (head.length < GUARD_CHARS) {
        const next = await tokens.next();
        if (next.done) {
          finished = true;
          break;
        }
        head += next.value;
      }
      if (!head.trim()) throw new Error("empty response");
    } catch (err) {
      clearTimeout(timeout);
      console.error(`chat: ${provider.name} (${provider.model}) failed, trying next`, err);
      continue;
    }

    if (leaks(head)) {
      clearTimeout(timeout);
      controller.abort();
      console.warn(`chat: ${provider.name} began to leak its instructions; refused`);
      return plain(REFUSE_INSTRUCTIONS, `guard:${provider.name}`);
    }

    const encoder = new TextEncoder();
    let full = head;
    const stream = new ReadableStream<Uint8Array>({
      start(ctrl) {
        ctrl.enqueue(encoder.encode(head));
        if (finished) {
          clearTimeout(timeout);
          if (cacheable) answerCache.set(message, { text: full, provider: provider.name });
          ctrl.close();
        }
      },
      async pull(ctrl) {
        try {
          const next = await tokens.next();
          if (next.done) {
            clearTimeout(timeout);
            if (cacheable) answerCache.set(message, { text: full, provider: provider.name });
            ctrl.close();
            return;
          }
          full += next.value;
          if (leaks(full)) {
            clearTimeout(timeout);
            controller.abort();
            ctrl.enqueue(encoder.encode(`\n\n${REFUSE_INSTRUCTIONS}`));
            ctrl.close();
            return;
          }
          ctrl.enqueue(encoder.encode(next.value));
        } catch (err) {
          clearTimeout(timeout);
          console.error(`chat: ${provider.name} stream interrupted`, err);
          ctrl.close();
        }
      },
      cancel() {
        clearTimeout(timeout);
        controller.abort();
      },
    });
    return plain(stream, `live:${provider.name}`);
  }

  // No provider configured, or all of them failed (rate limit, outage): answer from the graph.
  return plain((live.length ? BUSY_NOTE : "") + localAnswer(message), live.length ? "local:busy" : "local");
}
