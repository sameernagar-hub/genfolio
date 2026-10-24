"use client";

import { Command } from "cmdk";
import { ArrowDownToLine, AtSign, FileSearch, Hash, Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { person } from "@/content/person";
import type { Project } from "@/content/types";
import { sections } from "@/lib/site";
import { GitHubIcon, LinkedInIcon } from "./icons";
import { askAssistant } from "./ui";

export function CommandPalette({ projects }: { projects: Pick<Project, "id" | "name" | "tagline" | "live" | "repo">[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpen);
    };
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 50);
  };

  const item = "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg";

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      overlayClassName="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
      contentClassName="fixed top-[14vh] left-1/2 z-[61] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
    >
      <Command.Input placeholder="Jump to, open, or ask…" className="w-full border-b border-line bg-transparent px-4 py-4 text-sm outline-none placeholder:text-faint" />
      <Command.List className="max-h-[60vh] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-faint">Nothing here. Try asking the AI.</Command.Empty>
        <Command.Group heading="Do" className="px-1 text-xs text-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
          <Command.Item className={item} onSelect={() => run(() => askAssistant())}>
            <Sparkles className="size-4" /> Interview the AI about Sameer
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => askAssistant("__jd__"))}>
            <FileSearch className="size-4" /> Match a job description
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => window.open(person.resume, "_blank"))}>
            <ArrowDownToLine className="size-4" /> Open resume (PDF)
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => navigator.clipboard.writeText(person.email).catch(() => {}))}>
            <AtSign className="size-4" /> Copy email · {person.email}
          </Command.Item>
          <Command.Item
            className={item}
            onSelect={() =>
              run(() => {
                const dark = !document.documentElement.classList.contains("dark");
                document.documentElement.classList.toggle("dark", dark);
                try {
                  localStorage.setItem("theme", dark ? "dark" : "light");
                } catch {}
              })
            }
          >
            <Moon className="size-4" /> Toggle theme
          </Command.Item>
        </Command.Group>
        <Command.Group heading="Go to" className="px-1 text-xs text-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
          {sections.map((s) => (
            <Command.Item key={s.id} className={item} onSelect={() => run(() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }))}>
              <Hash className="size-4" /> {s.label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Projects" className="px-1 text-xs text-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
          {projects.map((p) => (
            <Command.Item key={p.id} value={`${p.name} ${p.tagline}`} className={item} onSelect={() => run(() => window.open(p.live ?? p.repo ?? `#work`, "_blank"))}>
              <span className="w-4 text-center font-mono text-xs">↗</span>
              <span className="text-fg">{p.name}</span>
              <span className="truncate text-faint">{p.tagline}</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Elsewhere" className="px-1 text-xs text-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
          <Command.Item className={item} onSelect={() => run(() => window.open(person.links.github, "_blank"))}>
            <GitHubIcon /> GitHub
          </Command.Item>
          <Command.Item className={item} onSelect={() => run(() => window.open(person.links.linkedin, "_blank"))}>
            <LinkedInIcon /> LinkedIn
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
