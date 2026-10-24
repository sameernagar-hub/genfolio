// In-memory fixed-window limiter. The site runs as one Render instance, so a
// process-local map is enough to stop a single client from draining the model quota.

type Bucket = { minute: number; minuteCount: number; day: number; dayCount: number };

const buckets = new Map<string, Bucket>();

export const LIMITS = { perMinute: 8, perDay: 60 };

export function checkRate(key: string, now = Date.now()): { ok: boolean; retryAfter: number } {
  const minute = Math.floor(now / 60_000);
  const day = Math.floor(now / 86_400_000);
  const b = buckets.get(key) ?? { minute, minuteCount: 0, day, dayCount: 0 };
  if (b.minute !== minute) Object.assign(b, { minute, minuteCount: 0 });
  if (b.day !== day) Object.assign(b, { day, dayCount: 0 });

  if (b.dayCount >= LIMITS.perDay) return { ok: false, retryAfter: (day + 1) * 86_400 - Math.floor(now / 1000) };
  if (b.minuteCount >= LIMITS.perMinute) return { ok: false, retryAfter: (minute + 1) * 60 - Math.floor(now / 1000) };

  b.minuteCount++;
  b.dayCount++;
  buckets.set(key, b);
  if (buckets.size > 5_000) buckets.delete(buckets.keys().next().value!); // bound memory
  return { ok: true, retryAfter: 0 };
}

export function clientKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "anon";
}
