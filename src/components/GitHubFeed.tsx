import { ArrowUpRight, Star } from "lucide-react";
import { recentRepos } from "@/lib/github";
import { GitHubIcon } from "./icons";
import { Reveal } from "./ui";

const ago = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(months / 12)}y ago`;
};

export async function GitHubFeed({ profile }: { profile: string }) {
  const repos = await recentRepos(6);
  if (repos.length === 0) {
    return (
      <a href={profile} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-5 text-sm hover:border-faint">
        <GitHubIcon /> See everything on GitHub <ArrowUpRight className="size-3.5" />
      </a>
    );
  }
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {repos.map((r, i) => (
        <Reveal key={r.name} delay={i * 0.04}>
          <li>
            <a href={r.url} target="_blank" rel="noreferrer" className="group flex items-start gap-4 px-5 py-4 transition hover:bg-surface-2">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-mono text-sm font-medium">
                  {r.name}
                  <ArrowUpRight className="size-3.5 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
                </p>
                {r.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{r.description}</p>}
              </div>
              <div className="shrink-0 text-right font-mono text-xs text-faint">
                <p>{ago(r.pushedAt)}</p>
                <p className="mt-1 flex items-center justify-end gap-2">
                  {r.language}
                  {r.stars > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3" />
                      {r.stars}
                    </span>
                  )}
                </p>
              </div>
            </a>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}
