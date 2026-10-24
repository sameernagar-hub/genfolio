import { ArrowUpRight, BookOpen, GraduationCap, Trophy } from "lucide-react";
import { awards, certifications, education, educationOrg, eventOf, publications, thesis } from "@/content/graph";
import { CountUp, GrowBar } from "./motion";
import { Reveal } from "./ui";

/** Before/after bars for the thesis result, drawn to scale. */
function FprChart() {
  const rows = [
    { label: "Baseline sequence model", value: 0.886, tone: "bg-faint/50" },
    { label: "Drift-robust, argument-aware", value: 0.023, tone: "bg-accent-2" },
  ];
  return (
    <figure className="mt-6" aria-label="False-positive rate, lower is better">
      <figcaption className="mb-3 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
        <span>False-positive rate</span>
        <span>lower is better</span>
      </figcaption>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted">{r.label}</span>
              <span className="font-mono font-semibold">{r.value.toFixed(3)}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-surface-2">
              <GrowBar pct={Math.max(r.value * 100, 1.2)} className={r.tone} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-end gap-3">
        <span className="font-mono text-5xl font-semibold tracking-tight text-accent-2">
          <CountUp value="38×" />
        </span>
        <span className="pb-1.5 text-sm text-muted">fewer false alarms, at 0.847 accuracy, across hosts and drift.</span>
      </div>
    </figure>
  );
}

export function Research() {
  return (
    <div className="space-y-4">
      <Reveal>
        <article className="rounded-2xl border border-line bg-surface p-6">
          <p className="font-mono text-xs text-faint">M.S. Thesis · CSUF · 2026</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-balance">{thesis.title}</h3>
          <p className="mt-2 text-sm text-pretty text-muted">A detector that cries wolf gets muted. This one mostly doesn&apos;t.</p>
          <FprChart />
          <a
            href="https://github.com/sameernagar-hub/anomaly-detection-workbench"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            Code: Anomaly Detection Workbench <ArrowUpRight className="size-3.5" />
          </a>
        </article>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2">
        {publications.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <a href={p.href} target="_blank" rel="noreferrer" className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-faint">
              <BookOpen className="size-4 text-accent" />
              <p className="mt-3 text-sm font-medium text-pretty group-hover:underline">{p.title}</p>
              <p className="mt-auto pt-3 font-mono text-xs text-faint">
                {p.venue} · {p.date}
              </p>
            </a>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl border border-line bg-surface p-5">
            <GraduationCap className="size-4 text-accent" />
            <ul className="mt-3 space-y-3">
              {education.map((e) => (
                <li key={e.id}>
                  <p className="text-sm font-medium">{e.degree}</p>
                  <p className="text-sm text-muted">{educationOrg(e.org).name}</p>
                  <p className="font-mono text-xs text-faint">
                    {e.years} · {e.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="h-full rounded-2xl border border-line bg-surface p-5">
            <Trophy className="size-4 text-amber-500" />
            <ul className="mt-3 space-y-3">
              {awards.map((a) => (
                <li key={a.id}>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-sm text-muted">{eventOf(a.event)!.name}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Taught</p>
            <p className="mt-1 text-sm text-muted">Operating Systems at CSUF, 4 semesters, 100+ students</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">Salesforce certified ×5</p>
            <p className="mt-1 text-sm text-muted">{certifications.map((c) => c.name).join(" · ")}</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
