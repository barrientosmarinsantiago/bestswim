"use client";

// Componentes de hoja del portal (medidor, ticker, sesión, onboarding). Extraído de client-portal.tsx.

import { useEffect, useState } from "react";
import type { Dispatch } from "react";
import { CalendarDays, Info, Waves } from "lucide-react";

import { SessionDisclosure } from "@/components/content/rich-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ImportedDocument } from "@/content/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  loadPortalTrainingDocument,
  portalWatermark
} from "@/components/portal/portal-loader";
import {
  getCompletionCopy,
  getDashboardCopy,
  getOnboardingCopy
} from "@/components/portal/portal-copy";
import {
  getSessionGroups,
  localizedJson
} from "@/components/portal/portal-utils";
import {
  competitionGoalOptions,
  swimLevelOptions,
  trainingGoalOptions
} from "@/components/portal/portal-types";
import type {
  CompetitionGoal,
  PortalTrainingSession,
  SwimLevel,
  TrainingGoal
} from "@/components/portal/portal-types";

export function ProgressMeter({
  title,
  completed,
  planned,
  percent,
  copy
}: {
  title: string;
  completed: number;
  planned: number;
  percent: number;
  copy: ReturnType<typeof getDashboardCopy>;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-swim-white">{title}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-swim-cyan">{percent}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-swim-cyan" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-xs text-swim-steel">
        {completed}/{planned} {copy.planned}
      </p>
    </div>
  );
}

