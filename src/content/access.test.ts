import { describe, expect, it } from "vitest";
import {
  getLockedContentVariant,
  openWaterSectionHref,
  sanitizeChallengeForLevel,
  sanitizeSectionForLevel
} from "./access";
import type { ContentBlock, ImportedChallenge, ImportedDocument, ImportedSection } from "./types";

function paragraph(text: string): ContentBlock {
  return { type: "paragraph", text, runs: [{ text }] };
}

function doc(id: string, bodyText: string): ImportedDocument {
  return {
    id,
    title: `Doc ${id}`,
    sourcePath: `src/${id}`,
    categoryPath: [],
    summary: `summary ${id}`,
    blocks: [paragraph(bodyText)]
  };
}

function blockTexts(blocks: ContentBlock[]): string[] {
  return blocks.map((block) => (block.type === "paragraph" ? block.text : block.rows.map((row) => row.map((cell) => cell.text).join(" ")).join(" ")));
}

function buildSection(href = "/natacion/entrenamiento"): ImportedSection {
  return {
    id: "sec",
    title: "Section",
    description: "desc",
    href,
    documents: [doc("top", "TOP-LEVEL-BODY")],
    groups: [
      {
        id: "g1",
        title: "Group 1",
        documents: [doc("d1", "BODY1"), doc("d2", "BODY2"), doc("d3", "BODY3"), doc("d4", "BODY4"), doc("d5", "BODY5")]
      }
    ]
  };
}

function openWaterDoc(): ImportedDocument {
  return {
    id: "ow",
    title: "Open water plan",
    sourcePath: "src/ow",
    categoryPath: [],
    summary: "ow",
    blocks: [
      paragraph("Intro del plan"),
      paragraph("SESION 1"),
      paragraph("BODY-S1"),
      paragraph("SESION 2"),
      paragraph("BODY-S2"),
      paragraph("SESION 3"),
      paragraph("BODY-S3"),
      paragraph("SESION 4"),
      paragraph("BODY-S4")
    ]
  };
}

describe("getLockedContentVariant", () => {
  it("returns null for premium and the level for non-premium", () => {
    expect(getLockedContentVariant("premium")).toBeNull();
    expect(getLockedContentVariant("free")).toBe("free");
    expect(getLockedContentVariant("public")).toBe("public");
  });
});

describe("sanitizeSectionForLevel (document-level gating)", () => {
  it("premium keeps all bodies and drops the unused top-level documents", () => {
    const result = sanitizeSectionForLevel(buildSection(), "premium");
    expect(result.documents).toEqual([]);
    expect(result.groups[0].documents.every((document) => document.blocks.length === 1)).toBe(true);
  });

  it("public (limit 3) strips bodies beyond the first 3 documents", () => {
    const result = sanitizeSectionForLevel(buildSection(), "public");
    const docs = result.groups[0].documents;
    expect(docs[0].blocks).toHaveLength(1);
    expect(docs[2].blocks).toHaveLength(1);
    expect(docs[3].blocks).toHaveLength(0);
    expect(docs[4].blocks).toHaveLength(0);
    // Locked bodies must NOT be serialized.
    expect(JSON.stringify(result)).not.toContain("BODY4");
    expect(JSON.stringify(result)).toContain("BODY3");
  });

  it("free (limit 10) keeps all 5 documents", () => {
    const result = sanitizeSectionForLevel(buildSection(), "free");
    expect(result.groups[0].documents.every((document) => document.blocks.length === 1)).toBe(true);
  });
});

describe("sanitizeSectionForLevel (open-water session-level gating)", () => {
  it("public (limit 3) keeps the first 3 session bodies and every heading, but drops the 4th body", () => {
    const section: ImportedSection = {
      id: "ow",
      title: "OW",
      description: "d",
      href: openWaterSectionHref,
      documents: [],
      groups: [{ id: "g", title: "G", documents: [openWaterDoc()] }]
    };

    const result = sanitizeSectionForLevel(section, "public");
    const texts = blockTexts(result.groups[0].documents[0].blocks);

    expect(texts).toContain("Intro del plan");
    expect(texts).toContain("BODY-S1");
    expect(texts).toContain("BODY-S3");
    expect(texts).toContain("SESION 4"); // heading kept so the client still shows a locked card
    expect(texts).not.toContain("BODY-S4"); // locked body never serialized
  });
});

describe("sanitizeChallengeForLevel", () => {
  function buildChallenge(): ImportedChallenge {
    return {
      id: "c",
      title: "Challenge",
      href: "/reto-7km",
      intro: doc("intro", "INTRO-BODY"),
      sessions: [doc("s1", "CB1"), doc("s2", "CB2"), doc("s3", "CB3"), doc("s4", "CB4")]
    };
  }

  it("public (limit 3) gates sessions beyond 3 and keeps the intro", () => {
    const result = sanitizeChallengeForLevel(buildChallenge(), "public");
    expect(result.intro?.blocks).toHaveLength(1);
    expect(result.sessions[2].blocks).toHaveLength(1);
    expect(result.sessions[3].blocks).toHaveLength(0);
    expect(JSON.stringify(result)).not.toContain("CB4");
  });

  it("premium keeps every session body", () => {
    const result = sanitizeChallengeForLevel(buildChallenge(), "premium");
    expect(result.sessions.every((session) => session.blocks.length === 1)).toBe(true);
  });
});
