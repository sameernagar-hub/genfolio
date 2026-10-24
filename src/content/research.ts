import type { Education, Publication, Thesis } from "./types.ts";

export const education: Education[] = [
  { id: "ms", degree: "M.S. Computer Science", org: "csuf-org", detail: "GPA 3.70 / 4.00", years: "2024 – 2026" },
  { id: "btech", degree: "B.Tech. Computer Science", org: "rgpv-org", detail: "GPA 3.66 / 4.00", years: "2018 – 2022" },
];

export const thesis: Thesis = {
  id: "thesis",
  title: "Drift-Robust, Argument-Aware Anomaly Detection with Cross-Host Generalization",
  education: "ms",
  project: "anomaly",
  result:
    "Detects anomalous OS behavior from system-call traces across hosts and drift; cut the false-positive rate from 0.886 to 0.023 at 0.847 accuracy.",
  skills: ["anomaly", "pytorch", "linux"],
};

export const publications: Publication[] = [
  {
    id: "ieee-2024",
    title: "Logistic Regression Based Approach for Human Sentiment Analysis Across Domains",
    venue: "IEEE Xplore",
    date: "Nov 2024",
    href: "https://ieeexplore.ieee.org/document/10743868",
    skills: ["ml", "python"],
  },
  {
    id: "springer-2024",
    title: "Cross Domain and Decision Tree Based Approach for Human Sentiment Analysis",
    venue: "Springer · Learning and Analytics in Intelligent Systems",
    date: "Jul 2024",
    href: "https://link.springer.com/book/10.1007/978-981-97-9855-1",
    skills: ["ml", "python"],
  },
];
