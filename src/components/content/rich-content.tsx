"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, Clock, FileText, Search, Waves } from "lucide-react";
import {
  getContentAccessLimit,
  getLockedContentVariant,
  LockedContentCard,
  type ContentAccessLevel,
  type LockedContentVariant
} from "@/components/content/content-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ContentBlock, ImportedChallenge, ImportedDocument, ImportedSection, RichRun, TableCell } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { colorForZoneToken, zoneLegend, zoneTextColor, zoneTokenPattern } from "@/content/zones";
import { cn } from "@/lib/utils";

// El mapeo de colores por zona/intensidad vive en src/content/zones.json (fuente única).
// Ver docs/COLORES-ZONAS-ENTRENAMIENTO.md y la rutina scripts/validate-sessions.mjs.
const openWaterSectionHref = "/natacion/aguas-abiertas-y-triatlon";
const trainingSectionHref = "/natacion/entrenamiento";
const searchableSectionHrefs = new Set(["/natacion/tecnica", trainingSectionHref, openWaterSectionHref, "/natacion/multimedia"]);

const contentLabels = {
  es: {
    swimming: "Natación",
    challenge: "Reto",
    sessions: "Sesiones",
    sessionsLower: "sesiones",
    collapsibleSessions: "sesiones colapsables",
    contents: "contenidos",
    searchPlaceholder: "Buscar sesión",
    noResults: "No se encontraron sesiones para"
  },
  en: {
    swimming: "Swimming",
    challenge: "Challenge",
    sessions: "Sessions",
    sessionsLower: "sessions",
    collapsibleSessions: "collapsible sessions",
    contents: "content items",
    searchPlaceholder: "Search session",
    noResults: "No sessions found for"
  },
  pt: {
    swimming: "Natação",
    challenge: "Desafio",
    sessions: "Sessões",
    sessionsLower: "sessões",
    collapsibleSessions: "sessões colapsáveis",
    contents: "conteúdos",
    searchPlaceholder: "Buscar sessão",
    noResults: "Não foram encontradas sessões para"
  }
} as const;

type TrainingGroup = ImportedSection["groups"][number];

type AccessControlledDocument = {
  document: ImportedDocument;
  lockedVariant: LockedContentVariant | null;
};

type AccessControlledTrainingGroup = Omit<TrainingGroup, "documents"> & {
  documents: AccessControlledDocument[];
};

type AccessControlledPreparationPlan = Omit<SplitPreparationPlan, "sessions"> & {
  document: ImportedDocument;
  hasSplitSessions: boolean;
  sessions: AccessControlledDocument[];
  lockedVariant: LockedContentVariant | null;
};

type AccessControlledPreparationGroup = Omit<TrainingGroup, "documents"> & {
  documents: ImportedDocument[];
  plans: AccessControlledPreparationPlan[];
};

type SplitPreparationPlan = {
  introBlocks: ContentBlock[];
  sessions: ImportedDocument[];
};

function readableStyle(run: RichRun): CSSProperties {
  const style: CSSProperties = {};

  if (run.color) {
    style.color = run.color;
  }

  if (run.background) {
    style.backgroundColor = run.background;
    style.color = "#061327";
    style.borderRadius = "0.25rem";
    style.padding = "0.05rem 0.25rem";
  }

  if (run.bold) {
    style.fontWeight = 700;
  }

  if (run.italic) {
    style.fontStyle = "italic";
  }

  if (run.underline) {
    style.textDecoration = "underline";
  }

  return style;
}

function ZoneAwareText({ text }: { text: string }) {
  const parts = text.split(zoneTokenPattern);

  return (
    <>
      {parts.map((part, index) => {
        const color = colorForZoneToken(part);
        if (!color) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }

        return (
          <span
            key={`${part}-${index}`}
            className="mx-0.5 inline-block rounded px-1.5 py-0.5 text-[0.92em] font-bold leading-none"
            style={{ backgroundColor: color, color: zoneTextColor(color) }}
          >
            {part}
          </span>
        );
      })}
    </>
  );
}

