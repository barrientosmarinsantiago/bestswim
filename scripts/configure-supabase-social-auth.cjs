const projectRef = process.env.SUPABASE_PROJECT_REF || "nfsfxnjygfpnizxeyfod";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const dryRun = process.argv.includes("--dry-run");

const payload = {};

if (process.env.SUPABASE_AUTH_FACEBOOK_CLIENT_ID && process.env.SUPABASE_AUTH_FACEBOOK_SECRET) {
  payload.external_facebook_enabled = true;
  payload.external_facebook_client_id = process.env.SUPABASE_AUTH_FACEBOOK_CLIENT_ID;
  payload.external_facebook_secret = process.env.SUPABASE_AUTH_FACEBOOK_SECRET;
}

if (process.env.SUPABASE_AUTH_APPLE_CLIENT_ID && process.env.SUPABASE_AUTH_APPLE_SECRET) {
  payload.external_apple_enabled = true;
  payload.external_apple_client_id = process.env.SUPABASE_AUTH_APPLE_CLIENT_ID;
  payload.external_apple_secret = process.env.SUPABASE_AUTH_APPLE_SECRET;
}

function maskPayload(value) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      key.includes("secret") && typeof entry === "string" ? `${entry.slice(0, 4)}...${entry.slice(-4)}` : entry
    ])
  );
}

async function main() {
  if (!Object.keys(payload).length) {
    throw new Error("No provider credentials found. Set SUPABASE_AUTH_FACEBOOK_* and/or SUPABASE_AUTH_APPLE_* env vars.");
  }

  if (dryRun) {
    console.log(JSON.stringify({ projectRef, payload: maskPayload(payload) }, null, 2));
    return;
  }

  if (!accessToken) {
    throw new Error("Missing SUPABASE_ACCESS_TOKEN. Create one in Supabase account tokens before running this script.");
  }

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase Auth config update failed (${response.status}): ${body}`);
  }

  console.log(JSON.stringify({ ok: true, projectRef, configured: Object.keys(payload).filter((key) => key.endsWith("_enabled")) }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
