import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_LENGTHS = { name: 120, email: 200, goal: 200, message: 4000 } as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort in-memory rate limit, per Node instance. For multi-instance/serverless,
// back this with Supabase or Redis (see task #3).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

function sanitizeField(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Contact storage is not configured." }, { status: 503 });
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: {
    name?: unknown;
    email?: unknown;
    goal?: unknown;
    message?: unknown;
    locale?: unknown;
    company?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Pretend success to avoid tipping off bots.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = sanitizeField(body.name, MAX_LENGTHS.name);
  const email = sanitizeField(body.email, MAX_LENGTHS.email);
  const goal = sanitizeField(body.goal, MAX_LENGTHS.goal);
  const message = sanitizeField(body.message, MAX_LENGTHS.message);
  const locale = sanitizeField(body.locale, 5) || "es";

  if (!name || !email || !goal || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const { error } = await supabase.from("leads").insert({ name, email, goal, message, locale });

  if (error) {
    return NextResponse.json({ error: "Could not store the message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