function ZoneLegend({ light = false }: { light?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs",
        light ? "border-swim-ink/10 bg-white/70" : "border-white/10 bg-white/[0.04]"
      )}
    >
      <span className={cn("font-semibold uppercase tracking-[0.14em]", light ? "text-[#155a82]" : "text-swim-steel")}>
        Intensidad
      </span>
      {zoneLegend.map((zone) => (
        <span
          key={zone.label}
          title={zone.name}
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[0.85em] font-bold leading-none"
          style={{ backgroundColor: zone.color, color: zoneTextColor(zone.color) }}
        >
          {zone.label}
        </span>
      ))}
    </div>
  );
}

function RichText({ runs }: { runs: RichRun[] }) {
  return (
    <>
      {runs.map((run, index) => {
        // Solo se desactiva el coloreado de zona si el run trae color/fondo explícito del
        // documento. La negrita/cursiva/subrayado sí pasan por ZoneAwareText, para que los
        // tokens de zona (AEL, AEM, ZONA1…) se coloreen también en títulos y líneas en negrita.
        const hasExplicitStyle = Boolean(run.color || run.background);
        return (
          <span key={`${run.text}-${index}`} style={readableStyle(run)} className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {hasExplicitStyle ? run.text : <ZoneAwareText text={run.text} />}
          </span>
        );
      })}
    </>
  );
}

function Paragraph({ block, light = false }: { block: Extract<ContentBlock, { type: "paragraph" }>; light?: boolean }) {
  if (block.variant === "title") {
    return <h3 className={cn("text-2xl font-semibold", light ? "text-swim-ink" : "text-swim-white")}><RichText runs={block.runs} /></h3>;
  }

  if (block.variant === "heading") {
    return <h4 className={cn("pt-5 text-lg font-semibold uppercase tracking-[0.14em]", light ? "text-[#155a82]" : "text-swim-aqua")}><RichText runs={block.runs} /></h4>;
  }

  if (block.variant === "subheading") {
    return <p className={cn("mt-5 rounded-md border px-4 py-3 font-semibold", light ? "border-[#155a82]/25 bg-[#155a82]/[0.08] text-[#0f4a6b]" : "border-swim-cyan/[0.22] bg-swim-cyan/[0.08] text-swim-aqua")}><RichText runs={block.runs} /></p>;
  }

  if (block.variant === "note") {
    return <p className={cn("rounded-md border px-4 py-3 leading-7", light ? "border-swim-ink/10 bg-white text-[#243748]" : "border-white/10 bg-white/[0.06] text-swim-white/[0.86]")}><RichText runs={block.runs} /></p>;
  }

  return <p className={cn("leading-8", light ? "text-[#1b2b3d]" : "text-swim-white/[0.84]")}><RichText runs={block.runs} /></p>;
}

function Cell({ cell, header, light = false }: { cell: TableCell; header: boolean; light?: boolean }) {
  const style: CSSProperties = {};
  if (cell.background) {
    style.backgroundColor = cell.background;
    style.color = "#061327";
  }

  const Tag = header ? "th" : "td";

  return (
    <Tag
      className={cn(
        "min-w-36 border px-4 py-3 text-left align-top text-sm leading-6",
        light ? "border-swim-ink/10" : "border-white/10",
        header
          ? light
            ? "bg-[#dce9f6] font-semibold text-swim-ink"
            : "bg-white/[0.1] font-semibold text-swim-white"
          : light
            ? "text-[#243748]"
            : "text-swim-white/[0.82]"
      )}
      style={style}
    >
      <RichText runs={cell.runs} />
    </Tag>
  );
}

