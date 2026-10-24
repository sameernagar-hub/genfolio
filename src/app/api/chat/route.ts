import { localAnswer, SYSTEM_INSTRUCTION, type ChatTurn } from "@/lib/assistant";
import { checkRate, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 8;

const textStream = (text: string, mode: "live" | "local") =>
  new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Assistant-Mode": mode, "Cache-Control": "no-store" } });

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

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return textStream(localAnswer(message), "local");

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [
            ...history.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
            { role: "user", parts: [{ text: message }] },
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
        }),
      },
    );
  } catch (err) {
    clearTimeout(timeout);
    console.error("chat: model request failed", err);
    return textStream(localAnswer(message), "local");
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    console.error("chat: model returned", upstream.status, await upstream.text().catch(() => ""));
    return textStream(localAnswer(message), "local");
  }

  // Re-emit Gemini's SSE as a plain text stream of answer tokens.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = "";
  let sent = false;

  const stream = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          clearTimeout(timeout);
          if (!sent) ctrl.enqueue(encoder.encode(localAnswer(message)));
          ctrl.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() ?? "";
        for (const evt of events) {
          const data = evt.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
          if (!data) continue;
          try {
            const json = JSON.parse(data);
            const parts: { text?: string }[] = json?.candidates?.[0]?.content?.parts ?? [];
            const text = parts.map((p) => p.text ?? "").join("");
            if (text) {
              sent = true;
              ctrl.enqueue(encoder.encode(text));
            }
          } catch {
            // ignore keep-alive or partial frames
          }
        }
      } catch (err) {
        clearTimeout(timeout);
        console.error("chat: stream interrupted", err);
        if (!sent) ctrl.enqueue(encoder.encode(localAnswer(message)));
        ctrl.close();
      }
    },
    cancel() {
      clearTimeout(timeout);
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Assistant-Mode": "live", "Cache-Control": "no-store" },
  });
}
