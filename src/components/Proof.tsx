import { stats } from "@/content/person";
import { rankedSkills } from "@/content/graph";
import { CountUp } from "./motion";
import { Reveal } from "./ui";

/** Numbers grid + a marquee of the most-evidenced skills. */
export function Proof() {
  const marquee = rankedSkills.slice(0, 22).map((s) => s.label);
  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface/50">
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.04} className="bg-surface px-4 py-5">
            <p className="font-mono text-xl font-semibold tracking-tight sm:text-2xl">
              <CountUp value={s.value} />
            </p>
            <p className="mt-1 text-xs leading-snug text-muted sm:text-[13px]">{s.label}</p>
          </Reveal>
        ))}
      </div>
      <div className="relative overflow-hidden border-t border-line py-3 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-7 hover:[animation-play-state:paused]">
          {[...marquee, ...marquee].map((label, i) => (
            <span key={i} className="font-mono text-xs whitespace-nowrap text-faint" aria-hidden={i >= marquee.length}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