export function PortalQuoteTicker({ dictionary }: { dictionary: Dictionary }) {
  const quotes = [...dictionary.quoteTicker.items, ...dictionary.quoteTicker.items];

  return (
    <section
      aria-label={dictionary.quoteTicker.label}
      className="relative min-w-0 max-w-full overflow-hidden rounded-md border border-swim-cyan/20 bg-swim-ink/80 py-4"
    >
      <span className="sr-only">
        {dictionary.quoteTicker.items.map((item) => `${item.quote} - ${item.author}`).join(". ")}
      </span>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-swim-ink to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-swim-ink to-transparent sm:w-24" />
      <div className="bestswim-marquee-track flex w-max items-center" style={{ animationDuration: "82s" }} aria-hidden="true">
        {quotes.map((item, index) => (
          <div key={`${item.author}-${index}`} className="flex shrink-0 items-center gap-5 px-7 sm:px-10">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-swim-cyan/30 bg-swim-cyan/10">
              <Waves className="h-4 w-4 text-swim-cyan" />
            </span>
            <p className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.1em] text-swim-white sm:text-base">
              <span className="text-swim-cyan">&quot;</span>
              {item.quote}
              <span className="text-swim-cyan">&quot;</span>
              <span className="ml-3 text-swim-steel">- {item.author}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

type CompletionControlProps = {
  checked: boolean;
  disabled: boolean;
  copy: ReturnType<typeof getCompletionCopy>;
  onToggle: () => void;
};

type PortalSessionCardProps = {
  item: PortalTrainingSession;
  locale: Locale;
  dictionary: Dictionary;
  completionCopy: ReturnType<typeof getCompletionCopy>;
  scheduleLabel: string;
  completed: boolean;
  pending: boolean;
  onCompletionToggle: () => void;
};

export function CompletionControl({
  checked,
  disabled,
  copy,
  onToggle
}: CompletionControlProps) {
  return (
    <label
      className={cn(
        "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition",
        checked
          ? "border-swim-cyan bg-swim-cyan/[0.15] text-swim-aqua"
          : "border-white/10 bg-white/[0.05] text-swim-white hover:border-swim-cyan/60 hover:bg-swim-cyan/[0.08]",
        disabled && "cursor-wait opacity-70"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        className="h-4 w-4 rounded border-white/20 bg-swim-navy accent-swim-cyan"
      />
      {disabled ? copy.saving : checked ? copy.done : copy.markDone}
    </label>
  );
}

export function PortalSessionCard({
  item,
  locale,
  dictionary,
  completionCopy,
  scheduleLabel,
  completed,
  pending,
  onCompletionToggle
}: PortalSessionCardProps) {
  const itemGroups = getSessionGroups(item);
  const title = localizedJson(item.title, locale);
  const sourceKey = item.source_key;
  const [importedDocument, setImportedDocument] = useState<ImportedDocument | null>(null);
  const [documentState, setDocumentState] = useState<"idle" | "loading" | "ready">(sourceKey ? "loading" : "idle");
  const loadingLabel = locale === "en" ? "Loading session…" : locale === "pt" ? "A carregar sessão…" : "Cargando sesión…";

  useEffect(() => {
    if (!sourceKey) {
      return;
    }

    let active = true;

    loadPortalTrainingDocument(sourceKey, locale).then((document) => {
      if (!active) {
        return;
      }

      setImportedDocument(document);
      setDocumentState("ready");
    });

    return () => {
      active = false;
    };
  }, [sourceKey, locale]);

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-swim-ink/[0.58] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-swim-steel">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-swim-cyan" />
            {scheduleLabel}
          </span>
          <span>{dictionary.portal.difficulty}: {item.difficulty}</span>
          {completed ? <Badge>{completionCopy.completedBadge}</Badge> : null}
        </div>
        <CompletionControl
          checked={completed}
          disabled={pending}
          copy={completionCopy}
          onToggle={onCompletionToggle}
        />
      </div>

      {importedDocument ? (
        <SessionDisclosure
          document={{
            ...importedDocument,
            title: title || importedDocument.title
          }}
          watermark={portalWatermark}
        />
      ) : documentState === "loading" ? (
        <div className="rounded-md border border-white/10 bg-white/[0.07] p-4 text-sm text-swim-steel" aria-busy="true">
          {loadingLabel}
        </div>
      ) : (
        <div className="rounded-md border border-white/10 bg-white/[0.07] p-4">
          <h2 className="text-xl font-semibold text-swim-white">{title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-swim-steel">{localizedJson(item.body, locale)}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {itemGroups.map((group) => (
          <Badge key={group.slug}>{localizedJson(group.name, locale) || group.slug}</Badge>
        ))}
        {item.tags?.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
    </article>
  );
}

type OnboardingQuestionnaireProps = {
  copy: ReturnType<typeof getOnboardingCopy>;
  selectedSwimLevel: SwimLevel;
  selectedTrainingGoal: TrainingGoal;
  selectedCompetitionGoal: CompetitionGoal;
  onboardingSaving: boolean;
  submitLabel: string;
  onSwimLevelChange: Dispatch<SwimLevel>;
  onTrainingGoalChange: Dispatch<TrainingGoal>;
  onCompetitionGoalChange: Dispatch<CompetitionGoal>;
  onSubmit: () => void;
};

export function OnboardingQuestionnaire({
  copy,
  selectedSwimLevel,
  selectedTrainingGoal,
  selectedCompetitionGoal,
  onboardingSaving,
  submitLabel,
  onSwimLevelChange,
  onTrainingGoalChange,
  onCompetitionGoalChange,
  onSubmit
}: OnboardingQuestionnaireProps) {
  return (
    <>
      <div
        className={cn(
          "mt-5 grid gap-5",
          selectedTrainingGoal === "preparacion_competitiva" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-swim-cyan">{copy.levelQuestion}</p>
            <span className="group/levelinfo relative inline-flex">
              <button
                type="button"
                aria-label={copy.levelInfo.title}
                className="grid h-5 w-5 place-items-center rounded-full border border-swim-cyan/50 text-swim-cyan transition hover:bg-swim-cyan/[0.16] focus:outline-none focus-visible:ring-2 focus-visible:ring-swim-cyan"
              >
                <Info className="h-3 w-3" />
              </button>
              <div
                role="tooltip"
                className="invisible absolute left-1/2 top-7 z-50 w-[320px] max-w-[82vw] -translate-x-1/2 rounded-xl border border-swim-cyan/30 bg-swim-ink/95 p-4 text-left opacity-0 shadow-xl backdrop-blur transition-opacity duration-150 group-hover/levelinfo:visible group-hover/levelinfo:opacity-100 group-focus-within/levelinfo:visible group-focus-within/levelinfo:opacity-100 sm:w-[360px]"
              >
                <p className="text-sm font-semibold text-swim-white">{copy.levelInfo.title}</p>
                <p className="mt-1 text-xs leading-snug text-swim-steel">{copy.levelInfo.intro}</p>
                <div className="mt-3 grid gap-2.5">
                  {swimLevelOptions.map((level) => {
                    const info = copy.levelInfo[level];
                    return (
                      <div key={level} className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-swim-cyan">{copy.levels[level]}</p>
                        <dl className="mt-1.5 grid gap-1 text-[11px] leading-snug text-swim-white/[0.85]">
                          <div><span className="text-swim-steel">{copy.levelInfo.fields.tecnica}:</span> {info.tecnica}</div>
                          <div><span className="text-swim-steel">{copy.levelInfo.fields.experiencia}:</span> {info.experiencia}</div>
                          <div><span className="text-swim-steel">{copy.levelInfo.fields.ritmo}:</span> {info.ritmo}</div>
                          <div><span className="text-swim-steel">{copy.levelInfo.fields.volumen}:</span> {info.volumen}</div>
                        </dl>
                      </div>
                    );
                  })}
                </div>
              </div>
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {swimLevelOptions.map((level) => (
              <button
                key={level}
                type="button"
                disabled={onboardingSaving}
                onClick={() => onSwimLevelChange(level)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
                  selectedSwimLevel === level
                    ? "border-swim-cyan bg-swim-cyan/[0.16] text-swim-white"
                    : "border-white/10 bg-white/[0.045] text-swim-steel hover:border-swim-cyan/60 hover:text-swim-white"
                )}
              >
                {copy.levels[level]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-swim-cyan">{copy.goalQuestion}</p>
          <div className="mt-3 grid gap-2">
            {trainingGoalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                disabled={onboardingSaving}
                onClick={() => onTrainingGoalChange(goal)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
                  selectedTrainingGoal === goal
                    ? "border-swim-cyan bg-swim-cyan/[0.16] text-swim-white"
                    : "border-white/10 bg-white/[0.045] text-swim-steel hover:border-swim-cyan/60 hover:text-swim-white"
                )}
              >
                {copy.goals[goal]}
              </button>
            ))}
          </div>
        </div>

        {selectedTrainingGoal === "preparacion_competitiva" ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-swim-cyan">{copy.competitionQuestion}</p>
            <div className="mt-3 grid gap-2">
              {competitionGoalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  disabled={onboardingSaving}
                  onClick={() => onCompetitionGoalChange(goal)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm font-semibold transition",
                    selectedCompetitionGoal === goal
                      ? "border-swim-cyan bg-swim-cyan/[0.16] text-swim-white"
                      : "border-white/10 bg-white/[0.045] text-swim-steel hover:border-swim-cyan/60 hover:text-swim-white"
                  )}
                >
                  {copy.competitionGoals[goal]}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <Button className="mt-5" variant="secondary" onClick={onSubmit} disabled={onboardingSaving}>
        {onboardingSaving ? copy.saving : submitLabel}
      </Button>
    </>
  );
}





// Componentes de métricas en ./portal-performance.tsx
