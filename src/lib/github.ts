// Live GitHub activity. Fetched on the server and cached for an hour (ISR),
// so visitors never hit the GitHub API and the 60 req/h anonymous limit is safe.

import { person } from "../content/person.ts";

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
};

const user = person.links.github.split("/").pop()!;

export async function recentRepos(limit = 6): Promise<Repo[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?sort=pushed&per_page=30&type=owner`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<Record<string, unknown>>;
    return data
      .filter((r) => !r.fork && !r.private && r.name !== user)
      .slice(0, limit)
      .map((r) => ({
        name: String(r.name),
        description: (r.description as string) ?? null,
        url: String(r.html_url),
        homepage: (r.homepage as string) || null,
        language: (r.language as string) ?? null,
        stars: Number(r.stargazers_count ?? 0),
        pushedAt: String(r.pushed_at),
      }));
  } catch {
    return [];
  }
}
