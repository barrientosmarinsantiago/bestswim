import type { ContentBlock, ImportedChallenge, ImportedDocument, ImportedSection } from "@/content/types";

// Server-side content gating. These limits and the split/position helpers below MUST stay
// in sync with the client rendering in `src/components/content/rich-content.tsx` and
// `src/components/content/content-access.tsx`: the server strips the body blocks of exactly
// the same positions that the client marks as locked, so a non-entitled visitor never
// receives premium content (it is no longer serialized to the browser).

export type ContentAccessLevel = "public" | "free" | "premium";
export type LockedContentVariant = Exclude<ContentAccessLevel, "premium">;

export const ACCESS_LIMITS: Record<ContentAccessLevel, number> = {
  public: 3,
  free: 10,
  premium: Number.POSITIVE_INFINITY
};

export const openWaterSectionHref = "/natacion/aguas-abiertas-y-triatlon";

export function getLockedContentVariant(level: ContentAccessLevel): LockedContentVariant | null {
  return level === "premium" ? null : level;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function isSessionHeading(block: ContentBlock): block is Extract<ContentBlock, { type: "paragraph" }> {
  return block.type === "paragraph" && /^sesion\s+\d+/.test(normalizeSearch(block.text));
}

type SplitPreparationPlan = {
  introBlocks: ContentBlock[];
  sessions: ImportedDocument[];
};

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
      summary: "",
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

function stripDocumentBody(document: ImportedDocument): ImportedDocument {
  return { ...document, blocks: [] };
}

function sessionHeadingBlock(title: string): ContentBlock {
  return { type: "paragraph", text: title, runs: [{ text: title }] };
}

// Keep every session heading (so the client's split detects the same sessions at the same
// positions) but drop the body blocks of locked sessions before they reach the browser.
function rebuildOpenWaterDocument(
  document: ImportedDocument,
  split: SplitPreparationPlan,
  startPosition: number,
  accessLimit: number
): ImportedDocument {
  const blocks: ContentBlock[] = [...split.introBlocks];

  split.sessions.forEach((session, index) => {
    blocks.push(sessionHeadingBlock(session.title));

    if (startPosition + index <= accessLimit) {
      blocks.push(...session.blocks);
    }
  });

  return { ...document, blocks };
}

export function sanitizeSectionForLevel(section: ImportedSection, level: ContentAccessLevel): ImportedSection {
  const accessLimit = ACCESS_LIMITS[level];
  const lockedVariant = getLockedContentVariant(level);

  // Premium sees everything. Drop the unused top-level `documents` array to trim the payload.
  if (!lockedVariant) {
    return { ...section, documents: [] };
  }

  const isOpenWater = section.href === openWaterSectionHref;
  let groupOffset = 0;

  const groups = section.groups.map((group) => {
    if (isOpenWater) {
      let docOffset = 0;

      const documents = group.documents.map((document) => {
        const startPosition = groupOffset + docOffset + 1;
        const split = splitPreparationPlan(document);
        const sanitized = split.sessions.length
          ? rebuildOpenWaterDocument(document, split, startPosition, accessLimit)
          : startPosition > accessLimit
            ? stripDocumentBody(document)
            : document;

        docOffset += Math.max(1, split.sessions.length);
        return sanitized;
      });

      groupOffset += group.documents.reduce((count, document) => count + countPreparationItems(document), 0);
      return { ...group, documents };
    }

    const documents = group.documents.map((document, index) => {
      const position = groupOffset + index + 1;
      return position > accessLimit ? stripDocumentBody(document) : document;
    });

    groupOffset += group.documents.length;
    return { ...group, documents };
  });

  // The top-level `documents` array is never rendered by the section page; empty it so it
  // cannot leak premium bodies through the serialized props.
  return { ...section, documents: [], groups };
}

export function sanitizeChallengeForLevel(challenge: ImportedChallenge, level: ContentAccessLevel): ImportedChallenge {
  const accessLimit = ACCESS_LIMITS[level];
  const lockedVariant = getLockedContentVariant(level);

  if (!lockedVariant) {
    return challenge;
  }

  // The intro stays as a free teaser; sessions are gated by position like training sections.
  const sessions = challenge.sessions.map((session, index) =>
    index + 1 > accessLimit ? stripDocumentBody(session) : session
  );

  return { ...challenge, sessions };
}
