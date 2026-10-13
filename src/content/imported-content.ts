import rawContent from "./imported-content.json";
import enDictionary from "./i18n/en.json";
import ptDictionary from "./i18n/pt.json";
import { translatePlain, translateRuns, type ContentDictionary } from "./content-i18n.mjs";
import type { ContentBlock, ImportedChallenge, ImportedDocument, ImportedSection, RichRun } from "./types";
import type { Locale } from "@/i18n/config";

type ImportedContent = {
  natacionSections: ImportedSection[];
  challenges: ImportedChallenge[];
  extraChallengeDocuments: ImportedDocument[];
  watermark: string;
};

export const importedContent = rawContent as ImportedContent;
export const natacionSections = importedContent.natacionSections;
export const importedChallenges = importedContent.challenges;
export const extraChallengeDocuments = importedContent.extraChallengeDocuments;

// Los desafíos por nivel viven todos en `challenges`; ya no hay páginas extra sueltas.
export const extraChallengePages: ImportedChallenge[] = [];
export const watermarkSrc = "/import-assets/watermark/Logov1-transparent.png";

const hrefAliases: Record<string, string> = {
  "/natacion/aguas-abiertas-triatlon": "/natacion/aguas-abiertas-y-triatlon"
};

// Traducción del contenido por diccionario: src/content/i18n/{en,pt}.json, generados y
// validados con scripts/i18n-extract.mjs + scripts/i18n-merge.mjs (ver content-i18n.mjs).
// Conserva negritas y colores de cada párrafo, y escribe las cifras a la manera del idioma.
// Un texto sin traducción se queda en español: mejor el original que una mezcla a medias.
const dictionaries: Partial<Record<Locale, ContentDictionary>> = {
  en: enDictionary as ContentDictionary,
  pt: ptDictionary as ContentDictionary
};

function translateText(text: string, locale: Locale) {
  const dictionary = dictionaries[locale];
  if (!dictionary || !text) {
    return text;
  }

  return translatePlain(text, dictionary, locale) ?? text;
}

function translateRichText<T extends { text: string; runs: RichRun[] }>(item: T, locale: Locale): T {
  const dictionary = dictionaries[locale];
  const runs = dictionary ? translateRuns(item.runs.length ? item.runs : [{ text: item.text }], dictionary, locale) : null;

  return runs ? { ...item, text: runs.map((run) => run.text).join(""), runs } : item;
}

function localizeDocument(document: ImportedDocument, locale: Locale): ImportedDocument {
  if (locale === "es") {
    return document;
  }

  return {
    ...document,
    title: translateText(document.title, locale),
    summary: translateText(document.summary, locale),
    total: document.total ? translateText(document.total, locale) : document.total,
    categoryPath: document.categoryPath.map((part) => translateText(part, locale)),
    blocks: document.blocks.map((block) =>
      block.type === "table"
        ? { ...block, rows: block.rows.map((row) => row.map((cell) => translateRichText(cell, locale))) }
        : translateRichText(block, locale)
    )
  };
}

function localizeSection(section: ImportedSection, locale: Locale): ImportedSection {
  if (locale === "es") {
    return section;
  }

  return {
    ...section,
    title: translateText(section.title, locale),
    description:
      locale === "pt"
        ? "Sessões e recursos importados dos documentos de treino."
        : "Sessions and resources imported from the training documents.",
    documents: section.documents.map((document) => localizeDocument(document, locale)),
    groups: section.groups.map((group) => ({
      ...group,
      title: translateText(group.title, locale),
      documents: group.documents.map((document) => localizeDocument(document, locale))
    }))
  };
}

function localizeChallenge(challenge: ImportedChallenge, locale: Locale): ImportedChallenge {
  if (locale === "es") {
    return challenge;
  }

  return {
    ...challenge,
    title: translateText(challenge.title, locale),
    level: challenge.level ? translateText(challenge.level, locale) : challenge.level,
    intro: challenge.intro ? localizeDocument(challenge.intro, locale) : challenge.intro,
    sessions: challenge.sessions.map((document) => localizeDocument(document, locale))
  };
}

