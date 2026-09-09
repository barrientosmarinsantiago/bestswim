import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const swimLevels = [
  "no_se_nadar",
  "principiante",
  "intermedio",
  "intermedio_avanzado",
  "avanzado"
] as const;

const trainingGoals = ["aprendizaje_salud", "preparacion_competitiva"] as const;
const competitionGoals = ["triatlon_sprint_olimpico", "ironman_70_3", "oceanman_5k_10k"] as const;
const profileAccessSelect =
  "access_tier,trial_ends_at,body_factory_student,created_at,swim_level,training_goal,competition_goal,onboarding_group_slug,onboarding_completed_at";
const premiumSubscriptionStatuses = ["active", "trialing"] as const;
const onboardingManagedGroupSlugs = [
  "nivel-principiante",
  "nivel-intermedio",
  "nivel-intermedio-avanzado",
  "nivel-avanzado",
  "oceanman-5k",
  "Premium_Triatlon",
  "Premium_Oceanman5k",
  "Premium_Oceanman10k",
  // Desafíos por nivel (primer reto del pipeline; el resto se desbloquea al completar)
  "reto-alcatraz-7km-principiante",
  "reto-alcatraz-7km-intermedio",
  "reto-alcatraz-7km-avanzado",
  "reto-triple-corona-principiante",
  "reto-triple-corona-intermedio",
  "reto-triple-corona-avanzado",
  "reto-gibraltar-14km-principiante",
  "reto-memorial-mike-28km-intermedio",
  "reto-memorial-mike-42km-avanzado"
] as const;

type SwimLevel = (typeof swimLevels)[number];
type TrainingGoal = (typeof trainingGoals)[number];
type CompetitionGoal = (typeof competitionGoals)[number];
type OnboardingAssignment = {
  primaryGroupSlug: string;
  groupSlugs: string[];
  challengeSlug: string;
};

// El reto por defecto es el primero del pipeline del nivel (Alcatraz 7K). Los
// siguientes se desbloquean automáticamente al completar todas las sesiones.
const healthOnboardingMatrix: Record<SwimLevel, { groupSlug: string; challengeSlug: string }> = {
  no_se_nadar: {
    groupSlug: "nivel-principiante",
    challengeSlug: "reto-alcatraz-7km-principiante"
  },
  principiante: {
    groupSlug: "nivel-principiante",
    challengeSlug: "reto-alcatraz-7km-principiante"
  },
  intermedio: {
    groupSlug: "nivel-intermedio",
    challengeSlug: "reto-alcatraz-7km-intermedio"
  },
  intermedio_avanzado: {
    groupSlug: "nivel-intermedio-avanzado",
    challengeSlug: "reto-alcatraz-7km-intermedio"
  },
  avanzado: {
    groupSlug: "nivel-avanzado",
    challengeSlug: "reto-alcatraz-7km-avanzado"
  }
};

function isSwimLevel(value: unknown): value is SwimLevel {
  return typeof value === "string" && swimLevels.includes(value as SwimLevel);
}

function isTrainingGoal(value: unknown): value is TrainingGoal {
  return typeof value === "string" && trainingGoals.includes(value as TrainingGoal);
}

function isCompetitionGoal(value: unknown): value is CompetitionGoal {
  return typeof value === "string" && competitionGoals.includes(value as CompetitionGoal);
}

