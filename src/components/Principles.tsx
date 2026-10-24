"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

export type PrincipleView = { id: string; title: string; line: string; proof: { label: string; note: string; href?: string }[] };

/** Numbered manifesto. Hover (or tap) a line to see the work that backs it. */
export function Principles({ items }: { items: PrincipleView[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((p, i) => {
        const on = active === i;
        return (
          <motion.li
            key={p.id}
            initial={reduce ? false : { opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            tabIndex={0}
            className="group cursor-default py-5 outline-none"
          >
            <div className="flex items-baseline gap-4">
              <span className={`font-mono text-xs transition-colors ${on ? "text-accent" : "text-faint"}`}>0{i + 1}</span>
              <h3 className={`text-2xl font-semibold tracking-tight transition-colors sm:text-[1.7rem] ${on ? "text-fg" : "text-faint group-hover:text-muted"}`}>
                {p.title}
              </h3>
            </div>
            <motion.div
              initial={false}
              animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden pl-9"
            >
              <p className="pt-2 text-pretty text-muted">{p.line}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.proof.map((pr) => {
                  const body = (
                    <>
                      <span className="font-medium text-fg">{pr.label}</span>
                      <span className="text-faint">· {pr.note}</span>
                      {pr.href && <ArrowUpRight className="size-3 text-faint" />}
                    </>
                  );
                  return pr.href ? (
                    <a
                      key={pr.label + pr.note}
                      href={pr.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs transition hover:border-accent"
                    >
                      {body}
                    </a>
                  ) : (
                    <span key={pr.label + pr.note} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs">
                      {body}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </motion.li>
        );
      })}
    </ol>
  );
}