function normalizeImportedText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isImportedSessionHeading(block: ContentBlock): block is Extract<ContentBlock, { type: "paragraph" }> {
  return block.type === "paragraph" && /^sesion\s+\d+/.test(normalizeImportedText(block.text));
}

function summarizeImportedBlocks(blocks: ContentBlock[]) {
  const paragraph = blocks.find((block) => block.type === "paragraph" && block.text.trim());
  const text = paragraph?.type === "paragraph" ? paragraph.text.trim() : "";
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function splitImportedDocumentSessions(document: ImportedDocument) {
  const sessions: ImportedDocument[] = [];
  let currentTitle = "";
  let currentBlocks: ContentBlock[] = [];

  function pushCurrentSession() {
    if (!currentTitle) {
      return;
    }

    const totalBlock = currentBlocks.find(
      (block) => block.type === "paragraph" && normalizeImportedText(block.text).startsWith("volumen total")
    );

    sessions.push({
      ...document,
      id: `${document.id}-portal-session-${sessions.length + 1}`,
      title: currentTitle,
      summary: summarizeImportedBlocks(currentBlocks),
      total: totalBlock?.type === "paragraph" ? totalBlock.text : document.total,
      blocks: currentBlocks
    });
  }

  document.blocks.forEach((block) => {
    if (isImportedSessionHeading(block)) {
      pushCurrentSession();
      currentTitle = block.text.trim();
      currentBlocks = [];
      return;
    }

    if (currentTitle) {
      currentBlocks.push(block);
    }
  });

  pushCurrentSession();

  return sessions;
}

/** Href canonico si `href` es un alias antiguo; undefined si ya es el bueno. */
export function getAliasTarget(href: string) {
  return hrefAliases[href];
}

export function getNatacionSectionByHref(href: string, locale: Locale = "es") {
  const normalizedHref = hrefAliases[href] || href;
  const section = natacionSections.find((item) => item.href === normalizedHref);
  return section ? localizeSection(section, locale) : undefined;
}

export function getPortalTrainingDocumentBySourceKey(sourceKey: string | null | undefined, locale: Locale = "es") {
  const triathlonMatch = sourceKey?.match(/^preparacion-triatlon-olimpico.*session-(\d+)$/);

  if (triathlonMatch) {
    const section = natacionSections.find((item) => item.href === "/natacion/aguas-abiertas-y-triatlon");
    const document = section?.groups
      .find((group) => group.id === "preparacion-triatlon-olimpico")
      ?.documents[0];

    if (!document) {
      return undefined;
    }

    const session = splitImportedDocumentSessions(document)[Number(triathlonMatch[1]) - 1];
    if (!session) {
      return undefined;
    }

    // El resumen de estas sesiones se recorta del primer párrafo y no está en el
    // diccionario tal cual: se recorta otra vez, ya traducido.
    const localized = localizeDocument(session, locale);
    return { ...localized, summary: summarizeImportedBlocks(localized.blocks) };
  }

  // El source_key de la fila en Supabase es el id del documento importado.
  // Se resuelve por id en las secciones de Natación (Entrenamiento AEL/AEM, etc.)
  // y en los desafíos (intro + sesiones de cada reto).
  if (sourceKey) {
    const fromSections = natacionSections
      .flatMap((section) => [...section.documents, ...section.groups.flatMap((group) => group.documents)])
      .find((document) => document.id === sourceKey);

    if (fromSections) {
      return localizeDocument(fromSections, locale);
    }

    for (const challenge of importedChallenges) {
      if (challenge.intro?.id === sourceKey) {
        return localizeDocument(challenge.intro, locale);
      }

      const session = challenge.sessions.find((item) => item.id === sourceKey);
      if (session) {
        return localizeDocument(session, locale);
      }
    }
  }

  return undefined;
}

export function getChallengeByHref(href: string, locale: Locale = "es") {
  const challenge = [...importedChallenges, ...extraChallengePages].find((item) => item.href === href);
  return challenge ? localizeChallenge(challenge, locale) : undefined;
}
