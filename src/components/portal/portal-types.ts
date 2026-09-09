import type { LucideIcon } from "lucide-react";

// El pase semanal sustituye al antiguo acceso gratuito y SÍ se cobra, así que entra en
// PaidAccessIntent: si se quedara fuera, el portal lo trataría como alta sin checkout y
// daría una semana de acceso sin pasar por Stripe.
export type AccessIntent = "weekly" | "monthly" | "annual";
export type PaidAccessIntent = Extract<AccessIntent, "weekly" | "monthly" | "annual">;
// Solo 3 niveles seleccionables. Valores antiguos (no_se_nadar / intermedio_avanzado)
// que pudieran existir en perfiles ya guardados se reducen con normalizeSwimLevel() al leer.
export type SwimLevel = "principiante" | "intermedio" | "avanzado";
export type TrainingGoal = "aprendizaje_salud" | "preparacion_competitiva";
export type CompetitionGoal = "triatlon_sprint_olimpico" | "ironman_70_3" | "oceanman_5k_10k";
export type PerformanceMetricType = "pace_100m" | "test_200m" | "test_400m";

export type SubscriptionState = {
  status: string;
  current_period_end: string | null;
} | null;

export type ProfileAccessState = {
  access_tier: string | null;
  trial_ends_at: string | null;
  body_factory_student: boolean | null;
  created_at: string | null;
  swim_level: SwimLevel | null;
  training_goal: TrainingGoal | null;
  competition_goal: CompetitionGoal | null;
  onboarding_group_slug: string | null;
  onboarding_completed_at: string | null;
} | null;

export type PortalTrainingSession = {
  id: string;
  source_key: string | null;
  program_slug: string;
  session_date: string;
  difficulty: string;
  title: Record<string, string>;
  body: Record<string, string>;
  tags: string[] | null;
  access_scope: "portal" | "premium" | "group";
  training_session_groups: PortalTrainingSessionGroup[] | null;
};

export type PortalContentGroup = {
  id: string;
  slug: string;
  name: Record<string, string>;
  group_type: string;
};

export type PortalTrainingSessionGroup = {
  group: PortalContentGroup | null;
};

export type TrainingViewOption = {
  id: string;
  label: string;
};

export type PortalMetric = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export type PortalTrainingCompletion = {
  training_session_id: string;
  completed_at?: string | null;
  meters?: number | null;
};

export type PortalChallengeGroup = {
  key: string;
  label: string;
  sessions: PortalTrainingSession[];
  completed: number;
  planned: number;
  allCompleted: boolean;
};

export type ClientPerformanceMetric = {
  id: string;
  user_id: string;
  metric_type: PerformanceMetricType;
  measured_at: string;
  value_seconds: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type PerformanceDraft = {
  measuredAt: string;
  value: string;
};

export type PerformanceMetricConfig = {
  type: PerformanceMetricType;
  title: string;
  shortTitle: string;
  description: string;
  valueLabel: string;
  placeholder: string;
  yMinSeconds: number;
  yMaxSeconds: number;
  yTicks: number[];
  xMode: "registration_month" | "measurement_date";
  // eslint-disable-next-line no-unused-vars
  formatValue: (seconds: number) => string;
};

// Solo se ofrecen estos 3 niveles al cliente (principiante/intermedio/avanzado).
// El tipo SwimLevel mantiene los valores antiguos por compatibilidad con perfiles
// ya guardados; normalizeSwimLevel() los reduce a uno de estos 3 al leer.
export const swimLevelOptions: SwimLevel[] = ["principiante", "intermedio", "avanzado"];

export const trainingGoalOptions: TrainingGoal[] = ["aprendizaje_salud", "preparacion_competitiva"];
export const competitionGoalOptions: CompetitionGoal[] = ["triatlon_sprint_olimpico", "ironman_70_3", "oceanman_5k_10k"];
export const performanceMetricTypes: PerformanceMetricType[] = ["pace_100m", "test_200m", "test_400m"];
