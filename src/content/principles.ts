// How Sameer builds. Each principle is an opinion backed by work in the graph:
// `proof` points at project / role ids and graph.ts fails the build if one is missing.

export type Principle = { id: string; title: string; line: string; proof: { project?: string; role?: string; note: string }[] };

export const principles: Principle[] = [
  {
    id: "receipts",
    title: "Receipts over vibes.",
    line: "If a system makes a claim, it should be able to point at the evidence. I design for that from the first schema.",
    proof: [
      { project: "clarity", note: "every score cites its evidence" },
      { project: "regen", note: "resumes only claim what the Fact Bank proves" },
    ],
  },
  {
    id: "evals",
    title: "Evals before demos.",
    line: "A demo shows it can work. An eval shows how often it doesn't. I ship the second one with the first.",
    proof: [
      { project: "anomaly", note: "false positives 0.886 → 0.023" },
      { role: "saayam", note: "eval frameworks + guardrails on GenAI services" },
    ],
  },
  {
    id: "loud",
    title: "Fail loud, never silent.",
    line: "Silent failures cost the most. Contracts, named errors, and tests turn them into one-line fixes.",
    proof: [{ role: "saayam", note: "contract tests after a silent cross-team outage" }],
  },
  {
    id: "unlearn",
    title: "Memory needs an undo button.",
    line: "Agents will ingest bad facts. The fix is provenance: know what each decision came from, and revoke it cleanly.",
    proof: [{ project: "immune", note: "revocation cascade over agent memory" }],
  },
  {
    id: "speed",
    title: "Ship under pressure.",
    line: "Constraints make the product sharper. Some of my best work started on a hackathon clock.",
    proof: [
      { project: "skill-builder", note: "1st place, Agentic Dev Tools" },
      { project: "immune", note: "built in one day at MongoDB Build Fest" },
    ],
  },
];
