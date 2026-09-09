"use client";

// Dashboards de progreso del nadador (estilo Commit Swimming, custom por usuario):
// volumen semanal, distribución por tipo de trabajo, constancia y evolución de la CSS.
// SVG puro sin dependencias. Paleta categórica validada (orden fijo, adyacencias CVD-safe):
// AEL #0070C0 → AEM #92D050 → Reto #18D8FF → AEI #F79646 → Técnica #AFC6E0.

import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import { zoneCodeColors, zoneTextColor } from "@/content/zones";
import { getProgressCopy } from "@/components/portal/portal-copy";
import {
  addDays,
  extractMetersFromSession,
  formatDateKey,
  formatDuration,
  formatKm,
  formatPace,
  formatShortDate,
  getMetricEntries,
  isChallengeSession,
  startOfWeek
} from "@/components/portal/portal-utils";
import type {
  ClientPerformanceMetric,
  PortalTrainingCompletion,
  PortalTrainingSession
} from "@/components/portal/portal-types";

type ProgressCopy = ReturnType<typeof getProgressCopy>;

type WorkType = "ael" | "aem" | "reto" | "aei" | "tecnica";

// Orden fijo de la paleta categórica (no se recicla ni se reordena por tamaño).
const workTypeOrder: WorkType[] = ["ael", "aem", "reto", "aei", "tecnica"];

const workTypeColors: Record<WorkType, string> = {
  ael: zoneCodeColors.Z1 || "#0070C0",
  aem: zoneCodeColors.Z2 || "#92D050",
  reto: "#18D8FF",
  aei: zoneCodeColors.Z3 || "#F79646",
  tecnica: "#AFC6E0"
};

function classifyWorkType(session: PortalTrainingSession | undefined): WorkType {
  if (!session) {
    return "tecnica";
  }

  if (isChallengeSession(session)) {
    return "reto";
  }

  const tags = (session.tags || []).map((tag) => tag.toLowerCase());
  if (tags.includes("aei")) return "aei";
  if (tags.includes("aem")) return "aem";
  if (tags.includes("ael")) return "ael";
  if (tags.includes("tecnica")) return "tecnica";

  const title = (session.title?.es || "").toUpperCase();
  if (title.includes("AEI")) return "aei";
  if (title.includes("AEM")) return "aem";
  if (title.includes("AEL")) return "ael";

  return "tecnica";
}

function completionMeters(
  completion: PortalTrainingCompletion,
  session: PortalTrainingSession | undefined,
  locale: Locale
) {
  if (typeof completion.meters === "number" && completion.meters > 0) {
    return completion.meters;
  }

  return session ? extractMetersFromSession(session, locale) : 0;
}

// Rectángulo con extremo de dato redondeado (arriba) y base recta anclada al eje.
function topRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  return `M ${x} ${y + height} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height} Z`;
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-swim-white">{title}</p>
      <p className="mb-3 text-xs text-swim-steel">{subtitle}</p>
      {children}
    </div>
  );
}

