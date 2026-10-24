export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, ai: process.env.GEMINI_API_KEY ? "live" : "local" });
}
