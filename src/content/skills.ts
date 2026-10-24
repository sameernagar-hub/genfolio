import type { Skill, SkillGroup } from "./types.ts";

export const groupLabels: Record<SkillGroup, string> = {
  lang: "Languages",
  backend: "Backend",
  ai: "AI / ML",
  cloud: "Cloud & DevOps",
  data: "Data",
  frontend: "Frontend",
  salesforce: "Salesforce",
};

const s = (group: SkillGroup, entries: [string, string][]): Skill[] =>
  entries.map(([id, label]) => ({ id, label, group }));

export const skills: Skill[] = [
  ...s("lang", [
    ["java", "Java"], ["python", "Python"], ["typescript", "TypeScript"], ["javascript", "JavaScript"],
    ["go", "Go"], ["cpp", "C++"], ["c", "C"], ["sql", "SQL"], ["swift", "Swift"], ["rust", "Rust"],
  ]),
  ...s("backend", [
    ["spring", "Spring Boot 3"], ["node", "Node.js"], ["fastapi", "FastAPI"], ["flask", "Flask"],
    ["rest", "REST APIs"], ["microservices", "Microservices"], ["kafka", "Kafka / MSK"],
    ["event-driven", "Event-driven systems"], ["sse", "SSE streaming"], ["testing", "Testing & contract tests"],
  ]),
  ...s("ai", [
    ["llm", "LLMs"], ["rag", "RAG"], ["vector", "Embeddings & vector search"], ["agents", "AI agents & tool calling"],
    ["mcp", "MCP"], ["evals", "Evals & guardrails"], ["pytorch", "PyTorch"], ["ml", "Classical ML / NLP"],
    ["gemini", "Gemini / Vertex AI"], ["claude", "Claude"], ["anomaly", "Anomaly detection"],
  ]),
  ...s("cloud", [
    ["aws", "AWS"], ["eks", "AWS EKS / Kubernetes"], ["lambda", "AWS Lambda & API Gateway"], ["docker", "Docker"],
    ["cicd", "CI/CD"], ["linux", "Linux & OS internals"], ["reliability", "Monitoring & incident response"],
  ]),
  ...s("data", [
    ["postgres", "PostgreSQL / Aurora"], ["pgvector", "pgvector"], ["mysql", "MySQL"], ["mongodb", "MongoDB"],
    ["sqlite", "SQLite"], ["data-modeling", "Data modeling & query tuning"],
  ]),
  ...s("frontend", [
    ["react", "React"], ["react-native", "React Native"], ["nextjs", "Next.js"],
  ]),
  ...s("salesforce", [
    ["apex", "Apex"], ["lwc", "Lightning Web Components"], ["flows", "Flows"], ["agentforce", "Agentforce"],
    ["sf-integrations", "Salesforce integrations"],
  ]),
];
