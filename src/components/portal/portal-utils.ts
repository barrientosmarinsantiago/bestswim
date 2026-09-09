// Helpers puros del portal (formato, fechas, parsing, sesiones). Extraído de client-portal.tsx.

import { multimediaDrills } from "@/content/multimedia";
import type { Locale } from "@/i18n/config";
import { getPerformanceCopy } from "@/components/portal/portal-copy";
import type {
  AccessIntent,
  ClientPerformanceMetric,
  PaidAccessIntent,
  PerformanceDraft,
  PerformanceMetricConfig,
  PerformanceMetricType,
  PortalContentGroup,
  PortalTrainingSession,
  SwimLevel
} from "@/components/portal/portal-types";

// Reduce cualquier valor de nivel (incluidos los antiguos no_se_nadar / intermedio_avanzado)
// a uno de los 3 niveles que el cliente puede elegir hoy.
export function normalizeSwimLevel(value: string | null | undefined): SwimLevel {
  if (value === "intermedio" || value === "intermedio_avanzado") {
    return "intermedio";
  }

  if (value === "avanzado") {
    return "avanzado";
  }

  return "principiante";
}

export function todayDateKey() {
  return formatDateKey(new Date());
}

export function getInitialPerformanceDrafts(): Record<PerformanceMetricType, PerformanceDraft> {
  const today = todayDateKey();

  return {
    pace_100m: { measuredAt: today, value: "" },
    test_200m: { measuredAt: today, value: "" },
    test_400m: { measuredAt: today, value: "" }
  };
}

export function localizedJson(value: Record<string, string> | null | undefined, locale: Locale) {
  if (!value) {
    return "";
  }

  return value[locale] || value.es || value.en || value.pt || "";
}

