import { describe, expect, it } from "vitest";
import { canonicalizeZoneColors, healZoneTokens, isHeaderTable, isPhaseHeading, normalizeBlocks, normalizeContent } from "./normalize-content.mjs";

const cell = (text, extra = {}) => ({ text, runs: [{ text }], ...extra });
const texts = (runs) => runs.map((r) => r.text);

describe("healZoneTokens", () => {
  it("une un código partido en dos runs (AE + L)", () => {
    const runs = [{ text: " (" }, { text: "AE", bold: true }, { text: "L) 60%" }];
    expect(texts(healZoneTokens(runs))).toEqual([" (", "AEL", ") 60%"]);
    expect(healZoneTokens(runs)[1].bold).toBe(true);
  });

  it("une un código partido en tres runs (V + O + 2max)", () => {
    const runs = [{ text: "(ZONA 3 V" }, { text: "O" }, { text: "2max)" }];
    expect(texts(healZoneTokens(runs))).toEqual(["(ZONA 3 VO2max", ")"]);
  });

  it("une SESIONES AE + M del título", () => {
    expect(texts(healZoneTokens([{ text: "SESIONES AE" }, { text: "M", bold: true }]))).toEqual(["SESIONES AEM"]);
  });

  it("no toca runs sin códigos partidos y devuelve el mismo array", () => {
    const runs = [{ text: "4x100 " }, { text: "AEL", bold: true }, { text: " descanso 20''" }];
    expect(healZoneTokens(runs)).toBe(runs);
  });

  it("no pierde ni duplica texto", () => {
    const runs = [{ text: "a AE" }, { text: "I/P" }, { text: "AE b" }];
    const out = healZoneTokens(runs);
    expect(out.map((r) => r.text).join("")).toBe("a AEI/PAE b");
  });
});

describe("canonicalizeZoneColors", () => {
  it("lleva los tonos de zona del Word al color oficial de su zona", () => {
    const runs = [
      { text: "(AEL)", color: "#00B0F0" },
      { text: "AEM", color: "#00b050" },
      { text: "AEI/PAE", color: "#FFC000" },
      { text: "AEI", color: "#E97132" }
    ];
    expect(canonicalizeZoneColors(runs).map((r) => r.color)).toEqual(["#0070C0", "#92D050", "#F79646", "#F79646"]);
  });

  it("no toca colores oficiales ni colores que no son de zona", () => {
    const runs = [{ text: "AEL", color: "#0070C0" }, { text: "¡¡Ojo!!", color: "#EE0000" }, { text: "normal" }];
    expect(canonicalizeZoneColors(runs)).toBe(runs);
  });
});

describe("isHeaderTable", () => {
  it("detecta la cabecera de 2 celdas con la segunda vacía", () => {
    expect(isHeaderTable({ type: "table", rows: [[cell("TÉCNICA: 300m"), cell("")]] })).toBe(true);
  });

  it("detecta la cabecera de 1 celda", () => {
    expect(isHeaderTable({ type: "table", rows: [[cell("WARM UP: 600m")]] })).toBe(true);
  });

  it("respeta las plantillas de varias filas con celdas vacías (test de cadencia)", () => {
    const rows = ["52", "54", "56"].map((v) => [cell(v), cell(""), cell(""), cell(""), cell("")]);
    expect(isHeaderTable({ type: "table", rows })).toBe(false);
  });

  it("respeta las tablas de datos de una fila con dos celdas llenas", () => {
    expect(isHeaderTable({ type: "table", rows: [[cell("Tarea"), cell("Ejercicios")]] })).toBe(false);
  });
});

describe("normalizeBlocks", () => {
  it("convierte la cabecera en tabla en un subheading con solo el texto", () => {
    const out = normalizeBlocks([{ type: "table", rows: [[cell("MAIN SET: 400m AEI"), cell("")]] }]);
    expect(out).toEqual([{ type: "paragraph", text: "MAIN SET: 400m AEI", runs: [{ text: "MAIN SET: 400m AEI" }], variant: "subheading" }]);
  });

  it("descarta una tabla de una fila totalmente vacía", () => {
    expect(normalizeBlocks([{ type: "table", rows: [[cell(""), cell(" ")]] }])).toEqual([]);
  });
});

describe("cabeceras de fase", () => {
  const para = (text, variant) => ({ type: "paragraph", text, runs: [{ text }], ...(variant ? { variant } : {}) });

  it("reconoce las cabeceras reales de los Word", () => {
    for (const t of ["MAIN SET: 2.800 m", "COOL DOWN: 200m", "WARM UP", "Pre set: 300m", "Pre - set: 200m", "TÉCNICA: 300m", "COOL DOWN (PIES)"]) {
      expect(isPhaseHeading(t), t).toBe(true);
    }
  });

  it("no confunde frases que empiezan por la palabra de fase, ni los drills", () => {
    for (const t of ["Calentamiento basado en ajuste de la respiración", "Técnica correcta y buen patrón de respiración", "Calentamiento gomas.", "Drill: técnica focalizando en la respiración"]) {
      expect(isPhaseHeading(t), t).toBe(false);
    }
  });

  it("pone en caja la cabecera suelta y saca de la caja la frase", () => {
    const out = normalizeBlocks([para("MAIN SET: 2.800 m"), para("Calentamiento basado en posición", "subheading"), para("400m crol suave")]);
    expect(out.map((b) => b.variant)).toEqual(["subheading", "body", undefined]);
  });

  it("unifica también las fases maquetadas como título grande (heading)", () => {
    expect(normalizeBlocks([para("COOL DOWN:", "heading")])[0].variant).toBe("subheading");
    expect(normalizeBlocks([para("Objetivos de la temporada", "heading")])[0].variant).toBe("heading");
  });

  it("no toca títulos ni notas", () => {
    const out = normalizeBlocks([para("WARM UP: 400m", "title"), para("COOL DOWN: recuerda soltar", "note")]);
    expect(out.map((b) => b.variant)).toEqual(["title", "note"]);
  });
});

describe("normalizeContent", () => {
  it("recorre bloques anidados a cualquier profundidad y es idempotente", () => {
    const tree = {
      challenges: [{ sessions: [{ blocks: [{ type: "table", rows: [[cell("COOL DOWN: 200m"), cell("")]] }] }] }],
      natacionSections: [{ groups: [{ documents: [{ blocks: [{ type: "paragraph", text: "(AEL)", runs: [{ text: "(AE" }, { text: "L)" }] }] }] }] }]
    };
    const first = normalizeContent(tree);
    expect(first.stats).toEqual({ headerTables: 1, healedRuns: 1, recoloredRuns: 0, phaseHeadings: 0, demotedSentences: 0 });
    expect(first.tree.challenges[0].sessions[0].blocks[0].variant).toBe("subheading");

    const second = normalizeContent(first.tree);
    expect(second.stats).toEqual({ headerTables: 0, healedRuns: 0, recoloredRuns: 0, phaseHeadings: 0, demotedSentences: 0 });
    expect(second.tree).toEqual(first.tree);
  });
});
