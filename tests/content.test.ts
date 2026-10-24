import assert from "node:assert/strict";
import { test } from "node:test";
import { evidenceBySkill, graphAsContext, projects, rankedSkills, roles, validate } from "../src/content/graph.ts";
import { localAnswer, matchJobDescription } from "../src/lib/assistant.ts";
import { checkRate, LIMITS } from "../src/lib/rate-limit.ts";

test("content graph has no dangling edges", () => {
  assert.doesNotThrow(validate);
});

test("every role and project contributes evidence to at least one skill", () => {
  const sources = new Set([...evidenceBySkill.values()].flat().map((e) => `${e.kind}:${e.id}`));
  for (const r of roles) assert.ok(sources.has(`role:${r.id}`), `role ${r.id} backs no skill`);
  for (const p of projects) assert.ok(sources.has(`project:${p.id}`), `project ${p.id} backs no skill`);
});

test("skills are ranked by independent evidence", () => {
  for (let i = 1; i < rankedSkills.length; i++) assert.ok(rankedSkills[i - 1].weight >= rankedSkills[i].weight);
});

test("AI context carries the key facts and no phone number", () => {
  const ctx = graphAsContext();
  for (const fact of ["99.9%", "15+ production REST APIs", "0.886", "Platform Developer II", "F-1 OPT"]) assert.ok(ctx.includes(fact), fact);
  assert.ok(!/\+1 \(\d{3}\)/.test(ctx), "phone number leaked into the AI context");
});

test("local answers: 'hire' and 'this' no longer trigger the greeting", () => {
  assert.match(localAnswer("Why should we hire Sameer?"), /Why Sameer/);
  assert.doesNotMatch(localAnswer("Compare Sameer to this role"), /^Hi!/);
  assert.match(localAnswer("hi"), /^Hi!/);
});

test("local answers route recruiter questions", () => {
  assert.match(localAnswer("What is his work authorization?"), /OPT/);
  assert.match(localAnswer("What is his strongest backend evidence?"), /Backend evidence/);
  assert.match(localAnswer("Is he a fit for a Salesforce developer role?"), /Salesforce/);
});

test("job description matching finds evidenced skills", () => {
  const jd = "We need a backend engineer with Java, Spring Boot, Kafka, Kubernetes, and PostgreSQL. Experience with RAG and LLM agents is a plus.";
  const ids = matchJobDescription(jd).map((m) => m.skill.id);
  for (const id of ["java", "spring", "kafka", "eks", "postgres", "rag", "llm"]) assert.ok(ids.includes(id), id);
});

test("rate limiter blocks after the per-minute limit", () => {
  const key = `test-${Math.random()}`;
  const t = Date.UTC(2026, 0, 1, 12, 0, 5);
  for (let i = 0; i < LIMITS.perMinute; i++) assert.equal(checkRate(key, t).ok, true);
  const blocked = checkRate(key, t);
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
  assert.equal(checkRate(key, t + 60_000).ok, true);
});

import { geminiText, openAiText, providers, sseData } from "../src/lib/llm.ts";

test("providers: none without keys, placeholders ignored, AI_PROVIDER sets order", () => {
  assert.deepEqual(providers({}), []);
  assert.deepEqual(providers({ GEMINI_API_KEY: "paste-your-gemini-key-here", GROQ_API_KEY: "paste-your-groq-key-here" }), []);
  const both = { GEMINI_API_KEY: "g", GROQ_API_KEY: "q" };
  assert.deepEqual(providers(both).map((p) => p.name), ["gemini", "groq"]);
  assert.deepEqual(providers({ ...both, AI_PROVIDER: "groq" }).map((p) => p.name), ["groq", "gemini"]);
  assert.equal(providers({ GROQ_API_KEY: "q" })[0].model, "openai/gpt-oss-120b");
});

test("SSE parsing for Gemini and OpenAI-compatible (Groq) frames", async () => {
  const raw = 'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\ndata: {"choices":[{"delta":{"content":"lo"}}]}\n\ndata: [DONE]\n\n';
  const body = new Blob([raw]).stream();
  const frames: string[] = [];
  for await (const f of sseData(body)) frames.push(f);
  assert.equal(frames.map(openAiText).join(""), "Hello");
  assert.equal(geminiText('{"candidates":[{"content":{"parts":[{"text":"Hi "},{"text":"there"}]}}]}'), "Hi there");
  assert.equal(openAiText("not json"), "");
});

import { BUSY_NOTE, CANARY, leaks, SYSTEM_INSTRUCTION } from "../src/lib/assistant.ts";
import { answerCache } from "../src/lib/cache.ts";

test("guardrails: prompt carries the canary and rules; leak detector catches echoes", () => {
  assert.ok(SYSTEM_INSTRUCTION.includes(CANARY));
  assert.ok(leaks(SYSTEM_INSTRUCTION.slice(0, 300)), "echoing the opening of the prompt must be caught");
  assert.ok(!leaks("Sameer built 5 Spring Boot microservices on EKS."));
  assert.ok(BUSY_NOTE.endsWith("\n\n"));
});

test("answer cache normalizes questions and expires", () => {
  const t = 1_000_000;
  answerCache.set("Why should we hire Sameer?", { text: "because", provider: "gemini" }, t);
  assert.equal(answerCache.get("why should we HIRE sameer", t + 1000)?.text, "because");
  assert.equal(answerCache.get("why should we hire sameer", t + 7 * 3600_000), undefined);
});