function WeeklyVolumeChart({
  copy,
  completions,
  sessionsById,
  locale
}: {
  copy: ProgressCopy;
  completions: PortalTrainingCompletion[];
  sessionsById: Map<string, PortalTrainingSession>;
  locale: Locale;
}) {
  const weekCount = 8;
  const currentWeekStart = startOfWeek(new Date());
  const weeks = Array.from({ length: weekCount }, (_, index) => addDays(currentWeekStart, (index - (weekCount - 1)) * 7));
  const totals = new Map(weeks.map((week) => [formatDateKey(week), 0]));

  for (const completion of completions) {
    if (!completion.completed_at) continue;
    const weekKey = formatDateKey(startOfWeek(new Date(completion.completed_at)));
    if (!totals.has(weekKey)) continue;
    const meters = completionMeters(completion, sessionsById.get(completion.training_session_id), locale);
    totals.set(weekKey, (totals.get(weekKey) || 0) + meters);
  }

  const values = weeks.map((week) => totals.get(formatDateKey(week)) || 0);
  const maxValue = Math.max(...values);

  if (!maxValue) {
    return <p className="text-sm text-swim-steel">{copy.weekly.empty}</p>;
  }

  const viewWidth = 360;
  const viewHeight = 170;
  const margin = { top: 22, right: 6, bottom: 20, left: 6 };
  const plotWidth = viewWidth - margin.left - margin.right;
  const plotHeight = viewHeight - margin.top - margin.bottom;
  const band = plotWidth / weekCount;
  const barWidth = Math.min(30, band - 8);

  return (
    <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full" role="img" aria-label={copy.weekly.title}>
      <line
        x1={margin.left}
        y1={margin.top + plotHeight}
        x2={viewWidth - margin.right}
        y2={margin.top + plotHeight}
        stroke="rgba(255,255,255,0.14)"
      />
      {weeks.map((week, index) => {
        const value = values[index];
        const height = maxValue ? (value / maxValue) * (plotHeight - 6) : 0;
        const x = margin.left + index * band + (band - barWidth) / 2;
        const y = margin.top + plotHeight - height;
        const label = value >= 10000 ? `${(value / 1000).toFixed(0)}k` : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;

        return (
          <g key={formatDateKey(week)}>
            {value > 0 ? (
              <path d={topRoundedRect(x, y, barWidth, height, 4)} fill="#18D8FF">
                <title>{`${formatShortDate(formatDateKey(week), locale)} · ${formatKm(value)}`}</title>
              </path>
            ) : null}
            {value > 0 ? (
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#AFC6E0">
                {label}
              </text>
            ) : null}
            <text
              x={margin.left + index * band + band / 2}
              y={viewHeight - 6}
              textAnchor="middle"
              fontSize="9"
              fill="rgba(175,198,224,0.75)"
            >
              {formatShortDate(formatDateKey(week), locale)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WorkTypeDonut({
  copy,
  completions,
  sessionsById,
  locale
}: {
  copy: ProgressCopy;
  completions: PortalTrainingCompletion[];
  sessionsById: Map<string, PortalTrainingSession>;
  locale: Locale;
}) {
  const totals: Record<WorkType, number> = { ael: 0, aem: 0, reto: 0, aei: 0, tecnica: 0 };

  for (const completion of completions) {
    const session = sessionsById.get(completion.training_session_id);
    const meters = completionMeters(completion, session, locale);
    if (meters > 0) {
      totals[classifyWorkType(session)] += meters;
    }
  }

  const totalMeters = workTypeOrder.reduce((sum, type) => sum + totals[type], 0);

  if (!totalMeters) {
    return <p className="text-sm text-swim-steel">{copy.zones.empty}</p>;
  }

  const activeTypes = workTypeOrder.filter((type) => totals[type] > 0);
  const cx = 70;
  const cy = 70;
  const radius = 52;
  const stroke = 18;
  const padAngle = activeTypes.length > 1 ? 0.05 : 0;

  function arcPoint(angle: number) {
    return `${cx + radius * Math.cos(angle)} ${cy + radius * Math.sin(angle)}`;
  }

  // Arcos precalculados (sin mutaciones durante el render).
  const segments: Array<{ type: WorkType; fraction: number; a0: number; a1: number }> = [];
  let cursor = -Math.PI / 2;
  for (const type of activeTypes) {
    const fraction = totals[type] / totalMeters;
    const sweep = fraction * Math.PI * 2;
    segments.push({ type, fraction, a0: cursor + padAngle / 2, a1: cursor + sweep - padAngle / 2 });
    cursor += sweep;
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-36 w-36 flex-none" role="img" aria-label={copy.zones.title}>
        {segments.map((segment) => {
          if (segment.a1 <= segment.a0) {
            return null;
          }

          const largeArc = segment.a1 - segment.a0 > Math.PI ? 1 : 0;

          return (
            <path
              key={segment.type}
              d={`M ${arcPoint(segment.a0)} A ${radius} ${radius} 0 ${largeArc} 1 ${arcPoint(segment.a1)}`}
              fill="none"
              stroke={workTypeColors[segment.type]}
              strokeWidth={stroke}
            >
              <title>{`${copy.zones.labels[segment.type]} · ${formatKm(totals[segment.type])} (${Math.round(segment.fraction * 100)}%)`}</title>
            </path>
          );
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="15" fontWeight="600" fill="#F7FBFF">
          {formatKm(totalMeters)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#AFC6E0">
          total
        </text>
      </svg>
      <ul className="grid flex-1 gap-1.5 text-xs">
        {workTypeOrder.map((type) => (
          <li key={type} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-swim-white/[0.85]">
              <span
                className="inline-flex rounded px-1.5 py-0.5 text-[0.9em] font-bold leading-none"
                style={{ backgroundColor: workTypeColors[type], color: zoneTextColor(workTypeColors[type]) }}
              >
                {copy.zones.labels[type]}
              </span>
            </span>
            <span className="font-semibold text-swim-white">
              {totals[type] ? `${Math.round((totals[type] / totalMeters) * 100)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConsistencyCalendar({
  copy,
  completions,
  sessionsById,
  locale
}: {
  copy: ProgressCopy;
  completions: PortalTrainingCompletion[];
  sessionsById: Map<string, PortalTrainingSession>;
  locale: Locale;
}) {
  const weekCount = 16;
  const gridStart = startOfWeek(addDays(new Date(), -(weekCount - 1) * 7));
  const metersByDay = new Map<string, number>();

  for (const completion of completions) {
    if (!completion.completed_at) continue;
    const dayKey = formatDateKey(new Date(completion.completed_at));
    const meters = completionMeters(completion, sessionsById.get(completion.training_session_id), locale);
    metersByDay.set(dayKey, (metersByDay.get(dayKey) || 0) + Math.max(meters, 1));
  }

  if (!metersByDay.size) {
    return <p className="text-sm text-swim-steel">{copy.calendar.empty}</p>;
  }

  // Rachas por día (contando solo hasta hoy).
  const todayKey = formatDateKey(new Date());
  let currentStreak = 0;
  for (let offset = 0; ; offset++) {
    const key = formatDateKey(addDays(new Date(), -offset));
    if (metersByDay.has(key)) {
      currentStreak++;
    } else if (offset === 0) {
      continue; // hoy sin entrenar no rompe la racha de ayer
    } else {
      break;
    }
    if (offset > 366) break;
  }

  let bestStreak = 0;
  let cursorStreak = 0;
  const sortedDays = Array.from(metersByDay.keys()).sort();
  let previousDay: string | null = null;
  for (const day of sortedDays) {
    cursorStreak = previousDay && formatDateKey(addDays(new Date(`${previousDay}T00:00:00`), 1)) === day ? cursorStreak + 1 : 1;
    bestStreak = Math.max(bestStreak, cursorStreak);
    previousDay = day;
  }

  const cell = 11;
  const gap = 3;
  const viewWidth = weekCount * (cell + gap) + gap;
  const viewHeight = 7 * (cell + gap) + gap;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-xs text-swim-steel">
        <span>
          {copy.calendar.currentStreak}: <strong className="text-swim-white">{currentStreak} {copy.calendar.days}</strong>
        </span>
        <span>
          {copy.calendar.bestStreak}: <strong className="text-swim-white">{bestStreak} {copy.calendar.days}</strong>
        </span>
        <span>
          {copy.calendar.activeDays}: <strong className="text-swim-white">{metersByDay.size}</strong>
        </span>
      </div>
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full max-w-[420px]" role="img" aria-label={copy.calendar.title}>
        {Array.from({ length: weekCount }).map((_, weekIndex) =>
          Array.from({ length: 7 }).map((_, dayIndex) => {
            const date = addDays(gridStart, weekIndex * 7 + dayIndex);
            const key = formatDateKey(date);
            if (key > todayKey) {
              return null;
            }
            const meters = metersByDay.get(key) || 0;
            const fill = !meters
              ? "rgba(255,255,255,0.07)"
              : meters >= 3000
                ? "#18D8FF"
                : meters >= 1500
                  ? "rgba(24,216,255,0.62)"
                  : "rgba(24,216,255,0.32)";

            return (
              <rect
                key={key}
                x={gap + weekIndex * (cell + gap)}
                y={gap + dayIndex * (cell + gap)}
                width={cell}
                height={cell}
                rx={2}
                fill={fill}
              >
                <title>{`${formatShortDate(key, locale)}${meters ? ` · ${formatKm(meters)}` : ""}`}</title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
}

function CssTrendChart({ copy, entries, locale }: { copy: ProgressCopy; entries: ClientPerformanceMetric[]; locale: Locale }) {
  // Serie CSS: en cada medición donde ya existen ambos tests, combina los más recientes.
  const relevant = [...getMetricEntries(entries, "test_200m"), ...getMetricEntries(entries, "test_400m")].sort(
    (first, second) => first.measured_at.localeCompare(second.measured_at)
  );

  let last200: number | null = null;
  let last400: number | null = null;
  const pointsByDate = new Map<string, number>();

  for (const entry of relevant) {
    if (entry.metric_type === "test_200m") last200 = entry.value_seconds;
    if (entry.metric_type === "test_400m") last400 = entry.value_seconds;
    if (last200 !== null && last400 !== null && last400 > last200) {
      pointsByDate.set(entry.measured_at, (last400 - last200) / 2);
    }
  }

  const points = Array.from(pointsByDate.entries())
    .map(([date, css]) => ({ date, css }))
    .sort((first, second) => first.date.localeCompare(second.date));

  if (!points.length) {
    return <p className="text-sm text-swim-steel">{copy.cssTrend.empty}</p>;
  }

  const latestCss = points[points.length - 1].css;
  const bands = [
    { code: "Z3", from: latestCss, to: latestCss + 7 },
    { code: "Z2", from: latestCss + 7, to: latestCss + 10 },
    { code: "Z1", from: latestCss + 10, to: latestCss + 20 }
  ];

  const cssValues = points.map((point) => point.css);
  const minPace = Math.min(...cssValues, latestCss) - 6;
  const maxPace = Math.max(...cssValues, latestCss + 20) + 2;

  const viewWidth = 360;
  const viewHeight = 190;
  const margin = { top: 10, right: 34, bottom: 22, left: 40 };
  const plotWidth = viewWidth - margin.left - margin.right;
  const plotHeight = viewHeight - margin.top - margin.bottom;

  // Ritmo más rápido (menos segundos) arriba.
  const yScale = (pace: number) => margin.top + ((pace - minPace) / (maxPace - minPace)) * plotHeight;
  const xScale = (index: number) =>
    margin.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(index)} ${yScale(point.css)}`).join(" ");
  const yTicks = [minPace + 2, (minPace + maxPace) / 2, maxPace - 4];

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full" role="img" aria-label={copy.cssTrend.title}>
        {bands.map((band) => {
          const y0 = yScale(band.from);
          const y1 = yScale(Math.min(band.to, maxPace));
          const color = zoneCodeColors[band.code] || "#AFC6E0";
          return (
            <g key={band.code}>
              <rect x={margin.left} y={y0} width={plotWidth} height={Math.max(0, y1 - y0)} fill={color} opacity={0.16} />
              <text x={margin.left + plotWidth + 5} y={(y0 + y1) / 2 + 3} fontSize="10" fontWeight="700" fill={color}>
                {band.code}
              </text>
            </g>
          );
        })}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              y1={yScale(tick)}
              x2={margin.left + plotWidth}
              y2={yScale(tick)}
              stroke="rgba(255,255,255,0.08)"
            />
            <text x={margin.left - 6} y={yScale(tick) + 3} textAnchor="end" fontSize="9" fill="#AFC6E0">
              {formatDuration(tick)}
            </text>
          </g>
        ))}
        <path d={linePath} fill="none" stroke="#F7FBFF" strokeWidth="2" />
        {points.map((point, index) => (
          <circle key={point.date} cx={xScale(index)} cy={yScale(point.css)} r="4.5" fill="#18D8FF" stroke="#061327" strokeWidth="2">
            <title>{`${formatShortDate(point.date, locale)} · CSS ${formatPace(point.css)}`}</title>
          </circle>
        ))}
        {points.map((point, index) =>
          index === points.length - 1 || points.length === 1 ? (
            <text
              key={`label-${point.date}`}
              x={xScale(index)}
              y={yScale(point.css) - 9}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#F7FBFF"
            >
              {formatDuration(point.css)}
            </text>
          ) : null
        )}
        {points.map((point, index) => (
          <text
            key={`x-${point.date}`}
            x={xScale(index)}
            y={viewHeight - 6}
            textAnchor="middle"
            fontSize="9"
            fill="rgba(175,198,224,0.75)"
          >
            {formatShortDate(point.date, locale)}
          </text>
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-swim-steel">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-swim-cyan" />
          {copy.cssTrend.legendLine}
        </span>
        {["Z3", "Z2", "Z1"].map((code) => {
          const color = zoneCodeColors[code] || "#AFC6E0";
          return (
            <span
              key={code}
              className="inline-flex items-center rounded px-1.5 py-0.5 font-bold leading-none"
              style={{ backgroundColor: color, color: zoneTextColor(color) }}
            >
              {code}
            </span>
          );
        })}
        <span>{copy.cssTrend.legendNote}</span>
      </div>
    </div>
  );
}

export function ProgressDashboard({
  copy,
  completions,
  sessions,
  entries,
  locale
}: {
  copy: ProgressCopy;
  completions: PortalTrainingCompletion[];
  sessions: PortalTrainingSession[];
  entries: ClientPerformanceMetric[];
  locale: Locale;
}) {
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-swim-cyan" />
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title={copy.weekly.title} subtitle={copy.weekly.subtitle}>
          <WeeklyVolumeChart copy={copy} completions={completions} sessionsById={sessionsById} locale={locale} />
        </ChartPanel>
        <ChartPanel title={copy.zones.title} subtitle={copy.zones.subtitle}>
          <WorkTypeDonut copy={copy} completions={completions} sessionsById={sessionsById} locale={locale} />
        </ChartPanel>
        <ChartPanel title={copy.calendar.title} subtitle={copy.calendar.subtitle}>
          <ConsistencyCalendar copy={copy} completions={completions} sessionsById={sessionsById} locale={locale} />
        </ChartPanel>
        <ChartPanel title={copy.cssTrend.title} subtitle={copy.cssTrend.subtitle}>
          <CssTrendChart copy={copy} entries={entries} locale={locale} />
        </ChartPanel>
      </CardContent>
    </Card>
  );
}
