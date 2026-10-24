// Joins the content files into one graph: resolves id references, fails fast
// on dangling edges, and computes backlinks (skill -> the work that proves it).

import { awards, certifications, events } from "./achievements.ts";
import { orgs } from "./orgs.ts";
import { person, recruiter } from "./person.ts";
import { projects } from "./projects.ts";
import { education, publications, thesis } from "./research.ts";
import { roles } from "./roles.ts";
import { groupLabels, skills } from "./skills.ts";
import type { Award, Event, Org, Project, Role, Skill } from "./types.ts";

export type EvidenceKind = "role" | "project" | "certification" | "publication" | "thesis";

export type Evidence = { kind: EvidenceKind; id: string; label: string; detail: string; href?: string };

const index = <T extends { id: string }>(name: string, items: T[]) => {
  const map = new Map<string, T>();
  for (const item of items) {
    if (map.has(item.id)) throw new Error(`content graph: duplicate ${name} id "${item.id}"`);
    map.set(item.id, item);
  }
  return map;
};

const skillById = index("skill", skills);
const orgById = index("org", orgs);
const roleById = index("role", roles);
const projectById = index("project", projects);
const awardById = index("award", awards);
const eventById = index("event", events);
const educationById = index("education", education);

const need = <T>(map: Map<string, T>, id: string, from: string): T => {
  const hit = map.get(id);
  if (!hit) throw new Error(`content graph: ${from} points at missing id "${id}"`);
  return hit;
};

/** Throws on the first dangling edge. Runs at import time, so a bad edit fails the build. */
export function validate(): void {
  for (const r of roles) {
    need(orgById, r.org, `role ${r.id}`);
    r.highlights.forEach((h) => h.skills.forEach((s) => need(skillById, s, `role ${r.id}`)));
    r.projects?.forEach((p) => need(projectById, p, `role ${r.id}`));
  }
  for (const p of projects) {
    p.skills.forEach((s) => need(skillById, s, `project ${p.id}`));
    if (p.role) need(roleById, p.role, `project ${p.id}`);
    if (p.award) need(awardById, p.award, `project ${p.id}`);
    if (p.event) need(eventById, p.event, `project ${p.id}`);
  }
  for (const a of awards) need(eventById, a.event, `award ${a.id}`);
  for (const c of certifications) c.skills.forEach((s) => need(skillById, s, `certification ${c.id}`));
  for (const e of education) need(orgById, e.org, `education ${e.id}`);
  for (const p of publications) p.skills.forEach((s) => need(skillById, s, `publication ${p.id}`));
  need(educationById, thesis.education, "thesis");
  need(projectById, thesis.project, "thesis");
  thesis.skills.forEach((s) => need(skillById, s, "thesis"));
  need(roleById, person.now, "person.now");
}

validate();

export const orgOf = (role: Role): Org => orgById.get(role.org)!;
export const roleOf = (id: string) => roleById.get(id);
export const projectOf = (id: string) => projectById.get(id);
export const skillOf = (id: string): Skill | undefined => skillById.get(id);
export const awardOf = (id: string): (Award & { eventNode: Event }) | undefined => {
  const a = awardById.get(id);
  return a && { ...a, eventNode: eventById.get(a.event)! };
};
export const eventOf = (id: string) => eventById.get(id);
export const educationOrg = (id: string) => orgById.get(id)!;

/** Projects a role produced: explicit edges from either side. */
export const projectsForRole = (roleId: string): Project[] =>
  projects.filter((p) => p.role === roleId || roleById.get(roleId)?.projects?.includes(p.id));

