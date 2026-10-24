"use client";

import { Check, Copy, Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SplitText, useEntrance } from "./motion";

/** Opens the assistant (and optionally asks a question) from anywhere on the page. */
export function askAssistant(prompt?: string) {
  window.dispatchEvent(new CustomEvent("assistant:ask", { detail: { prompt } }));
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useEntrance(ref);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={state === "hidden" ? { opacity: 0, y: 18, filter: "blur(6px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={state === "reveal" ? { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}

/** Marks the page hydrated; until then CSS keeps server-rendered content visible. */
export function Hydrated() {
  useEffect(() => document.documentElement.classList.add("hydrated"), []);
  return null;
}

/** Card with a cursor-following glow (see .spotlight in globals.css). */
export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`spotlight rounded-2xl border border-line bg-surface transition-colors hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--line))] ${className}`}
    >
      {children}
    </div>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      onClick={flip}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
      className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function CopyButton({ value, label, className = "" }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
      className={className}
      aria-label={`Copy ${label ?? value}`}
    >
      {done ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
      <span>{done ? "Copied" : (label ?? value)}</span>
    </button>
  );
}

export function SectionHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: ReactNode }) {
  return (
    <Reveal className="mb-8 max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <SplitText text={title} className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl" />
      {intro && <p className="mt-4 text-pretty text-muted">{intro}</p>}
    </Reveal>
  );
}
