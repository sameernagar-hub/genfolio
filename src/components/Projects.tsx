"use client";

import { ArrowUpRight, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "@/content/types";
import { GitHubIcon } from "./icons";
import { Spotlight } from "./ui";

export type ProjectView = Project & { stackLabels: string[]; awardLabel?: string; eventLabel?: string };

const filters = ["All", "AI systems", "Platforms", "Hackathon", "Research"] as const;

export function Projects({ items }: { items: ProjectView[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = items.filter((p) => filter === "All" || p.category === filter);

  return (
    <div>
      <div role="tablist" aria-label="Filter projects" className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`relative rounded-full px-3.5 py-1.5 text-sm transition ${filter === f ? "text-bg" : "text-muted hover:text-fg"}`}
          >
            {filter === f && <motion.span layoutId="project-filter" className="absolute inset-0 -z-0 rounded-full bg-fg" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
            <span className="relative">{f}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => {
            const wide = filter === "All" && (i === 0 || i === 1);
            return (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className={wide ? "sm:col-span-2" : ""}
              >
                <Spotlight className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-faint">
                        {p.category} · {p.year}
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{p.name}</h3>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {p.repo && (
                        <a href={p.repo} target="_blank" rel="noreferrer" aria-label={`${p.name} source code`} className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg">
                          <GitHubIcon />
                        </a>
                      )}
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noreferrer" aria-label={`${p.name} live demo`} className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg">
                          <ArrowUpRight className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.tagline}</p>

                  {p.awardLabel && (
                    <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,#f59e0b_14%,transparent)] px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Trophy className="size-3.5" /> {p.awardLabel}
                    </p>
                  )}

                  <p className="mt-4 text-sm text-pretty">
                    <span className="text-faint">Problem. </span>
                    {p.problem}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {(wide ? p.built : p.built.slice(0, 2)).map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                        <span className="text-pretty">{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-5">
                    <p className="font-mono text-xs text-accent-2">↳ {p.proof}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.stackLabels.slice(0, 6).map((s) => (
                        <span key={s} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                    {p.live && (
                      <a href={p.live} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fg underline-offset-4 hover:underline">
                        Try it live <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>
                </Spotlight>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
