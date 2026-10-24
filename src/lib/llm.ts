// Model providers for the assistant. Each turns a chat into a stream of answer
// text. The route tries them in order and falls through to the next one if a
// provider fails before producing its first token.

import type { ChatTurn } from "./assistant.ts";

export type ProviderName = "gemini" | "groq";

export type Provider = {
  name: ProviderName;
  model: string;
  stream: (args: { system: string; history: ChatTurn[]; message: string; signal: AbortSignal }) => AsyncGenerator<string>;
};

const MAX_TOKENS = 700;
const TEMPERATURE = 0.4;

/** Yields the `data:` payload of each server-sent event in a response body. */
export async function* sseData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const evt of events) {
        const data = evt.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
        if (data) yield data;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** Gemini frames: {candidates:[{content:{parts:[{text}]}}]} */
export function geminiText(frame: string): string {
  try {
    const parts: { text?: string }[] = JSON.parse(frame)?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p) => p.text ?? "").join("");
  } catch {
    return "";
  }
}

/** OpenAI-compatible frames (Groq): {choices:[{delta:{content}}]}, terminated by [DONE]. */
export function openAiText(frame: string): string {
  if (frame === "[DONE]") return "";
  try {
    return JSON.parse(frame)?.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

async function failIfNotOk(res: Response, name: string) {
  if (!res.ok || !res.body) throw new Error(`${name} ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
}

function gemini(key: string, model: string): Provider {
  return {
    name: "gemini",
    model,
    async *stream({ system, history, message, signal }) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
        {
          method: "POST",
          signal,
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [
              ...history.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
              { role: "user", parts: [{ text: message }] },
            ],
            generationConfig: { temperature: TEMPERATURE, maxOutputTokens: MAX_TOKENS },
          }),
        },
      );
      await failIfNotOk(res, "gemini");
      for await (const frame of sseData(res.body!)) {
        const text = geminiText(frame);
        if (text) yield text;
      }
    },
  };
}

function groq(key: string, model: string): Provider {
  return {
    name: "groq",
    model,
    async *stream({ system, history, message, signal }) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          stream: true,
          temperature: TEMPERATURE,
          max_completion_tokens: MAX_TOKENS,
          // gpt-oss models reason before answering; keep it short for chat latency.
          ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
          messages: [{ role: "system", content: system }, ...history, { role: "user", content: message }],
        }),
      });
      await failIfNotOk(res, "groq");
      for await (const frame of sseData(res.body!)) {
        if (frame === "[DONE]") return;
        const text = openAiText(frame);
        if (text) yield text;
      }
    },
  };
}

/**
 * Providers with a key set, in preference order. AI_PROVIDER picks which goes
 * first ("gemini" or "groq"); the other stays as a fallback.
 */
export function providers(env: Record<string, string | undefined> = process.env): Provider[] {
  const list: Provider[] = [];
  // Unfilled placeholders from .env.example ("paste-your-...-key-here") count as unset.
  const real = (v?: string) => (v && !/^paste-|your-.*-key/i.test(v.trim()) ? v.trim() : undefined);
  const geminiKey = real(env.GEMINI_API_KEY);
  const groqKey = real(env.GROQ_API_KEY);
  if (geminiKey) list.push(gemini(geminiKey, env.GEMINI_MODEL?.trim() || "gemini-2.5-flash"));
  if (groqKey) list.push(groq(groqKey, env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b"));
  const first = env.AI_PROVIDER?.trim().toLowerCase();
  if (first === "groq" || first === "gemini") list.sort((a, b) => Number(b.name === first) - Number(a.name === first));
  return list;
}