function resolveOnboardingAssignment(
  swimLevel: SwimLevel,
  trainingGoal: TrainingGoal,
  competitionGoal: CompetitionGoal | null
): OnboardingAssignment | null {
  if (trainingGoal === "aprendizaje_salud") {
    const assignment = healthOnboardingMatrix[swimLevel];

    return {
      primaryGroupSlug: assignment.groupSlug,
      groupSlugs: [assignment.groupSlug],
      challengeSlug: assignment.challengeSlug
    };
  }

  if (!competitionGoal) {
    return null;
  }

  if (competitionGoal === "triatlon_sprint_olimpico" || competitionGoal === "ironman_70_3") {
    return {
      primaryGroupSlug: "Premium_Triatlon",
      groupSlugs: ["Premium_Triatlon"],
      challengeSlug: "reto-alcatraz-7km-intermedio"
    };
  }

  const primaryGroupSlug = swimLevel === "avanzado" ? "Premium_Oceanman10k" : "Premium_Oceanman5k";

  return {
    primaryGroupSlug,
    groupSlugs: [primaryGroupSlug, "oceanman-5k"],
    challengeSlug: swimLevel === "avanzado" ? "reto-alcatraz-7km-avanzado" : "reto-alcatraz-7km-intermedio"
  };
}

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ error: "Onboarding is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const [{ data: profile, error: profileError }, { data: subscription, error: subscriptionError }] = await Promise.all([
    admin.from("profiles").select(profileAccessSelect).eq("id", user.id).maybeSingle(),
    admin
      .from("subscriptions")
      .select("status,current_period_end")
      .eq("user_id", user.id)
      .in("status", [...premiumSubscriptionStatuses])
      .maybeSingle()
  ]);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (subscriptionError) {
    return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
  }

  return NextResponse.json(
    { profile: profile || null, subscription: subscription || null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ error: "Onboarding is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    swimLevel?: unknown;
    trainingGoal?: unknown;
    competitionGoal?: unknown;
    locale?: string;
  };

  if (!isSwimLevel(body.swimLevel) || !isTrainingGoal(body.trainingGoal)) {
    return NextResponse.json({ error: "Invalid onboarding answers." }, { status: 400 });
  }

  const competitionGoal = body.trainingGoal === "preparacion_competitiva" && isCompetitionGoal(body.competitionGoal)
    ? body.competitionGoal
    : null;

  const assignment = resolveOnboardingAssignment(body.swimLevel, body.trainingGoal, competitionGoal);

  if (!assignment) {
    return NextResponse.json({ error: "Competition goal is required for competitive preparation." }, { status: 400 });
  }

  const groupSlugs = Array.from(new Set([...assignment.groupSlugs, assignment.challengeSlug]));
  const completedAt = new Date().toISOString();

  const { data: groups, error: groupsError } = await admin
    .from("content_groups")
    .select("id,slug")
    .in("slug", groupSlugs);

  if (groupsError) {
    return NextResponse.json({ error: groupsError.message }, { status: 500 });
  }

  if (!groups || groups.length !== groupSlugs.length) {
    return NextResponse.json({ error: "Onboarding groups are not configured." }, { status: 500 });
  }

  const { data: managedGroups, error: managedGroupsError } = await admin
    .from("content_groups")
    .select("id")
    .in("slug", [...onboardingManagedGroupSlugs]);

  if (managedGroupsError) {
    return NextResponse.json({ error: managedGroupsError.message }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    email: user.email,
    locale: body.locale || "es",
    swim_level: body.swimLevel,
    training_goal: body.trainingGoal,
    competition_goal: competitionGoal,
    onboarding_group_slug: assignment.primaryGroupSlug,
    onboarding_completed_at: completedAt,
    updated_at: completedAt
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: membershipError } = await admin.from("profile_content_groups").upsert(
    groups.map((group) => ({
      profile_id: user.id,
      group_id: group.id,
      status: "active",
      assigned_at: completedAt
    })),
    { onConflict: "profile_id,group_id" }
  );

  if (membershipError) {
    return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  const activeGroupIds = new Set(groups.map((group) => group.id));
  const managedGroupIdsToRevoke = (managedGroups || [])
    .map((group) => group.id)
    .filter((groupId) => !activeGroupIds.has(groupId));

  if (managedGroupIdsToRevoke.length) {
    const { error: revokeMembershipsError } = await admin
      .from("profile_content_groups")
      .update({ status: "revoked" })
      .eq("profile_id", user.id)
      .in("group_id", managedGroupIdsToRevoke);

    if (revokeMembershipsError) {
      return NextResponse.json({ error: revokeMembershipsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    groupSlug: assignment.primaryGroupSlug,
    groupSlugs: assignment.groupSlugs,
    challengeSlug: assignment.challengeSlug,
    onboardingCompletedAt: completedAt
  });
}
