"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  Apple,
  BarChart3,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Gauge,
  Globe2,
  Layers3,
  LogOut,
  Mail,
  Target,
  Trophy,
  Waves
} from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PortalButton } from "@/components/billing/portal-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  AccessIntent,
  ClientPerformanceMetric,
  CompetitionGoal,
  PerformanceDraft,
  PerformanceMetricType,
  PortalChallengeGroup,
  PortalContentGroup,
  PortalMetric,
  PortalTrainingCompletion,
  PortalTrainingSession,
  ProfileAccessState,
  SubscriptionState,
  SwimLevel,
  TrainingGoal,
  TrainingViewOption
} from "@/components/portal/portal-types";
import {
  getAccessCopy,
  getChallengeCopy,
  getCompletionCopy,
  getDashboardCopy,
  getOnboardingCopy,
  getPaymentCopy,
  getPerformanceCopy,
  getProgressCopy,
  getTrainingViewCopy
} from "@/components/portal/portal-copy";
import {
  todayDateKey,
  getInitialPerformanceDrafts,
  localizedJson,
  getSessionGroups,
  isChallengeSession,
  getChallengeKey,
  getChallengeLabel,
  getSessionOrder,
  isAccessIntent,
  isPaidAccessIntent,
  parseTimeInput,
  getPerformanceConfigs,
  extractMetersFromSession,
  parseSessionDate,
  startOfWeek,
  endOfWeek,
  isBetween,
  formatWeekRange,
  getTagValue,
  resolveOnboardingSessionDate,
  getWeekIndexFromOnboarding,
  getWeeklyDrills,
  formatKm,
  progressPercent,
  normalizeSwimLevel
} from "@/components/portal/portal-utils";
import {
  PerformanceDashboard,
  PerformanceMetricModal
} from "@/components/portal/portal-performance";

import {
  getAuthRedirectOrigin,
  getNormalizedLocalhostHref
} from "@/components/portal/portal-loader";
import {
  ProgressMeter,
  PortalQuoteTicker,
  PortalSessionCard,
  OnboardingQuestionnaire
} from "@/components/portal/portal-components";
import { ProgressDashboard } from "@/components/portal/portal-progress";

// Componentes de hoja en ./portal-components.tsx

