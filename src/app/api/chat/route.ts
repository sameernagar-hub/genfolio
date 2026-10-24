import { localAnswer, SYSTEM_INSTRUCTION, type ChatTurn } from "@/lib/assistant";
import { providers } from "@/lib/llm";
import { checkRate, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 8;
const TIMEOUT_MS = 20_000;

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

  // Try each configured provider until one produces a first token.
  for (const provider of providers()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const tokens = provider.stream({ system: SYSTEM_INSTRUCTION, history, message, signal: controller.signal });
    let first: IteratorResult<string>;
    try {
      first = await tokens.next();
      if (first.done) throw new Error("empty response");
    } catch (err) {
      clearTimeout(timeout);
      console.error(`chat: ${provider.name} (${provider.model}) failed, trying next`, err);
      continue;
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(ctrl) {
        ctrl.enqueue(encoder.encode(first.value));
      },
      async pull(ctrl) {
        try {
          const next = await tokens.next();
          if (next.done) {
            clearTimeout(timeout);
            ctrl.close();
          } else {
            ctrl.enqueue(encoder.encode(next.value));
          }
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

  return plain(localAnswer(message), "local");
}
