"use client";

import { ArrowUpRight, Plus, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "@/content/types";
import { GitHubIcon } from "./icons";
import { Tilt } from "./motion";
import { Spotlight } from "./ui";

export type ProjectView = Project & { stackLabels: string[]; awardLabel?: string; eventLabel?: string };

const filters = ["All", "AI systems", "Platforms", "Hackathon", "Research"] as const;

function Card({ p, wide }: { p: ProjectView; wide: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Tilt className="h-full">
      <Spotlight className={`flex h-full flex-col p-6 ${wide ? "sm:p-7" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            {p.category} · {p.year}
          </p>
          <div className="-mt-1.5 -mr-1.5 flex shrink-0 gap-0.5">
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

        <h3 className={`mt-2 font-semibold tracking-tight ${wide ? "text-3xl" : "text-xl"}`}>{p.name}</h3>
        <p className="mt-1 text-pretty text-muted">{p.tagline}</p>

        {p.awardLabel && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,#f59e0b_16%,transparent)] px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
          >
            <Trophy className="size-3.5" /> {p.awardLabel}
          </motion.p>
        )}

        <p className="mt-5 font-mono text-sm text-accent-2">↳ {p.proof}</p>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-4 text-sm text-pretty">
                <span className="text-faint">Why it exists: </span>
                {p.problem}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {p.built.map((b, i) => (
                  <motion.li key={b} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    <span className="text-pretty">{b}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-1.5">
            {p.stackLabels.slice(0, wide ? 7 : 5).map((s) => (
              <span key={s} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1 text-muted transition hover:text-fg">
              <Plus className={`size-3.5 transition-transform ${open ? "rotate-45" : ""}`} />
              {open ? "Less" : "How it's built"}
            </button>
            {p.live && (
              <a href={p.live} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-medium">
                Try it live
                <ArrowUpRight className="size-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>
      </Spotlight>
    </Tilt>
  );
}

export function Projects({ items }: { items: ProjectView[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = items.filter((p) => filter === "All" || p.category === filter);

  return (
    <div>
      <div role="tablist" aria-label="Filter projects" className="mb-6 flex flex-wrap gap-1">
        {filters.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`relative rounded-full px-3.5 py-1.5 text-sm transition ${filter === f ? "text-bg" : "text-muted hover:text-fg"}`}
          >
            {filter === f && <motion.span layoutId="project-filter" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />}
            <span className="relative">{f}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => {
            const wide = filter === "All" && i === 0;
            return (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={wide ? "sm:col-span-2" : ""}
              >
                <Card p={p} wide={wide} />
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
