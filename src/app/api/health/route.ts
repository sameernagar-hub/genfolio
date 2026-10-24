import { providers } from "@/lib/llm";

export const dynamic = "force-dynamic";

export function GET() {
  const live = providers().map((p) => p.name);
  return Response.json({ ok: true, ai: live.length ? live : "local" });
}
