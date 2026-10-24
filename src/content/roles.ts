import type { Role } from "./types.ts";

export const roles: Role[] = [
  {
    id: "saayam",
    org: "saayam-org",
    title: "GenAI Lead & Full Stack Engineer",
    start: "Jul 2026",
    end: "Present",
    current: true,
    summary: "Own the GenAI services and ship core platform microservices for a nonprofit community-help platform.",
    highlights: [
      {
        text: "Built and deployed 5 Spring Boot 3 / JDK 17 microservices with Kafka event streaming on AWS EKS, covering volunteer, request, analytics, and AI domains.",
        skills: ["java", "spring", "microservices", "kafka", "eks", "aws"],
      },
      {
        text: "Own the GenAI services (5 AWS Lambda functions behind API Gateway) and their CI/CD; rebuilt a failing deploy pipeline into a single matrix job and shipped the first green deploy in months with 31 tests passing.",
        skills: ["lambda", "cicd", "testing", "python"],
      },
      {
        text: "Debugged a silent production failure across three teams' repos by reading the live deployed bundle; added contract tests pinning the response shape and named, non-retryable schema-mismatch errors.",
        skills: ["testing", "reliability", "rest"],
      },
      {
        text: "Built LLM and RAG features with vector search, embeddings, retrieval tuning, evaluation frameworks, and production guardrails.",
        skills: ["llm", "rag", "vector", "evals"],
      },
      {
        text: "Developed React and React Native (TypeScript) applications backed by REST APIs, PostgreSQL/Aurora, and AWS Lambda, API Gateway, Cognito, and S3.",
        skills: ["react", "react-native", "typescript", "postgres", "aws"],
      },
      {
        text: "Lead technical direction: architecture decisions, sprint planning, code review, and mentoring engineers through system design and debugging.",
        skills: [],
      },
    ],
  },
  {
    id: "bigbook",
    org: "bigbook-org",
    title: "AI Engineer Intern",
    start: "Jul 2026",
    end: "Aug 2026",
    summary: "Research internship on open-source US consumer tax and bookkeeping tooling and its programmatic integration surfaces.",
    highlights: [
      {
        text: "Evaluated 4 financial platforms (GnuCash, Beancount, hledger, OpenTaxSolver) for API extensibility and integration coverage.",
        skills: ["rest", "python"],
      },
      {
        text: "Built a prototype integration layer that improved data-interchange efficiency by 20%, and published the report and open-source codebase.",
        skills: ["python", "typescript"],
      },
    ],
    projects: ["tax-tooling"],
  },
  {
    id: "csuf-ta",
    org: "csuf-org",
    title: "Teaching Associate, Operating Systems",
    start: "Aug 2024",
    end: "May 2026",
    summary: "Taught Operating Systems all four semesters, first as a student mentor and then as a Teaching Associate.",
    highlights: [
      {
        text: "Led technical instruction for 100+ CS students across advanced systems coursework: processes, threads, scheduling, interrupts, concurrency, memory, and I/O.",
        skills: ["linux", "c"],
      },
      { text: "Mentored students on algorithm design, debugging, and system troubleshooting.", skills: ["c"] },
    ],
  },
  {
    id: "unthinkable",
    org: "unthinkable-org",
    title: "Software Engineer",
    start: "Nov 2021",
    end: "May 2024",
    summary: "Shipped client-facing enterprise products end to end, from design through production support.",
    highlights: [
      {
        text: "Delivered 15+ production REST APIs and full-stack features for client-facing enterprise products, owning design through release.",
        skills: ["rest", "java", "node"],
      },
      {
        text: "Architected event-driven data pipelines and optimized MySQL and MongoDB data models, improving processing efficiency 22% and query speed 35%.",
        skills: ["event-driven", "mysql", "mongodb", "data-modeling"],
      },
      {
        text: "Owned production reliability (log analysis, incident triage, root-cause investigation, hotfixes), sustaining 99.9% uptime under SLA for 50+ enterprise clients.",
        skills: ["reliability"],
      },
      { text: "Implemented automation and orchestration across operational workflows, reducing manual effort 40%.", skills: ["cicd"] },
      {
        text: "Built custom Salesforce solutions (Apex, LWC, Flows) and third-party integrations with Field Service Lightning, Twilio, and Slack.",
        skills: ["apex", "lwc", "flows", "sf-integrations"],
      },
      {
        text: "Worked directly with clients and product stakeholders to turn business requirements into delivered technical solutions.",
        skills: [],
      },
    ],
  },
];
