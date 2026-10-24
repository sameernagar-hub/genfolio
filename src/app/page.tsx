import { ArrowDownToLine, ArrowUpRight, Mail, Sparkles } from "lucide-react";
import {
  awardOf, eventOf, evidenceBySkill, orgOf, person, projects, projectsForRole, rankedSkills, roleOf, roles, skillOf,
} from "@/content/graph";
import { groupLabels } from "@/content/skills";
import { Assistant } from "@/components/Assistant";
import { AskButton } from "@/components/AskButton";
import { CommandPalette } from "@/components/CommandPalette";
import { Experience, type RoleView } from "@/components/Experience";
import { GitHubFeed } from "@/components/GitHubFeed";
import { Projects, type ProjectView } from "@/components/Projects";
import { Proof } from "@/components/Proof";
import { Research } from "@/components/Research";
import { Sidebar } from "@/components/Sidebar";
import { SkillGraph, type SkillView } from "@/components/SkillGraph";
import { CopyButton, Reveal, SectionHeader } from "@/components/ui";

// Re-render at most hourly so the GitHub feed stays fresh without an API call per visit.
export const revalidate = 3600;

export default function Home() {
  const now = roleOf(person.now)!;
  const nowLabel = `${now.title.split(" & ")[0]} at ${orgOf(now).name}`;

  const projectViews: ProjectView[] = projects.map((p) => {
    const award = p.award ? awardOf(p.award) : undefined;
    return {
      ...p,
      stackLabels: p.skills.map((s) => skillOf(s)!.label),
      awardLabel: award ? `${award.title} · ${award.eventNode.name.replace(/ \(.*\)/, "")}` : undefined,
      eventLabel: p.event ? eventOf(p.event)?.name : undefined,
    };
  });

  const roleViews: RoleView[] = roles.map((r) => {
    const org = orgOf(r);
    const stack = [...new Set(r.highlights.flatMap((h) => h.skills))].map((s) => skillOf(s)!.label).slice(0, 8);
    return {
      id: r.id,
      title: r.title,
      org: org.name,
      location: org.location,
      start: r.start,
      end: r.end,
      current: r.current,
      summary: r.summary,
      highlights: r.highlights.map((h) => h.text),
      stack,
      projects: projectsForRole(r.id).map((p) => ({ name: p.name, href: p.live ?? p.repo })),
    };
  });

  const skillViews: SkillView[] = rankedSkills
    .sort((a, b) => Object.keys(groupLabels).indexOf(a.group) - Object.keys(groupLabels).indexOf(b.group) || b.weight - a.weight)
    .map((s) => ({ id: s.id, label: s.label, group: s.groupLabel, weight: s.weight, evidence: evidenceBySkill.get(s.id)! }));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-lg focus:bg-fg focus:px-3 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <div className="grid-bg pointer-events-none fixed inset-x-0 top-0 -z-10 h-[70vh]" />
      <div className="pointer-events-none fixed -top-48 -left-40 -z-10 h-[560px] w-[760px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_18%,transparent),transparent)] blur-2xl" />

      <div className="mx-auto min-h-dvh max-w-6xl px-5 sm:px-8 lg:flex lg:justify-between lg:gap-12 lg:px-10">
        <Sidebar nowLabel={nowLabel} />

        <main id="main" className="pb-28 lg:w-[54%] lg:py-20">
          <section id="about" aria-label="About" className="scroll-mt-16">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">About</p>
              <div className="mt-4 space-y-4 text-pretty text-muted">
                <p>
                  I&apos;m a full-stack engineer who likes the unglamorous half of software: the part that has to be correct at 3 a.m. At{" "}
                  <span className="text-fg">Unthinkable Solutions</span> that meant 15+ production APIs and 99.9% uptime for 50+ enterprise clients. At{" "}
                  <span className="text-fg">Saayam For All</span> it means 5 Spring Boot microservices on EKS, the GenAI services, and the CI/CD that ships them.
                </p>
                <p>
                  On the AI side I build systems that have to show their work: a review pipeline where every score cites evidence, a memory layer that
                  un-learns poisoned facts, and a job engine that refuses to write a resume claim it can&apos;t prove. My M.S. thesis cut a detector&apos;s
                  false alarms 38×, which taught me to distrust any number without an eval behind it.
                </p>
                <p>
                  Also: 5× Salesforce certified, two first-place hackathon finishes, and four semesters teaching Operating Systems, so I can
                  explain a race condition without a whiteboard (I&apos;d still like one).
                </p>
              </div>
            </Reveal>
            <Proof />
          </section>

          <section id="work" aria-label="Selected work" className="mt-28 scroll-mt-16">
            <SectionHeader
              eyebrow="Selected work"
              title="Things you can click."
              intro="Most have a live demo. All of them have a repo, a test suite, or a trophy to explain why not."
            />
            <Projects items={projectViews} />
          </section>

          <section id="experience" aria-label="Experience" className="mt-28 scroll-mt-16">
            <SectionHeader eyebrow="Experience" title="Where the numbers came from." intro="Every metric on this page traces back to one of these roles. Click one to open it." />
            <Experience roles={roleViews} />
            <Reveal className="mt-6">
              <a href={person.resume} download className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
                <ArrowDownToLine className="size-4" /> Download the one-page resume
              </a>
            </Reveal>
          </section>

          <section id="skills" aria-label="Skills" className="mt-28 scroll-mt-16">
            <SectionHeader
              eyebrow="Skills, with receipts"
              title="Anyone can list Kafka."
              intro="Pick a skill and see exactly which role, project, paper, or certification backs it. The bars show how many independent sources there are."
            />
            <Reveal>
              <SkillGraph skills={skillViews} />
            </Reveal>
          </section>

          <section id="research" aria-label="Research" className="mt-28 scroll-mt-16">
            <SectionHeader eyebrow="Research" title="The part where I had to prove it." intro="A thesis with a number that matters, two peer-reviewed papers, and the paper trail around them." />
            <Research />
          </section>

          <section id="shipping" aria-label="Recently shipped" className="mt-28 scroll-mt-16">
            <SectionHeader eyebrow="Shipping" title="Recently pushed." intro="Pulled live from GitHub every hour. No curation, apart from hiding forks." />
            <GitHubFeed profile={person.links.github} />
          </section>

          <section id="contact" aria-label="Contact" className="mt-28 scroll-mt-16">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-7 sm:p-10">
                <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-2)_25%,transparent),transparent)]" />
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Contact</p>
                <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Hiring for backend, full-stack, or AI?</h2>
                <p className="mt-3 max-w-md text-pretty text-muted">
                  Email is the fastest way to reach me. If you&apos;d rather test me first, the AI will answer anything about my work, and it&apos;s been told not to
                  exaggerate.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${person.email}?subject=${encodeURIComponent("Opportunity for Sameer Nagar")}`}
                    className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
                  >
                    <Mail className="size-4" /> {person.email}
                  </a>
                  <AskButton className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium transition hover:bg-surface-2">
                    <Sparkles className="size-4" /> Interview my AI
                  </AskButton>
                  <a
                    href={person.links.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium transition hover:bg-surface-2"
                  >
                    LinkedIn <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
                <CopyButton value={person.email} label="copy email" className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted transition hover:text-fg" />
              </div>
            </Reveal>
          </section>

          <footer className="mt-16 text-sm text-faint">
            <p>
              Designed and built by {person.name} with Next.js, Tailwind, and Motion. No templates were harmed.{" "}
              <a href="https://github.com/sameernagar-hub/portfolio.ai" target="_blank" rel="noreferrer" className="underline-offset-4 hover:text-fg hover:underline">
                Genfolio source
              </a>
              . Press <kbd className="rounded border border-line px-1 font-mono text-xs">⌘K</kbd> for shortcuts.
            </p>
          </footer>
        </main>
      </div>

      <Assistant />
      <CommandPalette projects={projects.map(({ id, name, tagline, live, repo }) => ({ id, name, tagline, live, repo }))} />
    </>
  );
}