function RichTable({ block, light = false }: { block: Extract<ContentBlock, { type: "table" }>; light?: boolean }) {
  return (
    <div className={cn("max-w-full overflow-x-auto rounded-lg border", light ? "border-swim-ink/10" : "border-white/10")}>
      <table className={cn("w-full border-collapse", light ? "bg-white" : "bg-swim-navy/[0.42]")}>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={row.map((cell) => cell.text).join("-") || rowIndex}>
              {row.map((cell, cellIndex) => (
                <Cell key={`${rowIndex}-${cellIndex}-${cell.text}`} cell={cell} header={rowIndex === 0} light={light} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentBlocks({ blocks, light = false }: { blocks: ContentBlock[]; light?: boolean }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) =>
        block.type === "table" ? (
          <RichTable key={`table-${index}`} block={block} light={light} />
        ) : (
          <Paragraph key={`paragraph-${index}-${block.text}`} block={block} light={light} />
        )
      )}
    </div>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function blockSearchText(block: ContentBlock) {
  if (block.type === "table") {
    return block.rows.map((row) => row.map((cell) => cell.text).join(" ")).join(" ");
  }

  return block.text;
}

function matchesText(value: string, query: string) {
  const normalizedQuery = normalizeSearch(query);
  return !normalizedQuery || normalizeSearch(value).includes(normalizedQuery);
}

function matchesDocument(document: ImportedDocument, query: string) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return true;
  }

  const searchableText = [
    document.title,
    document.summary,
    document.total || "",
    ...document.categoryPath,
    ...document.blocks.map(blockSearchText)
  ].join(" ");

  return normalizeSearch(searchableText).includes(normalizedQuery);
}

function isSessionHeading(block: ContentBlock): block is Extract<ContentBlock, { type: "paragraph" }> {
  return block.type === "paragraph" && /^sesion\s+\d+/.test(normalizeSearch(block.text));
}

function summarizeBlocks(blocks: ContentBlock[]) {
  const paragraph = blocks.find((block) => block.type === "paragraph" && block.text.trim() && !isSessionHeading(block));
  const text = paragraph?.type === "paragraph" ? paragraph.text.trim() : "";
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function splitPreparationPlan(document: ImportedDocument): SplitPreparationPlan {
  const introBlocks: ContentBlock[] = [];
  const sessions: ImportedDocument[] = [];
  let currentTitle = "";
  let currentBlocks: ContentBlock[] = [];

  function pushCurrentSession() {
    if (!currentTitle) {
      return;
    }

    sessions.push({
      ...document,
      id: `${document.id}-session-${sessions.length + 1}`,
      title: currentTitle,
      summary: summarizeBlocks(currentBlocks),
      total: undefined,
      blocks: currentBlocks
    });
  }

  document.blocks.forEach((block) => {
    if (isSessionHeading(block)) {
      pushCurrentSession();
      currentTitle = block.text.trim();
      currentBlocks = [];
      return;
    }

    if (currentTitle) {
      currentBlocks.push(block);
    } else {
      introBlocks.push(block);
    }
  });

  pushCurrentSession();

  return { introBlocks, sessions };
}

function countPreparationItems(document: ImportedDocument) {
  return Math.max(1, splitPreparationPlan(document).sessions.length);
}

function getLockedVariantForPosition(
  position: number,
  accessLimit: number,
  lockedVariant: LockedContentVariant | null
) {
  if (!lockedVariant || position <= accessLimit) {
    return null;
  }

  return lockedVariant;
}

export function SessionDisclosure({
  document,
  watermark,
  defaultOpen = false,
  locale,
  lockedVariant = null,
  coachCredit = true
}: {
  document: ImportedDocument;
  watermark: string;
  defaultOpen?: boolean;
  locale?: Locale;
  lockedVariant?: LockedContentVariant | null;
  coachCredit?: boolean;
}) {
  if (lockedVariant && locale) {
    return <LockedContentCard locale={locale} variant={lockedVariant} title={document.title} summary={document.summary} />;
  }

  return (
    <details className="group min-w-0 rounded-lg border border-white/10 bg-white/[0.055] shadow-lift open:border-swim-cyan/[0.32]" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 break-words text-lg font-semibold text-swim-white [overflow-wrap:anywhere]">{document.title}</h3>
            {document.total ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-swim-cyan/[0.12] px-2 py-1 text-xs font-semibold text-swim-aqua">
                <Clock className="h-3.5 w-3.5" />
                {document.total}
              </span>
            ) : null}
          </div>
          {document.summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-swim-steel">{document.summary}</p> : null}
        </div>
        <span className="grid h-8 w-8 flex-none place-items-center rounded-md border border-white/10 text-swim-cyan transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="relative overflow-hidden rounded-b-lg border-t border-swim-ink/10 bg-[#eef4fb] px-5 py-6">
        <img
          src={watermark}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-[min(38%,190px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.06] grayscale"
        />
        <div className="relative z-10">
          <ContentBlocks blocks={document.blocks} light />
          {coachCredit ? <CoachCredit /> : null}
        </div>
      </div>
    </details>
  );
}

// Crédito del entrenador al pie de cada sesión de entrenamiento.
function CoachCredit() {
  return (
    <p className="mt-6 border-t border-swim-ink/10 pt-3 text-xs italic leading-relaxed text-[#5a6b7b]">
      Sesión de entrenamiento creada por{" "}
      <span className="font-semibold not-italic text-[#243748]">Iván Santa Cruz</span> — Entrenador Superior de la RFEN
    </p>
  );
}

function PreparationPlanDisclosure({
  group,
  watermark,
  locale,
  defaultOpen = false
}: {
  group: AccessControlledPreparationGroup;
  watermark: string;
  locale: Locale;
  defaultOpen?: boolean;
}) {
  const labels = contentLabels[locale];
  const sessionCount = group.plans.reduce((count, plan) => count + plan.sessions.length, 0);

  return (
    <details
      className="group/prep min-w-0 rounded-lg border border-swim-cyan/[0.18] bg-swim-ink/[0.58] shadow-lift open:border-swim-cyan/[0.36]"
      open={defaultOpen || undefined}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
        <div className="flex min-w-0 items-start gap-3">
          <Waves className="mt-1 h-6 w-6 flex-none text-swim-cyan" />
          <div className="min-w-0">
            <h2 className="break-words text-xl font-semibold text-swim-white [overflow-wrap:anywhere] sm:text-2xl">{group.title}</h2>
            <p className="mt-1 text-sm text-swim-steel">
              {sessionCount ? `${sessionCount} ${labels.sessionsLower}` : `${group.documents.length} ${labels.contents}`}
            </p>
          </div>
        </div>
        <span className="grid h-9 w-9 flex-none place-items-center rounded-md border border-white/10 text-swim-cyan transition group-open/prep:rotate-45">
          +
        </span>
      </summary>

      <div className="grid gap-5 border-t border-white/10 px-4 py-5 sm:px-5">
        {group.plans.map((plan) =>
          plan.hasSplitSessions ? (
            <div key={plan.document.id} className="grid gap-4">
              {plan.introBlocks.length ? (
                <div className="rounded-lg border border-swim-ink/10 bg-[#eef4fb] p-4">
                  <ContentBlocks blocks={plan.introBlocks} light />
                </div>
              ) : null}

              <div className="grid gap-3">
                {plan.sessions.map((session) => (
                  <SessionDisclosure
                    key={session.document.id}
                    document={session.document}
                    watermark={watermark}
                    locale={locale}
                    lockedVariant={session.lockedVariant}
                  />
                ))}
              </div>
            </div>
          ) : (
            <SessionDisclosure
              key={plan.document.id}
              document={plan.document}
              watermark={watermark}
              locale={locale}
              lockedVariant={plan.lockedVariant}
            />
          )
        )}
      </div>
    </details>
  );
}

function TrainingGroupDocuments({
  group,
  watermark,
  locale,
  openSingleDocument = true,
  coachCredit = true
}: {
  group: AccessControlledTrainingGroup;
  watermark: string;
  locale: Locale;
  openSingleDocument?: boolean;
  coachCredit?: boolean;
}) {
  return (
    <div className="grid gap-4">
      {group.documents.map((item, index) => (
        <SessionDisclosure
          key={item.document.id}
          document={item.document}
          watermark={watermark}
          locale={locale}
          lockedVariant={item.lockedVariant}
          defaultOpen={openSingleDocument && index === 0 && group.documents.length === 1}
          coachCredit={coachCredit}
        />
      ))}
    </div>
  );
}

function TrainingGroupSection({
  group,
  watermark,
  collapsible = false,
  locale,
  defaultOpen = false,
  coachCredit = true
}: {
  group: AccessControlledTrainingGroup;
  watermark: string;
  collapsible?: boolean;
  locale: Locale;
  defaultOpen?: boolean;
  coachCredit?: boolean;
}) {
  const labels = contentLabels[locale];

  if (collapsible) {
    return (
      <details
        className="group/main min-w-0 rounded-lg border border-swim-cyan/[0.18] bg-swim-ink/[0.58] shadow-lift open:border-swim-cyan/[0.36]"
        open={defaultOpen || undefined}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <Waves className="mt-1 h-6 w-6 flex-none text-swim-cyan" />
            <div className="min-w-0">
              <h2 className="break-words text-xl font-semibold text-swim-white [overflow-wrap:anywhere] sm:text-2xl">{group.title}</h2>
              <p className="mt-1 text-sm text-swim-steel">{group.documents.length} {labels.contents}</p>
            </div>
          </div>
          <span className="grid h-9 w-9 flex-none place-items-center rounded-md border border-white/10 text-swim-cyan transition group-open/main:rotate-45">
            +
          </span>
        </summary>
        <div className="border-t border-white/10 px-4 py-5 sm:px-5">
          <TrainingGroupDocuments group={group} watermark={watermark} locale={locale} openSingleDocument={false} coachCredit={coachCredit} />
        </div>
      </details>
    );
  }

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-swim-ink/[0.52] p-4 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <Waves className="h-6 w-6 text-swim-cyan" />
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold [overflow-wrap:anywhere] sm:text-2xl">{group.title}</h2>
          <p className="text-sm text-swim-steel">{group.documents.length} {labels.contents}</p>
        </div>
      </div>
      <TrainingGroupDocuments group={group} watermark={watermark} locale={locale} coachCredit={coachCredit} />
    </section>
  );
}

export function TrainingSectionPage({
  section,
  locale,
  watermark,
  accessLevel
}: {
  section: ImportedSection;
  locale: Locale;
  watermark: string;
  accessLevel: ContentAccessLevel;
}) {
  const [query, setQuery] = useState("");
  const labels = contentLabels[locale];
  const isOpenWaterSection = section.href === openWaterSectionHref;
  const isTrainingSection = section.href === trainingSectionHref;
  const isSearchableSection = searchableSectionHrefs.has(section.href);
  const accessLimit = getContentAccessLimit(accessLevel);
  const lockedVariant = getLockedContentVariant(accessLevel);
  const renderedGroups = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return section.groups.map((group, groupIndex) => {
      const groupMatchesQuery = matchesText(group.title, query);

      if (isOpenWaterSection) {
        const itemsBeforeGroup = section.groups
          .slice(0, groupIndex)
          .reduce(
            (count, previousGroup) =>
              count + previousGroup.documents.reduce((total, document) => total + countPreparationItems(document), 0),
            0
          );
        const plans = group.documents
          .map((document, documentIndex) => {
            const splitPlan = splitPreparationPlan(document);
            const hasSplitSessions = splitPlan.sessions.length > 0;
            const headerMatchesQuery = groupMatchesQuery || matchesText(document.title, query) || matchesText(document.summary, query);
            const itemsBeforeDocument = group.documents
              .slice(0, documentIndex)
              .reduce((count, previousDocument) => count + countPreparationItems(previousDocument), 0);
            const documentStartPosition = itemsBeforeGroup + itemsBeforeDocument + 1;
            const sessions = splitPlan.sessions
              .map((session, sessionIndex) => ({
                document: session,
                lockedVariant: getLockedVariantForPosition(documentStartPosition + sessionIndex, accessLimit, lockedVariant)
              }))
              .filter((item) => headerMatchesQuery || matchesDocument(item.document, query));
            const documentLock = splitPlan.sessions.length
              ? null
              : getLockedVariantForPosition(documentStartPosition, accessLimit, lockedVariant);

            return {
              ...splitPlan,
              document,
              hasSplitSessions,
              sessions,
              lockedVariant: documentLock
            };
          })
          .filter(
            (plan) =>
              !normalizedQuery ||
              plan.sessions.length ||
              (!plan.hasSplitSessions &&
                (groupMatchesQuery ||
                  matchesText(plan.document.title, query) ||
                  matchesText(plan.document.summary, query) ||
                  matchesDocument(plan.document, query)))
          );

        if (!plans.length) {
          return null;
        }

        return (
          <PreparationPlanDisclosure
            key={group.id}
            group={{ ...group, plans }}
            watermark={watermark}
            locale={locale}
            defaultOpen={Boolean(normalizedQuery)}
          />
        );
      }

      const itemsBeforeGroup = section.groups
        .slice(0, groupIndex)
        .reduce((count, previousGroup) => count + previousGroup.documents.length, 0);
      const documents = group.documents
        .map((document, documentIndex) => ({
          document,
          lockedVariant: getLockedVariantForPosition(itemsBeforeGroup + documentIndex + 1, accessLimit, lockedVariant)
        }))
        .filter((item) => groupMatchesQuery || matchesDocument(item.document, query));

      if (!documents.length) {
        return null;
      }

      return (
        <TrainingGroupSection
          key={group.id}
          group={{ ...group, documents }}
          watermark={watermark}
          collapsible={isTrainingSection}
          locale={locale}
          defaultOpen={Boolean(normalizedQuery)}
          coachCredit={isTrainingSection || isOpenWaterSection}
        />
      );
    });
  }, [accessLimit, isOpenWaterSection, isTrainingSection, locale, lockedVariant, query, section.groups, watermark]);
  const hasResults = renderedGroups.some(Boolean);

  return (
    <main className="min-h-screen bg-swim-navy text-swim-white">
      <div className="section-shell py-10">
        <Button variant="secondary" asChild>
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4" />
            Best Swim
          </Link>
        </Button>
        <section className="grid gap-6 py-12 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <Badge>{labels.swimming}</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">{section.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-swim-steel">{section.description}</p>
          </div>
          {isSearchableSection ? (
            <label className="relative lg:mt-7">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-swim-cyan" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.searchPlaceholder}
                className="pl-10"
              />
            </label>
          ) : null}
        </section>

        <div className="mb-8">
          <ZoneLegend />
        </div>

        <div className="grid gap-8">
          {hasResults ? renderedGroups : (
            <div className="rounded-lg border border-white/10 bg-white/[0.055] p-6 text-sm text-swim-steel">
              {labels.noResults} {query}.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export function ChallengePage({
  challenge,
  locale,
  watermark,
  accessLevel
}: {
  challenge: ImportedChallenge;
  locale: Locale;
  watermark: string;
  accessLevel: ContentAccessLevel;
}) {
  const labels = contentLabels[locale];
  const accessLimit = getContentAccessLimit(accessLevel);
  const lockedVariant = getLockedContentVariant(accessLevel);

  return (
    <main className="min-h-screen bg-swim-navy text-swim-white">
      <section className="relative overflow-hidden bg-swim-ink/[0.72]">
        <div className="absolute inset-0 bg-grid-lines bg-[length:42px_42px] opacity-[0.2]" />
        <div className="section-shell relative py-10">
          <Button variant="secondary" asChild>
            <Link href={`/${locale}`}>
              <ArrowLeft className="h-4 w-4" />
              Best Swim
            </Link>
          </Button>
          <div className="py-12">
            <div>
              <Badge>{challenge.level || labels.challenge}</Badge>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal sm:text-6xl">{challenge.title}</h1>
              {challenge.distance ? <p className="mt-4 text-2xl font-semibold text-swim-cyan">{challenge.distance}</p> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="section-shell grid gap-8 py-12">
        <ZoneLegend />
        {challenge.intro ? (
          <Card className="glass-panel">
            <CardHeader>
              <FileText className="mb-4 h-7 w-7 text-swim-cyan" />
              <CardTitle>{challenge.intro.title}</CardTitle>
              <CardDescription>{challenge.intro.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionDisclosure document={challenge.intro} watermark={watermark} defaultOpen coachCredit={false} />
            </CardContent>
          </Card>
        ) : null}

        {challenge.sessions.length ? (
          <section className="rounded-lg border border-white/10 bg-swim-ink/[0.52] p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <Waves className="h-6 w-6 text-swim-cyan" />
              <div>
                <h2 className="text-2xl font-semibold">{labels.sessions}</h2>
                <p className="text-sm text-swim-steel">{challenge.sessions.length} {labels.collapsibleSessions}</p>
              </div>
            </div>
            <div className="grid gap-4">
              {challenge.sessions.map((document, index) => (
                <SessionDisclosure
                  key={document.id}
                  document={document}
                  watermark={watermark}
                  locale={locale}
                  lockedVariant={getLockedVariantForPosition(index + 1, accessLimit, lockedVariant)}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
