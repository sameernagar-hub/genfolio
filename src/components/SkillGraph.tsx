"use client";

import { ArrowUpRight, Award, BookOpen, Briefcase, FlaskConical, Layers } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Evidence, EvidenceKind } from "@/content/graph";

export type SkillView = { id: string; label: string; group: string; weight: number; evidence: Evidence[] };

const kindIcon: Record<EvidenceKind, typeof Briefcase> = {
  role: Briefcase,
  project: Layers,
  certification: Award,
  publication: BookOpen,
  thesis: FlaskConical,
};

export function SkillGraph({ skills }: { skills: SkillView[] }) {
  const [active, setActive] = useState(skills[0]?.id);
  const groups = useMemo(() => {
    const m = new Map<string, SkillView[]>();
    for (const s of skills) m.set(s.group, [...(m.get(s.group) ?? []), s]);
    return [...m.entries()];
  }, [skills]);
  const current = skills.find((s) => s.id === active);
  const max = Math.max(...skills.map((s) => s.weight));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        {groups.map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-faint">{group}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((s) => {
                const on = s.id === active;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    onMouseEnter={() => setActive(s.id)}
                    aria-pressed={on}
                    className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      on ? "border-accent bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-fg" : "border-line text-muted hover:border-faint hover:text-fg"
                    }`}
                  >
                    {s.label}
                    <span className="flex gap-0.5" aria-label={`${s.weight} pieces of evidence`}>
                      {Array.from({ length: Math.min(s.weight, 5) }).map((_, i) => (
                        <span key={i} className={`h-2.5 w-0.5 rounded-full ${on ? "bg-accent" : "bg-faint/60"}`} style={{ opacity: 0.4 + (0.6 * (i + 1)) / Math.min(max, 5) }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-live="polite">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <p className="font-mono text-xs text-faint">evidence for</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">{current.label}</h3>
                <p className="mt-1 text-sm text-muted">
                  {current.weight} independent source{current.weight === 1 ? "" : "s"}
                </p>
                <ul className="mt-5 space-y-3">
                  {current.evidence.slice(0, 6).map((e, i) => {
                    const Icon = kindIcon[e.kind];
                    const body = (
                      <>
                        <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            {e.label}
                            {e.href && <ArrowUpRight className="size-3.5 text-faint" />}
                          </span>
                          <span className="mt-0.5 line-clamp-3 block text-sm text-muted">{e.detail}</span>
                        </span>
                      </>
                    );
                    return (
                      <li key={`${e.kind}-${e.id}-${i}`}>
                        {e.href ? (
                          <a href={e.href} target="_blank" rel="noreferrer" className="-m-2 flex gap-3 rounded-xl p-2 transition hover:bg-surface-2">
                            {body}
                          </a>
                        ) : (
                          <div className="flex gap-3">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
