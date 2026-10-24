"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "./ui";

export type RoleView = {
  id: string;
  title: string;
  org: string;
  location: string;
  start: string;
  end: string;
  current?: boolean;
  summary: string;
  impact: string[];
  highlights: string[];
  stack: string[];
  projects: { name: string; href?: string }[];
};

export function Experience({ roles }: { roles: RoleView[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ol className="relative space-y-3 before:absolute before:top-3 before:bottom-3 before:left-[11px] before:w-px before:bg-line">
      {roles.map((r, i) => {
        const isOpen = open === r.id;
        return (
          <Reveal key={r.id} delay={i * 0.05}>
            <li className="relative pl-10">
              <span
                className={`absolute top-6 left-1 grid size-[15px] place-items-center rounded-full border-2 ${
                  r.current ? "border-ok bg-[color-mix(in_oklab,var(--ok)_30%,transparent)]" : "border-line bg-bg"
                }`}
              />
              <div className="rounded-2xl border border-line bg-surface transition-colors hover:border-[color-mix(in_oklab,var(--accent)_30%,var(--line))]">
                <button
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold tracking-tight">{r.title}</h3>
                      <span className="text-muted">{r.org}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-faint">
                      {r.start} – {r.end} · {r.location}
                    </p>
                    <motion.ul
                      className="mt-3 flex flex-wrap gap-1.5"
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true }}
                      transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
                    >
                      {r.impact.map((chip) => (
                        <motion.li
                          key={chip}
                          variants={{ hidden: { opacity: 0, y: 8, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
                          className="rounded-full border border-line bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-2.5 py-1 font-mono text-[11px] text-fg"
                        >
                          {chip}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </div>
                  <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-faint">
                    <span className="hidden sm:inline">{isOpen ? "less" : "details"}</span>
                    <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line px-5 pt-4 pb-6 sm:px-6">
                        <p className="mb-3 text-sm text-pretty text-muted">{r.summary}</p>
                        <ul className="space-y-2.5 text-sm">
                          {r.highlights.map((h, hi) => (
                            <motion.li
                              key={h}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * hi }}
                              className="flex gap-2.5"
                            >
                              <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                              <span className="text-pretty">{h}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="mt-5 flex flex-wrap items-center gap-1.5">
                          {r.stack.map((s) => (
                            <span key={s} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                              {s}
                            </span>
                          ))}
                          {r.projects.map((p) =>
                            p.href ? (
                              <a key={p.name} href={p.href} target="_blank" rel="noreferrer" className="rounded-md bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 py-0.5 font-mono text-[11px] text-accent hover:underline">
                                ↗ {p.name}
                              </a>
                            ) : null,
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </li>
          </Reveal>
        );
      })}
    </ol>
  );
}
