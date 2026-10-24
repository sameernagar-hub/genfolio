import type { Award, Certification, Event } from "./types.ts";

export const events: Event[] = [
  { id: "ai-nexus", name: "Agentic Dev Tools Hackathon (AI Nexus)", place: "San Francisco", date: "Jun 2026" },
  { id: "memory-motion", name: "Memory Meets Motion Hackathon", place: "", date: "" },
  { id: "mongodb-buildfest", name: "MongoDB .local Build Fest: Persistent Context Sprint", place: "San Francisco", date: "Aug 2026" },
];

export const awards: Award[] = [
  { id: "agentic-devtools", title: "1st Place", event: "ai-nexus", year: "2026" },
  { id: "rocketride", title: "1st Place, Best Use of RocketRide", event: "memory-motion", year: "" },
];

export const certifications: Certification[] = [
  { id: "sf-pd2", name: "Platform Developer II", skills: ["apex", "lwc"] },
  { id: "sf-pd1", name: "Platform Developer I", skills: ["apex", "lwc"] },
  { id: "sf-adv-admin", name: "Advanced Administrator", skills: ["flows"] },
  { id: "sf-admin", name: "Administrator", skills: ["flows"] },
  { id: "sf-agentforce", name: "Agentforce Specialist", skills: ["agentforce", "agents"] },
];
