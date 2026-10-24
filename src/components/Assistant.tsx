"use client";

import { ArrowUp, RotateCcw, Sparkles, Square, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { prompts } from "@/content/person";

type Turn = { role: "user" | "assistant"; content: string };

const STORAGE = "genfolio.chat";
const JD_HINT = "Paste the job description here…";

/** Tiny, safe markdown: **bold**, "- " bullets, bare URLs and /paths as links. No HTML injection. */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|(?<=\s|^)\/[\w.-]+\.pdf)/g);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>;
    if (/^(https?:\/\/|\/)/.test(p))
      return (
        <a key={i} href={p} target="_blank" rel="noreferrer" className="break-all text-accent underline-offset-2 hover:underline">
          {p.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  <span>{renderInline(l.replace(/^\s*[-*•]\s+/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i} className="whitespace-pre-wrap">{renderInline(block)}</p>;
      })}
    </div>
  );
}

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "local" | null>(null);
  const [placeholder, setPlaceholder] = useState("Ask anything, or paste a JD…");
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE) || "[]");
      if (Array.isArray(saved)) setTurns(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(turns.slice(-20)));
    } catch {}
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || busy) return;
      const history = turns.slice(-8);
      setTurns((t) => [...t, { role: "user", content: message }, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);
      abort.current = new AbortController();
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, history }),
          signal: abort.current.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "The assistant is unavailable right now.");
        }
        setMode(res.headers.get("X-Assistant-Mode") === "live" ? "live" : "local");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setTurns((t) => {
            const next = [...t];
            next[next.length - 1] = { role: "assistant", content: next[next.length - 1].content + chunk };
            return next;
          });
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setTurns((t) => {
            const next = [...t];
            next[next.length - 1] = { role: "assistant", content: `${(e as Error).message} You can email Sameer at nagarsam8989@gmail.com.` };
            return next;
          });
        }
      } finally {
        setBusy(false);
        abort.current = null;
      }
    },
    [busy, turns],
  );

  useEffect(() => {
    const onAsk = (e: Event) => {
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      setOpen(true);
      if (prompt === "__jd__") {
        setPlaceholder(JD_HINT);
        setTimeout(() => field.current?.focus(), 250);
      } else if (prompt) {
        void send(prompt);
      } else {
        setTimeout(() => field.current?.focus(), 250);
      }
    };
    window.addEventListener("assistant:ask", onAsk);
    return () => window.removeEventListener("assistant:ask", onAsk);
  }, [send]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              setOpen(true);
              setTimeout(() => field.current?.focus(), 250);
            }}
            className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-fg py-3 pr-5 pl-4 text-sm font-medium text-bg shadow-2xl shadow-black/30 transition hover:scale-[1.03] sm:right-6 sm:bottom-6"
            aria-label="Open AI assistant"
          >
            <Sparkles className="size-4" /> Ask about Sameer
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="AI assistant"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[min(720px,calc(100dvh-3rem))] sm:w-[440px] sm:rounded-3xl"
            >
              <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                <div className="grid size-9 place-items-center rounded-full bg-[conic-gradient(from_180deg,var(--accent),var(--accent-2),var(--accent))]">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Genfolio AI · Ask about Sameer</p>
                  <p className="text-xs text-muted">
                    Grounded in his portfolio. {mode === "live" ? "Live model." : mode === "local" ? "Offline answers." : "No invented facts."}
                  </p>
                </div>
                {turns.length > 0 && (
                  <button onClick={() => setTurns([])} aria-label="Clear conversation" className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg">
                    <RotateCcw className="size-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} aria-label="Close assistant" className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg">
                  <X className="size-4" />
                </button>
              </div>

              <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm leading-relaxed">
                {turns.length === 0 && (
                  <div>
                    <p className="text-muted">Hi! I answer from Sameer&apos;s real experience and projects, with links. Try one:</p>
                    <div className="mt-4 flex flex-col gap-2">
                      {prompts.map((p) => (
                        <button key={p} onClick={() => send(p)} className="rounded-xl border border-line px-3.5 py-2.5 text-left transition hover:border-accent hover:bg-surface-2">
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setPlaceholder(JD_HINT);
                          field.current?.focus();
                        }}
                        className="rounded-xl border border-dashed border-line px-3.5 py-2.5 text-left text-muted transition hover:border-accent hover:text-fg"
                      >
                        Paste a job description to match…
                      </button>
                    </div>
                  </div>
                )}
                {turns.map((t, i) =>
                  t.role === "user" ? (
                    <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-fg px-4 py-2.5 whitespace-pre-wrap text-bg">
                      {t.content.length > 600 ? `${t.content.slice(0, 600)}…` : t.content}
                    </div>
                  ) : (
                    <div key={i} className="max-w-[95%] text-muted">
                      {t.content ? (
                        <Markdown text={t.content} />
                      ) : (
                        <span className="inline-flex gap-1" aria-label="Thinking">
                          {[0, 1, 2].map((d) => (
                            <motion.span key={d} className="size-1.5 rounded-full bg-faint" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }} />
                          ))}
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(input);
                }}
                className="border-t border-line p-3"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-line bg-bg p-2 focus-within:border-accent">
                  <textarea
                    ref={field}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send(input);
                      }
                    }}
                    rows={input.length > 120 ? 5 : 1}
                    maxLength={4000}
                    placeholder={placeholder}
                    aria-label="Message"
                    className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-faint"
                  />
                  {busy ? (
                    <button type="button" onClick={() => abort.current?.abort()} aria-label="Stop" className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2">
                      <Square className="size-3.5" />
                    </button>
                  ) : (
                    <button type="submit" disabled={!input.trim()} aria-label="Send" className="grid size-9 shrink-0 place-items-center rounded-xl bg-fg text-bg transition disabled:opacity-30">
                      <ArrowUp className="size-4" />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
