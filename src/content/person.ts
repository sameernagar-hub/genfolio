// Who Sameer is and what a recruiter needs in ten seconds.
// Claims here are summaries; the evidence lives in roles.ts and projects.ts.

export const person = {
  name: "Sameer Nagar",
  wordmark: "sameer.nagar",
  role: "Software Engineer",
  headline: "I build backend systems and AI products that hold up in production.",
  subhead:
    "Full-stack software engineer with 3+ years shipping production services: Spring Boot and Python microservices on AWS with Kafka, React and TypeScript front ends, and LLM / RAG systems with evaluation and guardrails.",
  location: "San Jose, CA · Bay Area",
  email: "nagarsam8989@gmail.com",
  resume: "/Sameer_Nagar_Resume.pdf",
  links: {
    github: "https://github.com/sameernagar-hub",
    linkedin: "https://www.linkedin.com/in/aavonsameer/",
    scholar: "https://scholar.google.com/citations?user=FfTfe3gAAAAJ&hl=en",
  },
  now: "saayam", // -> Role.id
};

export const recruiter = {
  targetRoles: ["Software Engineer (Backend / Full-Stack)", "AI / LLM Engineer", "Salesforce Developer"],
  availability: "Open to full-time roles, available now",
  workAuth: "Authorized to work in the US on F-1 OPT (STEM extension eligible); will need sponsorship in the future.",
  location: "San Jose, CA · open to relocation and onsite work",
  pitch:
    "Backend depth (Java/Spring Boot, Python, Kafka, AWS) plus shipped AI systems with tests and evals, 5 Salesforce certifications, an M.S. in CS, and two first-place hackathon wins.",
};

export const stats = [
  { value: "3+", label: "years shipping production software", ref: "unthinkable" },
  { value: "15+", label: "production REST APIs delivered", ref: "unthinkable" },
  { value: "99.9%", label: "uptime under SLA for 50+ enterprise clients", ref: "unthinkable" },
  { value: "5×", label: "Salesforce certified, incl. Platform Dev II", ref: "certifications" },
  { value: "2×", label: "first-place hackathon wins", ref: "awards" },
  { value: "38×", label: "fewer false alarms in my M.S. thesis (FPR 0.886 → 0.023)", ref: "anomaly" },
];

export const prompts = [
  "Why should we hire Sameer?",
  "What is his strongest backend evidence?",
  "Walk me through his AI projects.",
  "Is he a fit for a Salesforce developer role?",
  "What is his work authorization?",
];
