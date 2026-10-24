<div align="center">

# Genfolio

**An AI-native portfolio where every claim links to its evidence.**

Sameer Nagar's portfolio, built on a small content graph: roles, projects, skills, research, and awards point at each other by id,
so the page can show *where* each skill was used, and the AI assistant answers only from that graph.

[Live site](https://genfolio.onrender.com) · [Resume](public/Sameer_Nagar_Resume.pdf) · [LinkedIn](https://www.linkedin.com/in/aavonsameer/) · [Email](mailto:nagarsam8989@gmail.com)

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-149eca) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8) ![Render](https://img.shields.io/badge/deploy-Render-46e3b7) ![License](https://img.shields.io/badge/license-MIT-blue)

</div>

## For recruiters (30 seconds)

| | |
|---|---|
| **Role** | Software Engineer: backend / full-stack, AI/LLM, Salesforce |
| **Now** | GenAI Lead & Full Stack Engineer, Saayam For All (5 Spring Boot microservices on AWS EKS + Kafka; owns the GenAI Lambda services and their CI/CD) |
| **Before** | Software Engineer, Unthinkable Solutions (15+ production REST APIs, 99.9% uptime under SLA for 50+ enterprise clients) |
| **Education** | M.S. Computer Science, CSUF (GPA 3.70). Thesis cut false positives 0.886 → 0.023 |
| **Proof** | 2× first-place hackathons, 5× Salesforce certified, 2 peer-reviewed papers |
| **Location** | San Jose, CA, open to relocation and onsite work |
| **Work authorization** | F-1 OPT (STEM extension eligible); will need sponsorship in the future |

**Fastest path:** open the site → *Interview my AI* or *Match your JD* → email.

## What's on the site

- **Sticky identity column** with availability, location, work authorization, resume, and a live section index.
- **Interview my AI**: a streaming assistant grounded in the content graph (Gemini when a key is set, a deterministic offline answerer otherwise). Paste a job description and it lists matching skills with the role or project behind each one.
- **Skills with receipts**: pick a skill and see the exact role, project, paper, or certification that proves it, ranked by how many independent sources back it.
- **Selected work**: filterable project cards with the problem, what was built, the proof, and live/repo links.
- **Research**: the M.S. thesis result drawn to scale, publications, education, awards.
- **Shipping**: recent public GitHub pushes, refreshed hourly with ISR (no API call per visitor).
- **⌘K command menu**, dark/light theme, reduced-motion support, OG image, JSON-LD, sitemap.

## Architecture

```
src/
├─ content/              distributed content graph (edit facts here)
│  ├─ person.ts          identity, recruiter summary, headline stats
│  ├─ roles.ts           roles -> org ids, highlight -> skill ids, project ids
│  ├─ projects.ts        projects -> skill / role / award / event ids
│  ├─ skills.ts          skill nodes + groups
│  ├─ orgs.ts            companies and schools
│  ├─ achievements.ts    awards, events, certifications
│  ├─ research.ts        education, thesis, publications
│  ├─ types.ts           node types
│  └─ graph.ts           resolves edges, fails the build on a dangling id,
│                        computes skill -> evidence backlinks, serializes
│                        the graph as the AI's grounding context
├─ lib/
│  ├─ assistant.ts       system prompt + offline answerer + JD matcher
│  ├─ rate-limit.ts      per-IP limits for /api/chat
│  └─ github.ts          hourly-cached public repo feed
├─ app/
│  ├─ page.tsx           server component: joins graph views for the UI
│  ├─ api/chat/route.ts  streams Gemini SSE as plain text; falls back offline
│  ├─ api/health         Render health check
│  └─ opengraph-image, sitemap, robots, icon
└─ components/           Sidebar, Projects, Experience, SkillGraph,
                         Research, GitHubFeed, Assistant, CommandPalette
```

**Design choices**

- **Facts live in one graph, spread across files.** Nothing on the page or in the AI prompt is typed twice. A role highlight tagged `kafka` automatically shows up as Kafka evidence and in the assistant's context.
- **The model can't drift from the page.** The system prompt is generated from the same graph the UI renders and tells the model to refuse anything not in it.
- **The API key stays server-side** and is sent in a header, never in the URL. `/api/chat` is rate-limited per IP (8/min, 60/day), caps input size, and has a 20 s timeout.
- **One Render web service.** `output: "standalone"` keeps the runtime small; the page is static with hourly revalidation.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # content-graph integrity, assistant routing, JD matching, rate limiter
npm run typecheck
npm run build && npm start
```

Copy `.env.example` to `.env.local`. Every variable is optional:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Enables live, streamed AI answers. Without it, the offline answerer is used. |
| `GEMINI_MODEL` | Defaults to `gemini-2.5-flash`. |
| `GITHUB_TOKEN` | Raises the GitHub API limit for the activity feed (read-only, public data). |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata and social cards. |

## Deploy on Render

1. Render dashboard → **New → Blueprint** → select this repository. `render.yaml` defines the `genfolio` web service.
2. Set `GEMINI_API_KEY` (optional) when Render asks for secret values.
3. Every push to `main` redeploys. The health check is `/api/health`.

The free plan sleeps when idle, so the first visit after a while takes a few seconds; a paid instance avoids that.

## Updating content

Edit the files in `src/content/`. Reference other nodes by `id`; `npm test` and `npm run build` both fail if an id doesn't resolve.
Keep claims provable: every number on the site comes from a role, project, or paper in the graph.

## License

MIT © 2026 Sameer Nagar