/** Backlinks: for every skill, the concrete work that demonstrates it. */
export const evidenceBySkill: Map<string, Evidence[]> = (() => {
  const out = new Map<string, Evidence[]>(skills.map((s) => [s.id, []]));
  const add = (skillId: string, e: Evidence) => {
    const list = out.get(skillId)!;
    if (!list.some((x) => x.kind === e.kind && x.id === e.id && x.detail === e.detail)) list.push(e);
  };
  for (const r of roles) {
    const org = orgById.get(r.org)!;
    for (const h of r.highlights) {
      for (const s of h.skills) add(s, { kind: "role", id: r.id, label: `${r.title} · ${org.name}`, detail: h.text });
    }
  }
  for (const p of projects) {
    for (const s of p.skills) {
      add(s, { kind: "project", id: p.id, label: p.name, detail: p.tagline, href: p.live ?? p.repo });
    }
  }
  for (const c of certifications) {
    for (const s of c.skills) add(s, { kind: "certification", id: c.id, label: `Salesforce ${c.name}`, detail: "Certification" });
  }
  for (const p of publications) {
    for (const s of p.skills) add(s, { kind: "publication", id: p.id, label: p.venue, detail: p.title, href: p.href });
  }
  for (const s of thesis.skills) add(s, { kind: "thesis", id: thesis.id, label: "M.S. Thesis", detail: thesis.result });
  return out;
})();

/** Skills ranked by how much independent evidence backs them. */
export const rankedSkills = skills
  .map((s) => ({ ...s, groupLabel: groupLabels[s.group], weight: new Set(evidenceBySkill.get(s.id)!.map((e) => e.kind + e.id)).size }))
  .filter((s) => s.weight > 0)
  .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));

/** Plain-text serialization of the whole graph, used to ground the AI assistant. */
export function graphAsContext(): string {
  const lines: string[] = [];
  lines.push(`# ${person.name} — ${person.role}`, person.subhead, `Location: ${person.location}`, `Email: ${person.email}`);
  lines.push(`LinkedIn: ${person.links.linkedin}`, `GitHub: ${person.links.github}`, `Resume: ${person.resume}`);
  lines.push("", "## For recruiters", `Target roles: ${recruiter.targetRoles.join("; ")}`, `Availability: ${recruiter.availability}`);
  lines.push(`Work authorization: ${recruiter.workAuth}`, `Location preference: ${recruiter.location}`);
  lines.push("", "## Experience");
  for (const r of roles) {
    const org = orgById.get(r.org)!;
    lines.push(`### ${r.title}, ${org.name} (${org.location}), ${r.start} – ${r.end}`, r.summary);
    r.highlights.forEach((h) => lines.push(`- ${h.text}`));
  }
  lines.push("", "## Projects");
  for (const p of projects) {
    const award = p.award ? awardOf(p.award) : undefined;
    lines.push(`### ${p.name} (${p.year}) — ${p.tagline}`, `Problem: ${p.problem}`);
    p.built.forEach((b) => lines.push(`- ${b}`));
    lines.push(`Proof: ${p.proof}`);
    if (award) lines.push(`Award: ${award.title}, ${award.eventNode.name}`);
    lines.push(`Stack: ${p.skills.map((s) => skillById.get(s)!.label).join(", ")}`);
    if (p.repo) lines.push(`Repo: ${p.repo}`);
    if (p.live) lines.push(`Live: ${p.live}`);
  }
  lines.push("", "## Education");
  for (const e of education) lines.push(`- ${e.degree}, ${orgById.get(e.org)!.name}, ${e.years}, ${e.detail}`);
  lines.push(`- M.S. thesis: ${thesis.title}. ${thesis.result}`);
  lines.push("", "## Publications");
  publications.forEach((p) => lines.push(`- ${p.title}. ${p.venue}, ${p.date}. ${p.href}`));
  lines.push("", "## Certifications", `- Salesforce: ${certifications.map((c) => c.name).join(", ")}`);
  lines.push("", "## Awards");
  awards.forEach((a) => lines.push(`- ${a.title}, ${eventById.get(a.event)!.name}${a.year ? ` (${a.year})` : ""}`));
  lines.push("", "## Skills (with how many pieces of evidence back each)");
  for (const s of rankedSkills) lines.push(`- ${s.label} [${s.groupLabel}]: ${s.weight}`);
  return lines.join("\n");
}

export { awards, certifications, education, events, orgs, person, projects, publications, recruiter, roles, skills, thesis };