export function getSessionGroups(session: PortalTrainingSession) {
  return (session.training_session_groups || [])
    .map((item) => item.group)
    .filter((group): group is PortalContentGroup => Boolean(group));
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function getChallengeGroup(session: PortalTrainingSession) {
  return getSessionGroups(session).find(
    (group) => group.group_type === "challenge" || /reto|challenge|desafio/i.test(group.slug)
  );
}

export function isChallengeSession(session: PortalTrainingSession) {
  if (getChallengeGroup(session)) {
    return true;
  }

  const tokens = [session.source_key || "", session.program_slug, ...(session.tags || [])]
    .map(normalizeSearchText)
    .join(" ");

  return /\b(reto|challenge|desafio)\b/.test(tokens) || tokens.includes("estrecho-14k") || tokens.includes("14k");
}

export function getChallengeKey(session: PortalTrainingSession) {
  const challengeGroup = getChallengeGroup(session);

  if (challengeGroup) {
    return challengeGroup.slug;
  }

  const source = normalizeSearchText(`${session.source_key || ""} ${session.program_slug}`);

  if (source.includes("reto-14km") || source.includes("estrecho")) {
    return "reto-14km-estrecho";
  }

  return `challenge:${session.program_slug}`;
}

export function getChallengeLabel(key: string, sessions: PortalTrainingSession[], locale: Locale) {
  const challengeGroup = sessions.map(getChallengeGroup).find(Boolean);
  const groupLabel = challengeGroup ? localizedJson(challengeGroup.name, locale) : "";

  if (groupLabel) {
    return groupLabel;
  }

  if (key === "reto-14km-estrecho") {
    return locale === "en"
      ? "Strait of Gibraltar 14K Challenge"
      : locale === "pt"
        ? "Desafio Estreito de Gibraltar 14K"
        : "Desafio Estrecho de Gibraltar 14K";
  }

  return locale === "en" ? "Challenge" : locale === "pt" ? "Desafio" : "Desafío";
}

export function getSessionOrder(session: PortalTrainingSession) {
  const match = session.source_key?.match(/session-(\d+)$/) || localizedJson(session.title, "es").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function isAccessIntent(value: string | null): value is AccessIntent {
  return value === "weekly" || value === "monthly" || value === "annual";
}

export function isPaidAccessIntent(value: AccessIntent): value is PaidAccessIntent {
  return value === "weekly" || value === "monthly" || value === "annual";
}

export function formatDuration(seconds: number) {
  const roundedSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const remainder = String(roundedSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export function formatPace(seconds: number) {
  return `${formatDuration(seconds)}/100m`;
}

export function parseTimeInput(value: string) {
  const normalized = value.trim().toLowerCase().replace("/100m", "").replace("min", "").replace(",", ".");

  if (!normalized) {
    return null;
  }

  if (normalized.includes(":")) {
    const [minutesPart, secondsPart = "0"] = normalized.split(":");
    const minutes = Number.parseInt(minutesPart, 10);
    const seconds = Number.parseFloat(secondsPart);

    if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds < 0 || seconds >= 60) {
      return null;
    }

    return Math.round(minutes * 60 + seconds);
  }

  const numericValue = Number.parseFloat(normalized);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.round(numericValue);
}

export function getPerformanceConfigs(copy: ReturnType<typeof getPerformanceCopy>): Record<PerformanceMetricType, PerformanceMetricConfig> {
  return {
    pace_100m: {
      type: "pace_100m",
      ...copy.metrics.pace_100m,
      yMinSeconds: 60,
      yMaxSeconds: 140,
      yTicks: [60, 80, 100, 120, 140],
      xMode: "measurement_date",
      formatValue: formatPace
    },
    test_200m: {
      type: "test_200m",
      ...copy.metrics.test_200m,
      yMinSeconds: 120,
      yMaxSeconds: 300,
      yTicks: [120, 180, 240, 300],
      xMode: "measurement_date",
      formatValue: formatDuration
    },
    test_400m: {
      type: "test_400m",
      ...copy.metrics.test_400m,
      yMinSeconds: 240,
      yMaxSeconds: 600,
      yTicks: [240, 360, 480, 600],
      xMode: "measurement_date",
      formatValue: formatDuration
    }
  };
}

export function parseDistanceValue(rawValue: string, unit: string) {
  const compact = rawValue.replace(/\s/g, "");

  if (unit.toLowerCase().startsWith("k")) {
    return Math.round(Number.parseFloat(compact.replace(",", ".")) * 1000);
  }

  const normalized =
    /[.,]\d{3}$/.test(compact) || /[.,]\d{3}[.,]/.test(compact)
      ? compact.replace(/[.,]/g, "")
      : compact.replace(",", ".");

  return Math.round(Number.parseFloat(normalized));
}

export function extractMetersFromSession(session: PortalTrainingSession, locale: Locale) {
  const text = [
    localizedJson(session.title, locale),
    localizedJson(session.body, locale),
    ...(session.tags || [])
  ].join(" ");

  const totalVolumePattern =
    /(?:total\s+(?:volumen|volume)|volumen\s+total|volume\s+total|total\s+volume|total\s+volumen\s+sesion|total\s+volume\s+session)[^\d]{0,32}(\d+(?:[.,]\d+)?)\s*(km|k|m)\b/gi;
  const totalMatches = Array.from(text.matchAll(totalVolumePattern))
    .map((match) => parseDistanceValue(match[1], match[2]))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (totalMatches.length) {
    return Math.max(...totalMatches);
  }

  const distancePattern = /(\d+(?:[.,]\d+)?)\s*(km|k|m)\b/gi;
  const matches = Array.from(text.matchAll(distancePattern))
    .map((match) => parseDistanceValue(match[1], match[2]))
    .filter((value) => Number.isFinite(value) && value > 0);

  return matches.reduce((total, value) => total + value, 0);
}

export function parseSessionDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function startOfWeek(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  const day = clone.getDay() || 7;
  clone.setDate(clone.getDate() - day + 1);
  return clone;
}

export function endOfWeek(date: Date) {
  const clone = startOfWeek(date);
  clone.setDate(clone.getDate() + 6);
  clone.setHours(23, 59, 59, 999);
  return clone;
}

export function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

export function isBetween(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDayMonthYear(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export function getWeekdayLabels(locale: Locale) {
  if (locale === "en") {
    return { monday: "Monday", sunday: "Sunday" };
  }

  if (locale === "pt") {
    return { monday: "Segunda-feira", sunday: "Domingo" };
  }

  return { monday: "Lunes", sunday: "Domingo" };
}

export function formatWeekRange(start: Date, end: Date, locale: Locale) {
  const labels = getWeekdayLabels(locale);
  return `${labels.monday} ${formatDayMonthYear(start)} - ${labels.sunday} ${formatDayMonthYear(end)}`;
}

export function getTagValue(tags: string[] | null, prefix: string) {
  return tags?.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) || null;
}

export function resolveOnboardingSessionDate(session: PortalTrainingSession, onboardingCompletedAt: string | null | undefined) {
  if (!onboardingCompletedAt || !session.tags?.includes("onboarding")) {
    return session.session_date;
  }

  const week = Number(getTagValue(session.tags, "onboarding-week-") || "1");
  const day = Number(getTagValue(session.tags, "onboarding-day-") || "1");
  const weekStart = startOfWeek(new Date(onboardingCompletedAt));
  return formatDateKey(addDays(weekStart, (week - 1) * 7 + (day - 1)));
}

export function getWeekIndexFromOnboarding(onboardingCompletedAt: string | null | undefined) {
  if (!onboardingCompletedAt) {
    return 0;
  }

  const onboardingWeek = startOfWeek(new Date(onboardingCompletedAt)).getTime();
  const currentWeek = startOfWeek(new Date()).getTime();
  return Math.max(0, Math.floor((currentWeek - onboardingWeek) / (7 * 24 * 60 * 60 * 1000)));
}

export function getWeeklyDrills(onboardingCompletedAt: string | null | undefined) {
  if (!multimediaDrills.length) {
    return [];
  }

  const start = (getWeekIndexFromOnboarding(onboardingCompletedAt) * 3) % multimediaDrills.length;
  return Array.from({ length: Math.min(3, multimediaDrills.length) }, (_, index) => multimediaDrills[(start + index) % multimediaDrills.length]);
}

export function formatKm(meters: number) {
  return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`;
}

export function progressPercent(completed: number, planned: number) {
  if (!planned) {
    return 0;
  }

  return Math.min(100, Math.round((completed / planned) * 100));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getMonthIndexFromRegistration(registrationDate: string | null | undefined, measuredAt: string) {
  const registration = parseSessionDate(registrationDate || measuredAt);
  const measured = parseSessionDate(measuredAt);
  const monthIndex =
    (measured.getFullYear() - registration.getFullYear()) * 12 + (measured.getMonth() - registration.getMonth()) + 1;

  return Math.max(1, monthIndex);
}

export function formatShortDate(value: string, locale: Locale) {
  return parseSessionDate(value).toLocaleDateString(locale, {
    month: "short",
    day: "numeric"
  });
}

export function getMetricEntries(entries: ClientPerformanceMetric[], type: PerformanceMetricType) {
  return entries
    .filter((entry) => entry.metric_type === type)
    .sort((first, second) => parseSessionDate(first.measured_at).getTime() - parseSessionDate(second.measured_at).getTime());
}
