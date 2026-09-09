import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const premiumSubscriptionStatuses = ["active", "trialing"] as const;
const cacheTtlMs = 5 * 60 * 1000;

type CounterPayload = {
  count: number;
  free: number;
  premium: number;
  updatedAt: string;
};

let cachedCounter: { expiresAt: number; payload: CounterPayload } | null = null;

type ProfileCounterRow = {
  id: string;
  access_tier: string | null;
  trial_ends_at: string | null;
};

type SubscriptionCounterRow = {
  user_id: string;
  status: string;
};

function isActiveFreeProfile(profile: ProfileCounterRow, nowTime: number) {
  if (profile.access_tier !== "free") {
    return false;
  }

  if (!profile.trial_ends_at) {
    return true;
  }

  const trialEndTime = Date.parse(profile.trial_ends_at);
  return Number.isNaN(trialEndTime) || trialEndTime >= nowTime;
}

export async function GET() {
  const admin = getSupabaseAdminClient();
  const updatedAt = new Date().toISOString();
  const nowTime = Date.now();

  if (cachedCounter && cachedCounter.expiresAt > nowTime) {
    return NextResponse.json(cachedCounter.payload, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      }
    });
  }

  if (!admin) {
    return NextResponse.json({ count: 0, free: 0, premium: 0, updatedAt }, { status: 503 });
  }

  const [profilesResult, subscriptionsResult] = await Promise.all([
    admin.from("profiles").select("id,access_tier,trial_ends_at"),
    admin.from("subscriptions").select("user_id,status").in("status", [...premiumSubscriptionStatuses])
  ]);

  if (profilesResult.error) {
    return NextResponse.json({ error: profilesResult.error.message }, { status: 500 });
  }

  if (subscriptionsResult.error) {
    return NextResponse.json({ error: subscriptionsResult.error.message }, { status: 500 });
  }

  const profiles = (profilesResult.data || []) as ProfileCounterRow[];
  const subscriptions = (subscriptionsResult.data || []) as SubscriptionCounterRow[];
  const premiumIds = new Set<string>();

  profiles.forEach((profile) => {
    if (profile.access_tier === "premium") {
      premiumIds.add(profile.id);
    }
  });

  subscriptions.forEach((subscription) => {
    premiumIds.add(subscription.user_id);
  });

  const freeIds = new Set(
    profiles
      .filter((profile) => isActiveFreeProfile(profile, nowTime))
      .map((profile) => profile.id)
      .filter((profileId) => !premiumIds.has(profileId))
  );

  const payload = {
    count: freeIds.size + premiumIds.size,
    free: freeIds.size,
    premium: premiumIds.size,
    updatedAt
  };

  cachedCounter = {
    expiresAt: nowTime + cacheTtlMs,
    payload
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    }
  });
}
