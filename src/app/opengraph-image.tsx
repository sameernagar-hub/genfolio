import { ImageResponse } from "next/og";
import { person } from "@/content/person";

export const alt = `${person.name} · Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const chips = ["Spring Boot · Kafka · AWS", "LLM / RAG + evals", "5× Salesforce certified", "M.S. CS"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: "#07070a", color: "#f4f4f6", fontFamily: "sans-serif",
          backgroundImage: "radial-gradient(circle at 85% 10%, rgba(139,139,255,0.35), transparent 45%), radial-gradient(circle at 10% 90%, rgba(45,212,191,0.22), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a1a1ad" }}>
          <div style={{ width: 14, height: 14, borderRadius: 99, background: "#4ade80" }} />
          Open to full-time roles · San Jose, CA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3 }}>{person.name}</div>
          <div style={{ fontSize: 40, color: "#c9c9d4", maxWidth: 980 }}>{person.headline}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {chips.map((c) => (
            <div key={c} style={{ display: "flex", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 24, color: "#d4d4dc" }}>
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
