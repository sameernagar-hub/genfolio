"use client";

// Sticky identity column (desktop) / stacked intro (mobile). Layout pattern
// inspired by brittanychiang.com: who, what, where, then a live section index.

import { ArrowDownToLine, ArrowRight, ArrowUpRight, Command, FileSearch, Mail, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { person, recruiter } from "@/content/person";
import { sections } from "@/lib/site";
import { GitHubIcon, LinkedInIcon, ScholarIcon } from "./icons";
import { Rotator } from "./motion";
import { askAssistant, CopyButton, ThemeToggle } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

function useActiveSection() {
  const [active, setActive] = useState<string>(sections[0].id);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

export function Sidebar({ nowLabel, building }: { nowLabel: string; building: { name: string; href: string } }) {
  const reduce = useReducedMotion();
  const active = useActiveSection();
  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease } };

  return (
    <header className="pt-16 pb-6 [scrollbar-width:none] lg:sticky lg:top-0 lg:flex lg:max-h-dvh lg:w-[44%] lg:flex-col lg:justify-between lg:overflow-y-auto lg:py-14">

      <div>
        <motion.a
          {...rise(0)}
          href="#experience"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur transition hover:text-fg"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-pulse-ring rounded-full" />
            <span className="size-2 rounded-full bg-ok" />
          </span>
          Now: {nowLabel}
          <ArrowRight className="size-3" />
        </motion.a>
        <motion.a
          {...rise(0.03)}
          href={building.href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 ml-0 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur transition hover:text-fg sm:ml-2"
        >
          <span className="font-mono text-accent">&gt;_</span> Building in public: {building.name}
          <ArrowUpRight className="size-3" />
        </motion.a>

        <motion.h1 {...rise(0.05)} className="mt-5 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-[3.4rem]">
          {person.name}
        </motion.h1>
        <motion.p {...rise(0.1)} className="mt-3 text-xl font-medium tracking-tight sm:text-2xl">
          I build <Rotator words={person.rotating} />
          <br />
          that hold up in production.
        </motion.p>

        <motion.div {...rise(0.2)} className="mt-7 flex flex-wrap gap-2">
          <button
            onClick={() => askAssistant()}
            className="flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg shadow-[color-mix(in_oklab,var(--accent)_25%,transparent)] transition hover:opacity-90"
          >
            <Sparkles className="size-4" /> Interview my AI
          </button>
          <button
            onClick={() => askAssistant("__jd__")}
            className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-2"
          >
            <FileSearch className="size-4" /> Match your JD
          </button>
          <a href={person.resume} download className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-2">
            <ArrowDownToLine className="size-4" /> Resume
          </a>
        </motion.div>

        <motion.dl {...rise(0.25)} className="mt-6 max-w-md space-y-1.5 text-[13px] text-muted">
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-mono text-[11px] uppercase leading-5 tracking-[0.12em] text-faint">Status</dt>
            <dd className="text-fg">{recruiter.availability}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-mono text-[11px] uppercase leading-5 tracking-[0.12em] text-faint">Based</dt>
            <dd>{recruiter.location}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-mono text-[11px] uppercase leading-5 tracking-[0.12em] text-faint">Visa</dt>
            <dd>{recruiter.workAuthShort}</dd>
          </div>
        </motion.dl>

        <nav aria-label="Sections" className="mt-9 hidden lg:block">
          <ul>
            {sections.map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="group flex items-center gap-4 py-1.5" aria-current={on ? "true" : undefined}>
                    <span className={`h-px transition-all duration-300 ${on ? "w-16 bg-fg" : "w-8 bg-faint group-hover:w-16 group-hover:bg-fg"}`} />
                    <span className={`font-mono text-xs uppercase tracking-[0.18em] transition ${on ? "text-fg" : "text-faint group-hover:text-fg"}`}>{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-1">
        {[
          { href: person.links.github, label: "GitHub", Icon: GitHubIcon },
          { href: person.links.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
          { href: person.links.scholar, label: "Google Scholar", Icon: ScholarIcon },
        ].map(({ href, label, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg">
            <Icon className="size-5" />
          </a>
        ))}
        <a href={`mailto:${person.email}`} aria-label="Email" className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-fg">
          <Mail className="size-5" />
        </a>
        <CopyButton value={person.email} label="copy email" className="ml-1 flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-xs text-muted transition hover:bg-surface-2 hover:text-fg" />
        <span className="ml-auto flex items-center gap-1">
          <button
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            className="hidden items-center gap-1 rounded-full px-2.5 py-1.5 font-mono text-xs text-muted transition hover:bg-surface-2 hover:text-fg sm:flex"
            aria-label="Open command menu"
          >
            <Command className="size-3.5" />K
          </button>
          <ThemeToggle />
        </span>
      </div>
    </header>
  );
}