export function ClientPortal({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState>(null);
  const [profileAccess, setProfileAccess] = useState<ProfileAccessState>(null);
  const [trainingSessions, setTrainingSessions] = useState<PortalTrainingSession[]>([]);
  const [completionRecords, setCompletionRecords] = useState<PortalTrainingCompletion[]>([]);
  const completedSessionIds = useMemo(
    () => completionRecords.map((item) => item.training_session_id),
    [completionRecords]
  );
  const [pendingCompletionIds, setPendingCompletionIds] = useState<string[]>([]);
  const [performanceEntries, setPerformanceEntries] = useState<ClientPerformanceMetric[]>([]);
  const [performanceDrafts, setPerformanceDrafts] = useState<Record<PerformanceMetricType, PerformanceDraft>>(getInitialPerformanceDrafts);
  const [savingPerformanceTypes, setSavingPerformanceTypes] = useState<PerformanceMetricType[]>([]);
  const [selectedPerformanceType, setSelectedPerformanceType] = useState<PerformanceMetricType>("pace_100m");
  const [expandedPerformanceType, setExpandedPerformanceType] = useState<PerformanceMetricType | null>(null);
  const [selectedTrainingView, setSelectedTrainingView] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState<AccessIntent>("weekly");
  const [selectedSwimLevel, setSelectedSwimLevel] = useState<SwimLevel>("principiante");
  const [selectedTrainingGoal, setSelectedTrainingGoal] = useState<TrainingGoal>("aprendizaje_salud");
  const [selectedCompetitionGoal, setSelectedCompetitionGoal] = useState<CompetitionGoal>("triatlon_sprint_olimpico");
  const [onboardingEditorOpen, setOnboardingEditorOpen] = useState(false);
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  // Sin inicializar con supabaseMissing: ese aviso ya lo pinta su propio bloque cuando
  // falta Supabase, y duplicarlo aqui sacaba el mismo parrafo dos veces. Este estado es
  // para los mensajes transitorios del login.
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const accessCopy = getAccessCopy(locale);
  const dashboardCopy = getDashboardCopy(locale);
  const paymentCopy = useMemo(() => getPaymentCopy(locale), [locale]);
  const onboardingCopy = getOnboardingCopy(locale);
  const trainingViewCopy = getTrainingViewCopy(locale);
  const completionCopy = getCompletionCopy(locale);
  const challengeCopy = getChallengeCopy(locale);
  const progressCopy = getProgressCopy(locale);
  const performanceCopy = getPerformanceCopy(locale);
  const performanceConfigs = useMemo(() => getPerformanceConfigs(performanceCopy), [performanceCopy]);

  useEffect(() => {
    const normalizedHref = getNormalizedLocalhostHref(window.location.href);

    if (normalizedHref) {
      window.location.replace(normalizedHref);
    }
  }, []);

  const accessOptions = useMemo(
    () => [
      {
        id: "weekly" as const,
        title: dictionary.pricing.weeklyPass.name,
        detail: dictionary.pricing.weeklyPass.price
      },
      {
        id: "monthly" as const,
        title: dictionary.pricing.monthly,
        detail: dictionary.pricing.monthlyFallback
      },
      {
        id: "annual" as const,
        title: dictionary.pricing.annual,
        detail: dictionary.pricing.annualFallback
      }
    ],
    [
      dictionary.pricing.annual,
      dictionary.pricing.annualFallback,
      dictionary.pricing.weeklyPass.name,
      dictionary.pricing.weeklyPass.price,
      dictionary.pricing.monthly,
      dictionary.pricing.monthlyFallback
    ]
  );
  const selectedAccessOption = accessOptions.find((option) => option.id === selectedAccess) || accessOptions[0];
  const selectedPaidPlan = isPaidAccessIntent(selectedAccess) ? selectedAccess : null;
  const hasCompletedOnboarding = Boolean(
    profileAccess?.onboarding_completed_at || (profileAccess?.swim_level && profileAccess?.training_goal)
  );
  const onboardingCompletedAt =
    profileAccess?.onboarding_completed_at || (hasCompletedOnboarding ? profileAccess?.created_at || null : null);
  const onboardingRequired = Boolean(session && !loading && !hasCompletedOnboarding);
  const onboardingExpanded = onboardingRequired || onboardingEditorOpen;
  const selectedCompetitionLabel =
    selectedTrainingGoal === "preparacion_competitiva" ? onboardingCopy.competitionGoals[selectedCompetitionGoal] : null;
  const performanceRegistrationDate = profileAccess?.created_at || onboardingCompletedAt;
  const scheduledTrainingSessions = useMemo(
    () =>
      trainingSessions.map((item) => ({
        ...item,
        session_date: resolveOnboardingSessionDate(item, onboardingCompletedAt)
      })),
    [onboardingCompletedAt, trainingSessions]
  );
  const currentWeekRange = useMemo(() => {
    const today = new Date();
    return {
      start: startOfWeek(today),
      end: endOfWeek(today)
    };
  }, []);
  const currentWeekRangeLabel = useMemo(
    () => formatWeekRange(currentWeekRange.start, currentWeekRange.end, locale),
    [currentWeekRange.end, currentWeekRange.start, locale]
  );
  const weeklyDrills = useMemo(() => getWeeklyDrills(onboardingCompletedAt), [onboardingCompletedAt]);
  const planTrainingSessions = useMemo(
    () =>
      scheduledTrainingSessions
        .filter((item) => !isChallengeSession(item))
        .sort((first, second) => {
          const firstDate = parseSessionDate(first.session_date).getTime();
          const secondDate = parseSessionDate(second.session_date).getTime();
          return firstDate === secondDate ? getSessionOrder(first) - getSessionOrder(second) : firstDate - secondDate;
        }),
    [scheduledTrainingSessions]
  );
  const currentWeekTrainingSessions = useMemo(
    () => planTrainingSessions.filter((item) => isBetween(parseSessionDate(item.session_date), currentWeekRange.start, currentWeekRange.end)),
    [currentWeekRange.end, currentWeekRange.start, planTrainingSessions]
  );
  const activeWeekTrainingSessions = useMemo(() => {
    if (currentWeekTrainingSessions.length) {
      return currentWeekTrainingSessions;
    }

    if (!onboardingCompletedAt) {
      return [];
    }

    const onboardingWeekNumber = getWeekIndexFromOnboarding(onboardingCompletedAt) + 1;

    if (onboardingWeekNumber > 2) {
      return [];
    }

    const onboardingWeekSessions = planTrainingSessions.filter(
      (item) => item.tags?.includes("onboarding") && getTagValue(item.tags, "onboarding-week-") === String(onboardingWeekNumber)
    );

    if (onboardingWeekSessions.length) {
      return onboardingWeekSessions;
    }

    const fallbackStart = (onboardingWeekNumber - 1) * 3;
    const fallbackSessions = planTrainingSessions.slice(fallbackStart, fallbackStart + 3);
    return fallbackSessions.length ? fallbackSessions : planTrainingSessions.slice(0, 3);
  }, [currentWeekTrainingSessions, onboardingCompletedAt, planTrainingSessions]);
  const visibleWeekTrainingSessions = useMemo(() => activeWeekTrainingSessions.slice(0, 3), [activeWeekTrainingSessions]);
  const challengeSessions = useMemo(
    () => scheduledTrainingSessions.filter(isChallengeSession).sort((first, second) => getSessionOrder(first) - getSessionOrder(second)),
    [scheduledTrainingSessions]
  );
  const challengeGroups = useMemo<PortalChallengeGroup[]>(() => {
    const completedSet = new Set(completedSessionIds);
    const groupMap = new Map<string, PortalTrainingSession[]>();

    challengeSessions.forEach((item) => {
      const key = getChallengeKey(item);
      groupMap.set(key, [...(groupMap.get(key) || []), item]);
    });

    return Array.from(groupMap.entries())
      .map(([key, sessions]) => {
        const sortedSessions = [...sessions].sort((first, second) => getSessionOrder(first) - getSessionOrder(second));
        const completed = sortedSessions.filter((item) => completedSet.has(item.id)).length;

        return {
          key,
          label: getChallengeLabel(key, sortedSessions, locale),
          sessions: sortedSessions,
          completed,
          planned: sortedSessions.length,
          allCompleted: sortedSessions.length > 0 && completed === sortedSessions.length
        };
      })
      .sort((first, second) => first.label.localeCompare(second.label));
  }, [challengeSessions, completedSessionIds, locale]);
  const trainingViewOptions = useMemo<TrainingViewOption[]>(() => {
    const groupMap = new Map<string, PortalContentGroup>();

    visibleWeekTrainingSessions.forEach((item) => {
      getSessionGroups(item)
        .filter((group) => group.group_type !== "challenge")
        .forEach((group) => groupMap.set(group.slug, group));
    });

    const groupOptions = Array.from(groupMap.values())
      .sort((first, second) =>
        (localizedJson(first.name, locale) || first.slug).localeCompare(localizedJson(second.name, locale) || second.slug)
      )
      .map((group) => ({
        id: `group:${group.slug}`,
        label: localizedJson(group.name, locale) || group.slug
      }));

    return [
      { id: "all", label: trainingViewCopy.all },
      { id: "general", label: trainingViewCopy.general },
      ...groupOptions
    ];
  }, [locale, trainingViewCopy.all, trainingViewCopy.general, visibleWeekTrainingSessions]);
  const activeTrainingView = trainingViewOptions.find((option) => option.id === selectedTrainingView) || trainingViewOptions[0];
  const activeTrainingViewId = activeTrainingView.id;
  const filteredTrainingSessions = useMemo(() => {
    if (activeTrainingViewId === "all") {
      return visibleWeekTrainingSessions;
    }

    if (activeTrainingViewId === "general") {
      return visibleWeekTrainingSessions.filter((item) => item.access_scope !== "group");
    }

    const groupSlug = activeTrainingViewId.replace("group:", "");
    return visibleWeekTrainingSessions.filter((item) => getSessionGroups(item).some((group) => group.slug === groupSlug));
  }, [activeTrainingViewId, visibleWeekTrainingSessions]);
  const dashboardStats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const completedSet = new Set(completedSessionIds);

    const enrichSession = (item: PortalTrainingSession) => {
      const date = parseSessionDate(item.session_date);
      const meters = extractMetersFromSession(item, locale);

      return {
        item,
        date,
        meters,
        completed: completedSet.has(item.id)
      };
    };
    const enrichedSessions = planTrainingSessions.map(enrichSession);
    const visibleWeekEnrichedSessions = visibleWeekTrainingSessions.map(enrichSession);

    const weekSessions = visibleWeekEnrichedSessions;
    const monthSessions = enrichedSessions.filter(({ date }) => isBetween(date, monthStart, monthEnd));
    const yearSessions = enrichedSessions.filter(({ date }) => isBetween(date, yearStart, yearEnd));
    const completedWeek = weekSessions.filter(({ completed }) => completed);
    const completedMonth = monthSessions.filter(({ completed }) => completed);
    const completedYear = yearSessions.filter(({ completed }) => completed);
    const uniqueGroups = new Map<string, PortalContentGroup>();

    trainingSessions.forEach((item) => {
      getSessionGroups(item).forEach((group) => {
        uniqueGroups.set(group.slug, group);
      });
    });

    const nextSession = visibleWeekEnrichedSessions
      .filter(({ completed }) => !completed)
      .sort((first, second) => first.date.getTime() - second.date.getTime())[0];

    return {
      week: {
        planned: weekSessions.length,
        completed: completedWeek.length,
        meters: completedWeek.reduce((total, sessionItem) => total + sessionItem.meters, 0)
      },
      month: {
        planned: monthSessions.length,
        completed: completedMonth.length,
        meters: completedMonth.reduce((total, sessionItem) => total + sessionItem.meters, 0)
      },
      year: {
        planned: yearSessions.length,
        completed: completedYear.length,
        meters: completedYear.reduce((total, sessionItem) => total + sessionItem.meters, 0)
      },
      activeGroups: uniqueGroups.size,
      completedChallenges: challengeGroups.filter((challenge) => challenge.allCompleted).length,
      nextSession: nextSession?.item || null
    };
  }, [challengeGroups, completedSessionIds, locale, planTrainingSessions, trainingSessions, visibleWeekTrainingSessions]);
  const challengeSessionProgress = challengeGroups.reduce(
    (total, challenge) => ({
      completed: total.completed + challenge.completed,
      planned: total.planned + challenge.planned
    }),
    { completed: 0, planned: 0 }
  );
  const portalMetrics: PortalMetric[] = [
    {
      label: dashboardCopy.completed,
      value: `${dashboardStats.week.completed}/${dashboardStats.week.planned}`,
      detail: dashboardCopy.weeklyProgress,
      icon: CheckCircle2
    },
    {
      label: dashboardCopy.volumeWeek,
      value: formatKm(dashboardStats.week.meters),
      detail: dashboardCopy.estimatedFromSessions,
      icon: Activity
    },
    {
      label: dashboardCopy.volumeMonth,
      value: formatKm(dashboardStats.month.meters),
      detail: `${dashboardStats.month.completed}/${dashboardStats.month.planned} ${dashboardCopy.planned}`,
      icon: BarChart3
    },
    {
      label: dashboardCopy.volumeYear,
      value: formatKm(dashboardStats.year.meters),
      detail: `${dashboardStats.year.completed}/${dashboardStats.year.planned} ${dashboardCopy.planned}`,
      icon: Target
    },
    {
      label: dashboardCopy.activeGroups,
      value: String(dashboardStats.activeGroups),
      detail: dashboardStats.nextSession ? localizedJson(dashboardStats.nextSession.title, locale) : dashboardCopy.nextFocus,
      icon: Layers3
    },
    {
      label: dashboardCopy.challenges,
      value: String(dashboardStats.completedChallenges),
      detail: challengeSessionProgress.planned
        ? `${challengeSessionProgress.completed}/${challengeSessionProgress.planned} ${challengeCopy.sessions}`
        : dashboardCopy.estimatedFromSessions,
      icon: Trophy
    }
  ];
  const weeklyPercent = progressPercent(dashboardStats.week.completed, dashboardStats.week.planned);
  const monthlyPercent = progressPercent(dashboardStats.month.completed, dashboardStats.month.planned);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    async function loadSession() {
      const authError = new URLSearchParams(window.location.search).get("auth_error");
      setStatusMessage(authError);

      const accessFromUrl = new URLSearchParams(window.location.search).get("access");
      const accessFromStorage = window.localStorage.getItem("bestswim-access-intent");
      const checkoutStatus = new URLSearchParams(window.location.search).get("checkout");
      const accessIntent = isAccessIntent(accessFromUrl)
        ? accessFromUrl
        : isAccessIntent(accessFromStorage)
          ? accessFromStorage
          : null;

      if (accessIntent) {
        setSelectedAccess(accessIntent);
      }

      if (checkoutStatus === "success") {
        setStatusMessage(paymentCopy.checkoutSuccess);
        window.localStorage.removeItem("bestswim-access-intent");
      } else if (checkoutStatus === "cancelled") {
        setStatusMessage(paymentCopy.checkoutCancelled);
      }

      const {
        data: { session: activeSession },
        error
      } = await client.auth.getSession();

      if (error) {
        setStatusMessage(error.message);
      }

      setSession(activeSession);
      await syncProfileAndSubscription(activeSession);
      await loadTrainingSessions(activeSession);
      await loadTrainingCompletions(activeSession);
      await loadPerformanceEntries(activeSession);
      setLoading(false);
    }

    async function syncProfileAndSubscription(activeSession: Session | null) {
      if (!activeSession) {
        setSubscription(null);
        setProfileAccess(null);
        return;
      }

      const applyProfileAccess = (nextProfileAccess: ProfileAccessState) => {
        setProfileAccess(nextProfileAccess);

        if (nextProfileAccess?.swim_level) {
          setSelectedSwimLevel(normalizeSwimLevel(nextProfileAccess.swim_level));
        }

        if (nextProfileAccess?.training_goal) {
          setSelectedTrainingGoal(nextProfileAccess.training_goal);
        }

        if (nextProfileAccess?.competition_goal) {
          setSelectedCompetitionGoal(nextProfileAccess.competition_goal);
        }
      };

      const portalStateResponse = await fetch("/api/portal/onboarding", {
        cache: "no-store",
        credentials: "same-origin"
      }).catch(() => null);

      if (portalStateResponse?.ok) {
        const portalState = (await portalStateResponse.json().catch(() => ({}))) as {
          profile?: ProfileAccessState;
          subscription?: SubscriptionState;
        };

        applyProfileAccess(portalState.profile || null);
        setSubscription(portalState.subscription || null);
        return;
      }

      const { data: profileData, error: profileError } = await client
        .from("profiles")
        .select(
          "access_tier,trial_ends_at,body_factory_student,created_at,swim_level,training_goal,competition_goal,onboarding_group_slug,onboarding_completed_at"
        )
        .eq("id", activeSession.user.id)
        .maybeSingle();

      if (profileError) {
        setProfileAccess(null);
      } else {
        const nextProfileAccess = (profileData as ProfileAccessState) || null;
        applyProfileAccess(nextProfileAccess);
      }

      const { data, error: subscriptionError } = await client
        .from("subscriptions")
        .select("status,current_period_end")
        .eq("user_id", activeSession.user.id)
        .in("status", ["active", "trialing"])
        .maybeSingle();

      if (subscriptionError) {
        setStatusMessage(`${dictionary.portal.subscriptionSyncError}: ${subscriptionError.message}`);
      }

      setSubscription((data as SubscriptionState) || null);
    }

    async function loadTrainingSessions(activeSession: Session | null) {
      if (!activeSession) {
        setTrainingSessions([]);
        return;
      }

      const { data, error } = await client
        .from("training_sessions")
        .select(
          "id,source_key,program_slug,session_date,difficulty,title,body,tags,access_scope,training_session_groups(group:content_groups(id,slug,name,group_type))"
        )
        .eq("published", true)
        .order("session_date", { ascending: true })
        .limit(96);

      if (error) {
        setStatusMessage(`${dictionary.portal.contentLoadError}: ${error.message}`);
      }

      setTrainingSessions((data as unknown as PortalTrainingSession[] | null) || []);
    }

    async function loadTrainingCompletions(activeSession: Session | null) {
      if (!activeSession) {
        setCompletionRecords([]);
        return;
      }

      const { data, error } = await client
        .from("training_session_completions")
        .select("training_session_id,completed_at,meters")
        .eq("user_id", activeSession.user.id);

      if (error) {
        setStatusMessage(`${dictionary.portal.contentLoadError}: ${error.message}`);
        setCompletionRecords([]);
        return;
      }

      setCompletionRecords((data as PortalTrainingCompletion[] | null) || []);
    }

    async function loadPerformanceEntries(activeSession: Session | null) {
      if (!activeSession) {
        setPerformanceEntries([]);
        return;
      }

      const { data, error } = await client
        .from("client_performance_metrics")
        .select("id,user_id,metric_type,measured_at,value_seconds,note,created_at,updated_at")
        .eq("user_id", activeSession.user.id)
        .order("measured_at", { ascending: true });

      if (error) {
        setStatusMessage(`${dictionary.portal.contentLoadError}: ${error.message}`);
        setPerformanceEntries([]);
        return;
      }

      setPerformanceEntries((data as ClientPerformanceMetric[] | null) || []);
    }

    loadSession();
    const {
      data: { subscription: authSubscription }
    } = client.auth.onAuthStateChange(async (_event, activeSession) => {
      setSession(activeSession);
      await syncProfileAndSubscription(activeSession);
      await loadTrainingSessions(activeSession);
      await loadTrainingCompletions(activeSession);
      await loadPerformanceEntries(activeSession);
    });

    return () => authSubscription.unsubscribe();
  }, [
    dictionary.portal.contentLoadError,
    dictionary.portal.subscriptionSyncError,
    locale,
    paymentCopy,
    supabase
  ]);

  async function signIn(provider: "google" | "facebook" | "apple") {
    if (!supabase) {
      return;
    }

    const origin = getAuthRedirectOrigin(window.location.origin);
    const callbackUrl = new URL(`/${locale}/auth/callback`, origin);
    callbackUrl.searchParams.set("next", `/${locale}/clientes?access=${selectedAccess}`);
    window.localStorage.setItem("bestswim-access-intent", selectedAccess);

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString()
      }
    });
  }

  async function signOut() {
    await supabase?.auth.signOut();
    window.localStorage.removeItem("bestswim-access-intent");
    setSession(null);
    setSubscription(null);
    setProfileAccess(null);
    setTrainingSessions([]);
    setCompletionRecords([]);
    setPendingCompletionIds([]);
    setPerformanceEntries([]);
    setPerformanceDrafts(getInitialPerformanceDrafts());
    setSavingPerformanceTypes([]);
    setSelectedPerformanceType("pace_100m");
    setExpandedPerformanceType(null);
    setOnboardingEditorOpen(false);
    setOnboardingSaving(false);
    setStatusMessage(null);
  }

  async function refreshTrainingData(activeSession: Session) {
    if (!supabase) {
      return;
    }

    const { data: sessionsData, error: sessionsError } = await supabase
      .from("training_sessions")
      .select(
        "id,source_key,program_slug,session_date,difficulty,title,body,tags,access_scope,training_session_groups(group:content_groups(id,slug,name,group_type))"
      )
      .eq("published", true)
      .order("session_date", { ascending: true })
      .limit(96);

    if (sessionsError) {
      setStatusMessage(`${dictionary.portal.contentLoadError}: ${sessionsError.message}`);
    } else {
      setTrainingSessions((sessionsData as unknown as PortalTrainingSession[] | null) || []);
    }

    const { data: completionsData, error: completionsError } = await supabase
      .from("training_session_completions")
      .select("training_session_id,completed_at,meters")
      .eq("user_id", activeSession.user.id);

    if (completionsError) {
      setStatusMessage(`${dictionary.portal.contentLoadError}: ${completionsError.message}`);
      setCompletionRecords([]);
      return;
    }

    setCompletionRecords((completionsData as PortalTrainingCompletion[] | null) || []);
  }

  async function submitOnboarding() {
    if (!session) {
      return;
    }

    setOnboardingSaving(true);
    setStatusMessage(null);

    const response = await fetch("/api/portal/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        swimLevel: selectedSwimLevel,
        trainingGoal: selectedTrainingGoal,
        competitionGoal: selectedTrainingGoal === "preparacion_competitiva" ? selectedCompetitionGoal : null,
        locale
      })
    });

    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
      groupSlug?: string;
      onboardingCompletedAt?: string;
    };

    if (!response.ok) {
      setOnboardingSaving(false);
      setStatusMessage(`${onboardingCopy.error} ${result.error || ""}`.trim());
      return;
    }

    const completedAt = result.onboardingCompletedAt || new Date().toISOString();

    setProfileAccess((current) => ({
      access_tier: current?.access_tier || "free",
      trial_ends_at: current?.trial_ends_at || null,
      body_factory_student: current?.body_factory_student || false,
      created_at: current?.created_at || completedAt,
      swim_level: selectedSwimLevel,
      training_goal: selectedTrainingGoal,
      competition_goal: selectedTrainingGoal === "preparacion_competitiva" ? selectedCompetitionGoal : null,
      onboarding_group_slug: result.groupSlug || current?.onboarding_group_slug || null,
      onboarding_completed_at: completedAt
    }));
    setOnboardingEditorOpen(false);
    setOnboardingSaving(false);
    setStatusMessage(onboardingCopy.success);
    await refreshTrainingData(session);
  }

  async function updateSessionCompletion(trainingSession: PortalTrainingSession, completed: boolean) {
    if (!supabase || !session) {
      return;
    }

    const previousRecords = completionRecords;
    const completedAt = new Date().toISOString();
    const meters = extractMetersFromSession(trainingSession, locale) || null;
    const nextRecords = completed
      ? [
          ...completionRecords.filter((item) => item.training_session_id !== trainingSession.id),
          { training_session_id: trainingSession.id, completed_at: completedAt, meters }
        ]
      : completionRecords.filter((item) => item.training_session_id !== trainingSession.id);

    setCompletionRecords(nextRecords);
    setPendingCompletionIds((ids) => Array.from(new Set([...ids, trainingSession.id])));

    const result = completed
      ? await supabase.from("training_session_completions").upsert(
          {
            user_id: session.user.id,
            training_session_id: trainingSession.id,
            completed_at: completedAt,
            meters
          },
          { onConflict: "user_id,training_session_id" }
        )
      : await supabase
          .from("training_session_completions")
          .delete()
          .eq("user_id", session.user.id)
          .eq("training_session_id", trainingSession.id);

    if (result.error) {
      setCompletionRecords(previousRecords);
      setStatusMessage(`${dictionary.portal.contentLoadError}: ${result.error.message}`);
    }

    setPendingCompletionIds((ids) => ids.filter((id) => id !== trainingSession.id));
  }

  function updatePerformanceDraft(type: PerformanceMetricType, draft: Partial<PerformanceDraft>) {
    setPerformanceDrafts((current) => ({
      ...current,
      [type]: {
        ...current[type],
        ...draft
      }
    }));
  }

  async function savePerformanceMetric(type: PerformanceMetricType) {
    if (!supabase || !session) {
      return;
    }

    const draft = performanceDrafts[type];
    const valueSeconds = parseTimeInput(draft.value);
    const measuredAt = draft.measuredAt || todayDateKey();

    if (!valueSeconds) {
      setStatusMessage(performanceCopy.invalid);
      return;
    }

    setSavingPerformanceTypes((types) => Array.from(new Set([...types, type])));
    setStatusMessage(null);

    const { data, error } = await supabase
      .from("client_performance_metrics")
      .upsert(
        {
          user_id: session.user.id,
          metric_type: type,
          measured_at: measuredAt,
          value_seconds: valueSeconds,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id,metric_type,measured_at" }
      )
      .select("id,user_id,metric_type,measured_at,value_seconds,note,created_at,updated_at")
      .single();

    if (error) {
      setStatusMessage(`${dictionary.portal.contentLoadError}: ${error.message}`);
      setSavingPerformanceTypes((types) => types.filter((item) => item !== type));
      return;
    }

    const savedEntry = data as ClientPerformanceMetric;
    setPerformanceEntries((entries) =>
      [...entries.filter((entry) => entry.id !== savedEntry.id), savedEntry].sort(
        (first, second) => parseSessionDate(first.measured_at).getTime() - parseSessionDate(second.measured_at).getTime()
      )
    );
    setPerformanceDrafts((current) => ({
      ...current,
      [type]: {
        measuredAt,
        value: ""
      }
    }));
    setSavingPerformanceTypes((types) => types.filter((item) => item !== type));
  }

  return (
    <main className="min-h-screen bg-swim-navy px-4 py-10 text-swim-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Waves className="h-7 w-7 text-swim-cyan" />
            <span className="text-xl font-semibold">Best Swim</span>
          </Link>
          {session ? (
            <Button variant="secondary" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {dictionary.portal.signOut}
            </Button>
          ) : null}
        </div>

        {!session ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="glass-panel">
              <CardHeader>
                <Badge>{dictionary.nav.portal}</Badge>
                <CardTitle className="text-4xl">{dictionary.portal.title}</CardTitle>
                <CardDescription className="text-base">{dictionary.portal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-swim-cyan">{accessCopy.title}</p>
                    <Badge>{selectedAccessOption.title}</Badge>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {accessOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedAccess(option.id)}
                        className={cn(
                          "rounded-md border p-3 text-left transition hover:border-swim-cyan/70 hover:bg-swim-cyan/[0.08]",
                          selectedAccess === option.id
                            ? "border-swim-cyan bg-swim-cyan/[0.12]"
                            : "border-white/10 bg-white/[0.04]"
                        )}
                      >
                        <span className="block text-sm font-semibold text-swim-white">{option.title}</span>
                        <span className="mt-2 block text-xs leading-5 text-swim-cyan">{option.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {!supabase ? (
                  <p className="rounded-md border border-swim-cyan/30 bg-swim-cyan/10 p-3 text-sm text-swim-aqua">
                    {dictionary.portal.supabaseMissing}
                  </p>
                ) : null}
                {statusMessage ? (
                  <p className="rounded-md border border-swim-cyan/30 bg-swim-cyan/10 p-3 text-sm leading-6 text-swim-aqua">
                    {statusMessage}
                  </p>
                ) : null}
                <Button className="w-full" variant="secondary" onClick={() => signIn("google")} disabled={!supabase}>
                  <Mail className="h-4 w-4" />
                  {dictionary.portal.signIn} Google
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => signIn("facebook")} disabled={!supabase}>
                  <Globe2 className="h-4 w-4" />
                  {dictionary.portal.signIn} Facebook
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => signIn("apple")} disabled={!supabase}>
                  <Apple className="h-4 w-4" />
                  {dictionary.portal.signIn} Apple
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>{dictionary.portal.weeklyTitle}</CardTitle>
                <CardDescription>{loading ? "Loading..." : dictionary.portal.locked}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-white/10 bg-white/[0.07] p-5">
                  <Gauge className="mb-4 h-5 w-5 text-swim-cyan" />
                  <p className="font-semibold text-swim-white">{dictionary.portal.locked}</p>
                  <p className="mt-2 text-sm leading-6 text-swim-steel">{dictionary.portal.description}</p>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="rounded-md border border-swim-cyan/20 bg-white/[0.055] p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <Badge>{dashboardCopy.dashboardEyebrow}</Badge>
                  <h1 className="mt-4 text-4xl font-semibold text-swim-white sm:text-5xl">{dashboardCopy.dashboardTitle}</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-swim-steel">{dashboardCopy.dashboardDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-swim-steel">
                    <Badge>{session.user.email}</Badge>
                    <Badge>
                      {dashboardCopy.memberStatus}: {subscription ? subscription.status : dictionary.portal.inactive}
                    </Badge>
                    {profileAccess?.trial_ends_at ? <Badge>Trial: {new Date(profileAccess.trial_ends_at).toLocaleDateString(locale)}</Badge> : null}
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <CheckoutButton locale={locale} plan={selectedPaidPlan || "monthly"} className="h-11">
                    {selectedPaidPlan ? paymentCopy.continueCheckout : dashboardCopy.upgrade}
                  </CheckoutButton>
                  <PortalButton locale={locale} label={dashboardCopy.manageBilling} />
                </div>
              </div>
            </div>

            {statusMessage && !statusMessage.includes(dictionary.portal.contentLoadError) ? (
              <p className="rounded-md border border-swim-cyan/30 bg-swim-cyan/10 p-3 text-sm leading-6 text-swim-aqua">
                {statusMessage}
              </p>
            ) : null}

            {!loading ? (
              <div
                className={cn(
                  "rounded-md border p-4",
                  onboardingRequired
                    ? "border-swim-cyan/30 bg-swim-cyan/[0.09] sm:p-5"
                    : "border-white/10 bg-white/[0.045]"
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() => {
                    if (!onboardingRequired) {
                      setOnboardingEditorOpen((value) => !value);
                    }
                  }}
                  aria-expanded={onboardingExpanded}
                >
                  <span>
                    <Badge>{onboardingRequired ? onboardingCopy.title : onboardingCopy.completedLabel}</Badge>
                    <span className="mt-3 block text-base font-semibold text-swim-white">
                      {onboardingRequired ? onboardingCopy.title : onboardingCopy.summaryTitle}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-swim-steel">
                      {onboardingRequired ? onboardingCopy.description : onboardingCopy.summaryDescription}
                    </span>
                  </span>
                  {onboardingRequired ? null : (
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.055] text-swim-cyan">
                      {onboardingExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </span>
                  )}
                </button>

                {!onboardingRequired ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-swim-steel">
                    <Badge>{onboardingCopy.levels[selectedSwimLevel]}</Badge>
                    <Badge>{onboardingCopy.goals[selectedTrainingGoal]}</Badge>
                    {selectedCompetitionLabel ? <Badge>{selectedCompetitionLabel}</Badge> : null}
                    {onboardingCompletedAt ? (
                      <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
                        {onboardingCopy.lastUpdated}: {new Date(onboardingCompletedAt).toLocaleDateString(locale)}
                      </span>
                    ) : null}
                    <span className="font-semibold text-swim-cyan">
                      {onboardingExpanded ? onboardingCopy.close : onboardingCopy.edit}
                    </span>
                  </div>
                ) : null}

                {onboardingExpanded ? (
                  <OnboardingQuestionnaire
                    copy={onboardingCopy}
                    selectedSwimLevel={selectedSwimLevel}
                    selectedTrainingGoal={selectedTrainingGoal}
                    selectedCompetitionGoal={selectedCompetitionGoal}
                    onboardingSaving={onboardingSaving}
                    submitLabel={onboardingRequired ? onboardingCopy.submit : onboardingCopy.recalibrate}
                    onSwimLevelChange={setSelectedSwimLevel}
                    onTrainingGoalChange={setSelectedTrainingGoal}
                    onCompetitionGoalChange={setSelectedCompetitionGoal}
                    onSubmit={submitOnboarding}
                  />
                ) : null}
              </div>
            ) : null}

            {selectedPaidPlan && !subscription ? (
              <div className="rounded-md border border-swim-cyan/30 bg-swim-cyan/[0.1] p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-swim-cyan">
                      {paymentCopy.selectedPlan}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-swim-white">{selectedAccessOption.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-swim-aqua">{selectedAccessOption.detail}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-swim-steel">
                      {paymentCopy.checkoutReadyDescription}
                    </p>
                  </div>
                  <CheckoutButton locale={locale} plan={selectedPaidPlan} className="h-11">
                    {paymentCopy.continueCheckout}
                  </CheckoutButton>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {portalMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div key={metric.label} className="rounded-md border border-white/10 bg-white/[0.055] p-4">
                    <Icon className="h-5 w-5 text-swim-cyan" />
                    <p className="mt-4 text-2xl font-semibold text-swim-white">{metric.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-swim-cyan">{metric.label}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-swim-steel">{metric.detail}</p>
                  </div>
                );
              })}
            </div>

            {/* Dashboards a ancho completo: ritmos/tests + progreso (laptop 2 col, móvil apilado) */}
            <div className="grid gap-6 lg:grid-cols-2">
              <PerformanceDashboard
                copy={performanceCopy}
                configs={performanceConfigs}
                entries={performanceEntries}
                selectedType={selectedPerformanceType}
                drafts={performanceDrafts}
                savingTypes={savingPerformanceTypes}
                registrationDate={performanceRegistrationDate}
                locale={locale}
                onSelectedTypeChange={setSelectedPerformanceType}
                onDraftChange={({ type, draft }) => updatePerformanceDraft(type, draft)}
                onSave={savePerformanceMetric}
                onMaximize={(type) => {
                  setSelectedPerformanceType(type);
                  setExpandedPerformanceType(type);
                }}
              />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProgressMeter
                    title={dashboardCopy.weeklyProgress}
                    completed={dashboardStats.week.completed}
                    planned={dashboardStats.week.planned}
                    percent={weeklyPercent}
                    copy={dashboardCopy}
                  />
                  <ProgressMeter
                    title={dashboardCopy.monthlyProgress}
                    completed={dashboardStats.month.completed}
                    planned={dashboardStats.month.planned}
                    percent={monthlyPercent}
                    copy={dashboardCopy}
                  />
                </div>
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-2xl">Drills</CardTitle>
                    <CardDescription>Multimedia semanal segun tu avance desde el primer acceso.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weeklyDrills.map((drill) => (
                      <article key={drill.id} className="rounded-md border border-white/10 bg-white/[0.055] p-3">
                        <div className="overflow-hidden rounded-md border border-swim-cyan/20 bg-swim-ink">
                          {drill.video ? (
                            <video
                              src={drill.video}
                              poster={drill.poster || undefined}
                              controls
                              preload="none"
                              playsInline
                              className="aspect-video w-full bg-swim-ink object-contain"
                            />
                          ) : (
                            <div className="aspect-video bg-swim-ink/80" aria-hidden="true" />
                          )}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-swim-white">{drill.title}</p>
                        <p className="mt-1 text-xs leading-5 text-swim-steel">{drill.description}</p>
                      </article>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Progreso del nadador a ancho completo para gráficas grandes */}
            <ProgressDashboard
              copy={progressCopy}
              completions={completionRecords}
              sessions={trainingSessions}
              entries={performanceEntries}
              locale={locale}
            />

            {/* Plan semanal + mensajes de nadadores + desafíos */}
            <div className="grid gap-6">
              <Card className="glass-panel min-w-0">
                <CardHeader>
                  <CardTitle>{dashboardCopy.weeklyPlanTitle}</CardTitle>
                  <CardDescription>
                    {trainingViewCopy.currentWeek}: {trainingViewCopy.mondayStart} - {currentWeekRangeLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statusMessage && statusMessage.includes(dictionary.portal.contentLoadError) ? (
                    <p className="mb-4 rounded-md border border-swim-cyan/30 bg-swim-cyan/10 p-3 text-sm leading-6 text-swim-aqua">
                      {statusMessage}
                    </p>
                  ) : null}
                  {trainingSessions.length ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {trainingViewOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={activeTrainingViewId === option.id}
                            onClick={() => setSelectedTrainingView(option.id)}
                            className={cn(
                              "inline-flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold text-swim-white transition",
                              activeTrainingViewId === option.id
                                ? "border-swim-cyan bg-swim-cyan/[0.16]"
                                : "border-white/10 bg-white/[0.05] hover:border-swim-cyan/60 hover:bg-swim-cyan/[0.08]"
                            )}
                          >
                            {option.id.startsWith("group:") ? <Layers3 className="h-3.5 w-3.5 text-swim-cyan" /> : null}
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {filteredTrainingSessions.length ? (
                        filteredTrainingSessions.slice(0, 3).map((item) => {
                          const completed = completedSessionIds.includes(item.id);

                          return (
                            <PortalSessionCard
                              key={item.id}
                              item={item}
                              locale={locale}
                              dictionary={dictionary}
                              completionCopy={completionCopy}
                              scheduleLabel={`${trainingViewCopy.weekRange}: ${currentWeekRangeLabel}`}
                              completed={completed}
                              pending={pendingCompletionIds.includes(item.id)}
                              onCompletionToggle={() => updateSessionCompletion(item, !completed)}
                            />
                          );
                        })
                      ) : (
                        <div className="rounded-md border border-white/10 bg-white/[0.07] p-5">
                          <Layers3 className="mb-4 h-5 w-5 text-swim-cyan" />
                          <p className="font-semibold text-swim-white">{activeTrainingView.label}</p>
                          <p className="mt-2 text-sm leading-6 text-swim-steel">{trainingViewCopy.noSessionsForView}</p>
                        </div>
                      )}
                      <div className="my-6">
                        <PortalQuoteTicker dictionary={dictionary} />
                      </div>

                      {challengeGroups.length ? (
                        <section className="border-t border-white/10 pt-5">
                            <div className="mb-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-swim-cyan">{challengeCopy.title}</p>
                            </div>

                            <div className="space-y-4">
                              {challengeGroups.map((challenge) => (
                                <div key={challenge.key} className="rounded-md border border-swim-cyan/20 bg-swim-ink/[0.42] p-3">
                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                                    <div className="flex items-center gap-3">
                                      <span className="grid h-9 w-9 place-items-center rounded-md border border-swim-cyan/25 bg-swim-cyan/10">
                                        <Trophy className="h-4 w-4 text-swim-cyan" />
                                      </span>
                                      <div>
                                        <p className="font-semibold text-swim-white">{challenge.label}</p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-swim-steel">
                                          {challengeCopy.progress}: {challenge.completed}/{challenge.planned} {challengeCopy.sessions}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge>{challenge.allCompleted ? challengeCopy.completed : challengeCopy.active}</Badge>
                                  </div>

                                  <div className="space-y-3">
                                    {challenge.sessions.map((item) => {
                                      const completed = completedSessionIds.includes(item.id);

                                      return (
                                        <PortalSessionCard
                                          key={item.id}
                                          item={item}
                                          locale={locale}
                                          dictionary={dictionary}
                                          completionCopy={completionCopy}
                                          scheduleLabel={challengeCopy.persistent}
                                          completed={completed}
                                          pending={pendingCompletionIds.includes(item.id)}
                                          onCompletionToggle={() => updateSessionCompletion(item, !completed)}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                        </section>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-md border border-white/10 bg-white/[0.07] p-5">
                      <Gauge className="mb-4 h-5 w-5 text-swim-cyan" />
                      <p className="font-semibold text-swim-white">{dictionary.portal.noSessionsTitle}</p>
                      <p className="mt-2 text-sm leading-6 text-swim-steel">{dictionary.portal.noSessionsDescription}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-2xl">{dashboardCopy.premiumTitle}</CardTitle>
                  <CardDescription>{dashboardCopy.premiumDescription}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <CheckoutButton locale={locale} plan="monthly" className="w-full">
                    {dictionary.pricing.monthly}
                  </CheckoutButton>
                  <CheckoutButton locale={locale} plan="annual" className="w-full">
                    {dictionary.pricing.annual}
                  </CheckoutButton>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>
      {expandedPerformanceType ? (
        <PerformanceMetricModal
          copy={performanceCopy}
          configs={performanceConfigs}
          entries={performanceEntries}
          selectedType={expandedPerformanceType}
          drafts={performanceDrafts}
          savingTypes={savingPerformanceTypes}
          registrationDate={performanceRegistrationDate}
          locale={locale}
          onSelectedTypeChange={(type) => {
            setSelectedPerformanceType(type);
            setExpandedPerformanceType(type);
          }}
          onDraftChange={({ type, draft }) => updatePerformanceDraft(type, draft)}
          onSave={savePerformanceMetric}
          onClose={() => setExpandedPerformanceType(null)}
        />
      ) : null}
    </main>
  );
}
