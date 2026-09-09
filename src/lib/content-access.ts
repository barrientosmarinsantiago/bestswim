import "server-only";
import type { ContentAccessLevel } from "@/content/access";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const premiumSubscriptionStatuses = ["active", "trialing"] as const;

// Single source of truth for content entitlement. Used by both the public API route and the
// server-rendered content pages so the level that gates the UI is the same one used to strip
// premium bodies before they are serialized to the browser.
export async function getServerContentAccessLevel(): Promise<ContentAccessLevel> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return "public";
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return "public";
  }

  const admin = getSupabaseAdminClient();

  if (!admin) {
    return "free";
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    admin.from("profiles").select("access_tier").eq("id", user.id).maybeSingle(),
    admin
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("user_id", user.id)
      .in("status", [...premiumSubscriptionStatuses])
      .maybeSingle()
  ]);

  const hasPremiumSubscription =
    Boolean(subscription) &&
    (!subscription?.current_period_end || new Date(subscription.current_period_end).getTime() > Date.now());
  const hasPremiumProfile = profile?.access_tier === "premium";

  return hasPremiumProfile || hasPremiumSubscription ? "premium" : "free";
}
