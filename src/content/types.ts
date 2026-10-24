// Node types for the content graph. Every node has an `id`; nodes point at
// each other by id (never by copying text), and src/content/graph.ts resolves
// and validates those edges at build time.

export type SkillGroup = "lang" | "backend" | "ai" | "cloud" | "data" | "frontend" | "salesforce";

export type Skill = { id: string; label: string; group: SkillGroup };

export type Link = { label: string; href: string };

export type Org = { id: string; name: string; location: string; href?: string };

export type Role = {
  id: string;
  org: string; // -> Org.id
  title: string;
  start: string;
  end: string;
  current?: boolean;
  timeline?: boolean; // false = shown as a credential, not in the experience list
  summary: string;
  impact: string[]; // 2-3 short chips shown before the role is expanded
  highlights: { text: string; skills: string[] }[]; // skills -> Skill.id
  projects?: string[]; // -> Project.id
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  year: string;
  category: "AI systems" | "Platforms" | "Research" | "Hackathon";
  problem: string;
  built: string[];
  proof: string;
  skills: string[]; // -> Skill.id
  role?: string; // -> Role.id
  award?: string; // -> Award.id
  event?: string; // -> Event.id
  repo?: string;
  live?: string;
  featured?: boolean;
};

export type Award = { id: string; title: string; event: string; year: string }; // event -> Event.id

export type Event = { id: string; name: string; place: string; date: string };

export type Certification = { id: string; name: string; skills: string[] };

export type Education = { id: string; degree: string; org: string; detail: string; years: string }; // org -> Org.id

export type Publication = { id: string; title: string; venue: string; date: string; href: string; skills: string[] };

export type Thesis = {
  id: string;
  title: string;
  education: string; // -> Education.id
  project: string; // -> Project.id
  result: string;
  skills: string[];
};
