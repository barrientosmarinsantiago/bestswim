"use client";

// Componentes de métricas de rendimiento. Extraído de client-portal.tsx.

import type { Dispatch, ReactNode } from "react";
import { LineChart, Maximize2, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";
import { zoneCodeColors, zoneTextColor } from "@/content/zones";
import { getPerformanceCopy } from "@/components/portal/portal-copy";
import {
  clamp,
  formatDuration,
  formatPace,
  formatShortDate,
  getMetricEntries,
  getMonthIndexFromRegistration,
  parseSessionDate
} from "@/components/portal/portal-utils";
import {
  performanceMetricTypes
} from "@/components/portal/portal-types";
import type {
  ClientPerformanceMetric,
  PerformanceDraft,
  PerformanceMetricConfig,
  PerformanceMetricType
} from "@/components/portal/portal-types";

function getPerformanceStats(entries: ClientPerformanceMetric[], config: PerformanceMetricConfig) {
  const latest = entries[entries.length - 1] || null;
  const first = entries[0] || null;
  const best = entries.length
    ? entries.reduce((currentBest, entry) => (entry.value_seconds < currentBest.value_seconds ? entry : currentBest), entries[0])
    : null;
  const delta = latest && first ? first.value_seconds - latest.value_seconds : 0;

  return {
    latest: latest ? config.formatValue(latest.value_seconds) : "--",
    best: best ? config.formatValue(best.value_seconds) : "--",
    delta: delta ? `${delta > 0 ? "-" : "+"}${formatDuration(Math.abs(delta))}` : "--"
  };
}

function buildNumberTicks(min: number, max: number, maxTicks = 4) {
  if (max <= min) {
    return [min];
  }

  const range = max - min;

  if (range <= maxTicks - 1) {
    return Array.from({ length: range + 1 }, (_, index) => min + index);
  }

  const step = Math.max(1, Math.ceil(range / (maxTicks - 1)));
  const ticks = new Set<number>([min, max]);

  for (let value = min + step; value < max; value += step) {
    ticks.add(value);
  }

  return Array.from(ticks).sort((first, second) => first - second).slice(0, maxTicks);
}

type ZoneLine = { code: string; seconds: number };

// Última CSS válida (requiere ambos tests y que el 400m sea mayor que el 200m).
function computeLatestCss(entries: ClientPerformanceMetric[]): number | null {
  const latest200 = getMetricEntries(entries, "test_200m").at(-1);
  const latest400 = getMetricEntries(entries, "test_400m").at(-1);

  if (!latest200 || !latest400 || latest400.value_seconds <= latest200.value_seconds) {
    return null;
  }

  return (latest400.value_seconds - latest200.value_seconds) / 2;
}

// Ritmo objetivo de cada zona escalado a la distancia del test (200m ×2, 400m ×4).
// Z3 = CSS; Z2 y Z1 usan el punto medio de los offsets del cuadro Best Swim.
const zoneLineMultipliers: Partial<Record<PerformanceMetricType, number>> = {
  test_200m: 2,
  test_400m: 4
};

function buildZoneLines(entries: ClientPerformanceMetric[], type: PerformanceMetricType): ZoneLine[] | undefined {
  const css = computeLatestCss(entries);
  const multiplier = zoneLineMultipliers[type];

  if (!css || !multiplier) {
    return undefined;
  }

  return [
    { code: "Z1", seconds: (css + 15) * multiplier },
    { code: "Z2", seconds: (css + 8.5) * multiplier },
    { code: "Z3", seconds: css * multiplier }
  ];
}

export function PerformanceChart({
  config,
  entries,
  registrationDate,
  locale,
  emptyLabel,
  expanded = false,
  zoneLines
}: {
  config: PerformanceMetricConfig;
  entries: ClientPerformanceMetric[];
  registrationDate: string | null | undefined;
  locale: Locale;
  emptyLabel: string;
  expanded?: boolean;
  zoneLines?: ZoneLine[];
}) {
  const viewWidth = expanded ? 680 : 360;
  const viewHeight = expanded ? 320 : 210;
  const margin = expanded
    ? { top: 24, right: 28, bottom: 48, left: 72 }
    : { top: 20, right: 18, bottom: 38, left: 58 };
  const plotWidth = viewWidth - margin.left - margin.right;
  const plotHeight = viewHeight - margin.top - margin.bottom;
  const yScale = (value: number) => {
    const clamped = clamp(value, config.yMinSeconds, config.yMaxSeconds);
    return margin.top + ((clamped - config.yMinSeconds) / (config.yMaxSeconds - config.yMinSeconds)) * plotHeight;
  };
  const monthValues = entries.map((entry) => getMonthIndexFromRegistration(registrationDate, entry.measured_at));
  const dateValues = entries.map((entry) => parseSessionDate(entry.measured_at).getTime());
  const minMonth = 1;
  const maxMonth = Math.max(2, ...monthValues, 2);
  const minDate = dateValues.length ? Math.min(...dateValues) : 0;
  const maxDate = dateValues.length ? Math.max(...dateValues) : 0;
  const dateRange = Math.max(1, maxDate - minDate);
  const xScale = (entry: ClientPerformanceMetric) => {
    if (entries.length <= 1) {
      return margin.left + plotWidth / 2;
    }

    if (config.xMode === "registration_month") {
      const month = getMonthIndexFromRegistration(registrationDate, entry.measured_at);
      return margin.left + ((month - minMonth) / (maxMonth - minMonth)) * plotWidth;
    }

    return margin.left + ((parseSessionDate(entry.measured_at).getTime() - minDate) / dateRange) * plotWidth;
  };
  const points = entries.map((entry) => ({
    entry,
    x: xScale(entry),
    y: yScale(entry.value_seconds)
  }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const xTicks =
    config.xMode === "registration_month"
      ? buildNumberTicks(minMonth, maxMonth, expanded ? 6 : 4).map((month) => ({
          x: margin.left + ((month - minMonth) / (maxMonth - minMonth)) * plotWidth,
          label: `M${month}`
        }))
      : (entries.length
          ? entries.filter((_, index) =>
              entries.length <= (expanded ? 6 : 3)
                ? true
                : index === 0 || index === entries.length - 1 || index === Math.floor(entries.length / 2)
            )
          : []
        ).map((entry) => ({
          x: xScale(entry),
          label: formatShortDate(entry.measured_at, locale)
        }));

  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-swim-ink/[0.58]">
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className={cn("w-full", expanded ? "h-80" : "h-52")} role="img">
        <rect width={viewWidth} height={viewHeight} fill="transparent" />
        {config.yTicks.map((tick) => {
          const y = yScale(tick);

          return (
            <g key={tick}>
              <line x1={margin.left} x2={viewWidth - margin.right} y1={y} y2={y} stroke="rgba(255,255,255,0.10)" />
              <text x={margin.left - 10} y={y + 4} textAnchor="end" className="fill-swim-steel text-[11px]">
                {config.type === "pace_100m" ? formatPace(tick) : formatDuration(tick)}
              </text>
            </g>
          );
        })}
        {xTicks.map((tick) => (
          <g key={`${tick.label}-${tick.x}`}>
            <line x1={tick.x} x2={tick.x} y1={margin.top} y2={viewHeight - margin.bottom} stroke="rgba(255,255,255,0.06)" />
            <text x={tick.x} y={viewHeight - 14} textAnchor="middle" className="fill-swim-steel text-[11px]">
              {tick.label}
            </text>
          </g>
        ))}
        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={viewHeight - margin.bottom} stroke="rgba(255,255,255,0.18)" />
        <line
          x1={margin.left}
          x2={viewWidth - margin.right}
          y1={viewHeight - margin.bottom}
          y2={viewHeight - margin.bottom}
          stroke="rgba(255,255,255,0.18)"
        />
        {(zoneLines || []).map((zone) => {
          if (zone.seconds < config.yMinSeconds || zone.seconds > config.yMaxSeconds) {
            return null;
          }

          const y = yScale(zone.seconds);
          const color = zoneCodeColors[zone.code] || "#AFC6E0";

          return (
            <g key={zone.code}>
              <line
                x1={margin.left}
                x2={viewWidth - margin.right}
                y1={y}
                y2={y}
                stroke={color}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                opacity={0.85}
              />
              <text x={viewWidth - margin.right + 3} y={y + 3} fontSize="10" fontWeight="700" fill={color}>
                {zone.code}
              </text>
            </g>
          );
        })}
        {points.length > 1 ? <path d={linePath} fill="none" stroke="rgb(34,211,238)" strokeWidth={3} strokeLinecap="round" /> : null}
        {points.map((point) => (
          <g key={point.entry.id}>
            <circle cx={point.x} cy={point.y} r={expanded ? 6 : 5} fill="rgb(34,211,238)" stroke="rgb(4,19,36)" strokeWidth={3} />
            {expanded ? (
              <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-swim-white text-[11px] font-semibold">
                {config.formatValue(point.entry.value_seconds)}
              </text>
            ) : null}
          </g>
        ))}
        {!points.length ? (
          <text x={viewWidth / 2} y={viewHeight / 2} textAnchor="middle" className="fill-swim-steel text-[13px]">
            {emptyLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
}

export function PerformanceMetricPanel({
  config,
  entries,
  draft,
  saving,
  copy,
  registrationDate,
  locale,
  expanded = false,
  zoneLines,
  onDraftChange,
  onSave,
  onMaximize
}: {
  config: PerformanceMetricConfig;
  entries: ClientPerformanceMetric[];
  draft: PerformanceDraft;
  saving: boolean;
  copy: ReturnType<typeof getPerformanceCopy>;
  registrationDate: string | null | undefined;
  locale: Locale;
  expanded?: boolean;
  zoneLines?: ZoneLine[];
  onDraftChange: Dispatch<Partial<PerformanceDraft>>;
  onSave: () => void;
  onMaximize?: () => void;
}) {
  const stats = getPerformanceStats(entries, config);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-swim-white">{config.title}</p>
          <p className="mt-1 text-xs leading-5 text-swim-steel">{config.description}</p>
        </div>
        {onMaximize ? (
          <Button type="button" variant="ghost" size="icon" onClick={onMaximize} title={copy.maximize} aria-label={copy.maximize}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-swim-cyan">{copy.latest}</p>
          <p className="mt-2 text-lg font-semibold text-swim-white">{stats.latest}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-swim-cyan">{copy.best}</p>
          <p className="mt-2 text-lg font-semibold text-swim-white">{stats.best}</p>
        </div>
        <div className="rounded-md border border-white/10 bg-white/[0.045] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-swim-cyan">{copy.points}</p>
          <p className="mt-2 text-lg font-semibold text-swim-white">{entries.length}</p>
        </div>
      </div>

      <PerformanceChart
        config={config}
        entries={entries}
        registrationDate={registrationDate}
        locale={locale}
        emptyLabel={copy.empty}
        expanded={expanded}
        zoneLines={zoneLines}
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-swim-cyan">{copy.dateLabel}</span>
          <Input type="date" value={draft.measuredAt} onChange={(event) => onDraftChange({ measuredAt: event.target.value })} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-swim-cyan">{config.valueLabel}</span>
          <Input
            value={draft.value}
            onChange={(event) => onDraftChange({ value: event.target.value })}
            placeholder={config.placeholder}
            inputMode="decimal"
          />
        </label>
        <Button type="button" variant="secondary" className="self-end" onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? copy.saving : copy.save}
        </Button>
      </div>

      {expanded ? (
        <div className="max-h-72 overflow-y-auto rounded-md border border-white/10 bg-white/[0.045]">
          <div className="grid grid-cols-[1fr_1fr] border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-swim-cyan">
            <span>{copy.history}</span>
            <span>{config.valueLabel}</span>
          </div>
          {entries.length ? (
            entries
              .slice()
              .reverse()
              .map((entry) => (
                <div key={entry.id} className="grid grid-cols-[1fr_1fr] border-b border-white/10 px-3 py-2 text-sm text-swim-steel last:border-b-0">
                  <span>{formatShortDate(entry.measured_at, locale)}</span>
                  <span className="font-semibold text-swim-white">{config.formatValue(entry.value_seconds)}</span>
                </div>
              ))
          ) : (
            <p className="px-3 py-4 text-sm text-swim-steel">{copy.empty}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

// Ritmos por zona con el método CSS (velocidad crítica): Z3 = (T400 − T200) / 2 por 100m;
// Z2 y Z1 se estiman con los offsets del cuadro de zonas Best Swim (+7–10s y +10–20s /100m).
const CSS_ZONE_SPAN_SECONDS = 20;
const cssZoneBands = [
  { key: "z3" as const, code: "Z3", fromOffset: 0, toOffset: 7 },
  { key: "z2" as const, code: "Z2", fromOffset: 7, toOffset: 10 },
  { key: "z1" as const, code: "Z1", fromOffset: 10, toOffset: 20 }
];

export function CssZonesPanel({
  copy,
  entries
}: {
  copy: ReturnType<typeof getPerformanceCopy>;
  entries: ClientPerformanceMetric[];
}) {
  const zonesCopy = copy.cssZones;
  const latest200 = getMetricEntries(entries, "test_200m").at(-1);
  const latest400 = getMetricEntries(entries, "test_400m").at(-1);

  let body: ReactNode;

  if (!latest200 || !latest400) {
    body = <p className="text-sm text-swim-steel">{zonesCopy.missing}</p>;
  } else if (latest400.value_seconds <= latest200.value_seconds) {
    body = <p className="text-sm text-swim-steel">{zonesCopy.invalid}</p>;
  } else {
    const css = (latest400.value_seconds - latest200.value_seconds) / 2;
    const zoneRows = [
      { key: "z1" as const, code: "Z1", range: `${formatDuration(css + 10)} – ${formatDuration(css + 20)}` },
      { key: "z2" as const, code: "Z2", range: `${formatDuration(css + 7)} – ${formatDuration(css + 10)}` },
      { key: "z3" as const, code: "Z3", range: formatDuration(css) }
    ];

    body = (
      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-swim-steel">{zonesCopy.cssLabel}</span>
          <span className="text-2xl font-semibold text-swim-white">{formatPace(css)}</span>
        </div>

        <div>
          <div className="flex h-9 w-full overflow-hidden rounded-md border border-white/10">
            {cssZoneBands.map((band) => {
              const color = zoneCodeColors[band.code];
              return (
                <div
                  key={band.key}
                  className="grid place-items-center text-xs font-bold"
                  style={{
                    width: `${((band.toOffset - band.fromOffset) / CSS_ZONE_SPAN_SECONDS) * 100}%`,
                    backgroundColor: color,
                    color: zoneTextColor(color)
                  }}
                >
                  {band.code}
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex w-full text-[11px] leading-4 text-swim-steel">
            <span style={{ width: "35%" }}>{formatDuration(css)}</span>
            <span style={{ width: "15%" }}>{formatDuration(css + 7)}</span>
            <span style={{ width: "50%" }} className="flex justify-between">
              <span>{formatDuration(css + 10)}</span>
              <span>{formatDuration(css + 20)}{zonesCopy.per100}</span>
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          {zoneRows.map((zone) => {
            const color = zoneCodeColors[zone.code];
            return (
              <div key={zone.key} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.045] px-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="inline-flex flex-none items-center rounded px-1.5 py-0.5 text-[0.8em] font-bold leading-none"
                    style={{ backgroundColor: color, color: zoneTextColor(color) }}
                  >
                    {zone.code}
                  </span>
                  <span className="truncate text-sm text-swim-white/[0.85]">{zonesCopy.zoneNames[zone.key]}</span>
                </span>
                <span className="flex-none text-right">
                  <span className="block text-sm font-semibold text-swim-white">{zone.range}{zonesCopy.per100}</span>
                  <span className="block text-[11px] text-swim-steel">{zonesCopy.zoneHints[zone.key]}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-swim-white">{zonesCopy.title}</p>
      <p className="mb-3 text-xs text-swim-steel">{zonesCopy.subtitle}</p>
      {body}
      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-swim-steel">{zonesCopy.legend}</p>
    </div>
  );
}

export function PerformanceDashboard({
  copy,
  configs,
  entries,
  selectedType,
  drafts,
  savingTypes,
  registrationDate,
  locale,
  onSelectedTypeChange,
  onDraftChange,
  onSave,
  onMaximize
}: {
  copy: ReturnType<typeof getPerformanceCopy>;
  configs: Record<PerformanceMetricType, PerformanceMetricConfig>;
  entries: ClientPerformanceMetric[];
  selectedType: PerformanceMetricType;
  drafts: Record<PerformanceMetricType, PerformanceDraft>;
  savingTypes: PerformanceMetricType[];
  registrationDate: string | null | undefined;
  locale: Locale;
  onSelectedTypeChange: Dispatch<PerformanceMetricType>;
  onDraftChange: Dispatch<{ type: PerformanceMetricType; draft: Partial<PerformanceDraft> }>;
  onSave: Dispatch<PerformanceMetricType>;
  onMaximize: Dispatch<PerformanceMetricType>;
}) {
  const selectedConfig = configs[selectedType];
  const selectedEntries = getMetricEntries(entries, selectedType);

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-swim-cyan" />
          <CardTitle className="text-2xl">{copy.title}</CardTitle>
        </div>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {performanceMetricTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSelectedTypeChange(type)}
              className={cn(
                "min-h-10 rounded-md border px-2 py-2 text-xs font-semibold transition",
                selectedType === type
                  ? "border-swim-cyan bg-swim-cyan/[0.16] text-swim-white"
                  : "border-white/10 bg-white/[0.045] text-swim-steel hover:border-swim-cyan/60 hover:text-swim-white"
              )}
            >
              {configs[type].shortTitle}
            </button>
          ))}
        </div>
        <PerformanceMetricPanel
          config={selectedConfig}
          entries={selectedEntries}
          draft={drafts[selectedType]}
          saving={savingTypes.includes(selectedType)}
          copy={copy}
          registrationDate={registrationDate}
          locale={locale}
          zoneLines={buildZoneLines(entries, selectedType)}
          onDraftChange={(draft) => onDraftChange({ type: selectedType, draft })}
          onSave={() => onSave(selectedType)}
          onMaximize={() => onMaximize(selectedType)}
        />
        <CssZonesPanel copy={copy} entries={entries} />
      </CardContent>
    </Card>
  );
}

export function PerformanceMetricModal({
  copy,
  configs,
  entries,
  selectedType,
  drafts,
  savingTypes,
  registrationDate,
  locale,
  onSelectedTypeChange,
  onDraftChange,
  onSave,
  onClose
}: {
  copy: ReturnType<typeof getPerformanceCopy>;
  configs: Record<PerformanceMetricType, PerformanceMetricConfig>;
  entries: ClientPerformanceMetric[];
  selectedType: PerformanceMetricType;
  drafts: Record<PerformanceMetricType, PerformanceDraft>;
  savingTypes: PerformanceMetricType[];
  registrationDate: string | null | undefined;
  locale: Locale;
  onSelectedTypeChange: Dispatch<PerformanceMetricType>;
  onDraftChange: Dispatch<{ type: PerformanceMetricType; draft: Partial<PerformanceDraft> }>;
  onSave: Dispatch<PerformanceMetricType>;
  onClose: () => void;
}) {
  const selectedConfig = configs[selectedType];
  const selectedEntries = getMetricEntries(entries, selectedType);

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-swim-navy/[0.86] p-4 backdrop-blur-xl">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-white/[0.12] bg-swim-ink p-4 shadow-lift sm:p-6"
      >
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge>{copy.history}</Badge>
            <h2 className="mt-3 text-3xl font-semibold text-swim-white">{copy.title}</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label={copy.close} title={copy.close}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {performanceMetricTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onSelectedTypeChange(type)}
              className={cn(
                "min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition",
                selectedType === type
                  ? "border-swim-cyan bg-swim-cyan/[0.16] text-swim-white"
                  : "border-white/10 bg-white/[0.045] text-swim-steel hover:border-swim-cyan/60 hover:text-swim-white"
              )}
            >
              {configs[type].title}
            </button>
          ))}
        </div>

        <PerformanceMetricPanel
          config={selectedConfig}
          entries={selectedEntries}
          draft={drafts[selectedType]}
          saving={savingTypes.includes(selectedType)}
          copy={copy}
          registrationDate={registrationDate}
          locale={locale}
          expanded
          zoneLines={buildZoneLines(entries, selectedType)}
          onDraftChange={(draft) => onDraftChange({ type: selectedType, draft })}
          onSave={() => onSave(selectedType)}
        />
      </div>
    </div>
  );
}
