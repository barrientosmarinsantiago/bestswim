// Normalización del contenido importado (src/content/imported-content.json).
//
// La aplican los dos importadores antes de escribir y `npm run content:normalize` sobre el
// JSON entero, así que todo el contenido pasa por aquí venga del parser que venga. Es
// idempotente: aplicarla dos veces no cambia nada.
//
// Corrige cuatro defectos que traen los .docx y que la web no puede arreglar sola:
//
// 1. CABECERAS EN TABLA. En Word las cabeceras de fase (WARM UP, TÉCNICA, MAIN SET…) son a
//    menudo una tabla de una fila. Algunas tienen una segunda celda vacía, y la web pintaba
//    esa celda como una caja vacía al lado del texto. Toda tabla de UNA fila con, como mucho,
//    una celda con texto pasa a ser una cabecera (párrafo `subheading`), el mismo bloque que
//    usan las sesiones de Entrenamiento: una sola caja con el texto, igual en toda la web.
//    Solo tablas de una fila: las de varias filas con celdas vacías son plantillas que el
//    nadador rellena (test de cadencia con Tempo Trainer) y se conservan tal cual.
//
// 2. CÓDIGOS DE ZONA PARTIDOS. Word corta el texto en "runs" según el formato, y a veces en
//    mitad de un código: "AE" + "L", "V" + "O" + "2max". La web colorea run a run, así que un
//    código partido salía sin color aunque en el Word estuviera coloreado. Se mueve el corte
//    al final del código para que quede entero en un solo run.
//
// 3. TONOS DE ZONA FUERA DE PALETA. Cada tanda de Word pintó las zonas con una variante
//    (AEL azul claro #00B0F0, AEI ámbar #FFC000…). Donde el contenido conserva el color del
//    Word, la web mostraba AEL en dos azules distintos según la página. Los tonos de
//    `colorAliases` (zones.json) pasan al color oficial de su zona.
//
// 4. CABECERAS DE FASE SUELTAS. Que una cabecera salga en caja dependía de cómo estuviera
//    maquetado cada Word: dentro de una tabla, sí; como párrafo suelto, no. En una misma
//    sesión WARM UP salía en caja y COOL DOWN como texto. Toda línea que sea cabecera de fase
//    pasa a `subheading`, y al revés: una frase que solo EMPIEZA por la palabra de fase
//    ("Calentamiento basado en…") deja de serlo.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const zones = JSON.parse(readFileSync(fileURLToPath(new URL("../../src/content/zones.json", import.meta.url)), "utf8"));

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Mismo patrón que src/content/zones.ts (zoneTokenPattern): lo que aquí se mantiene entero
// es exactamente lo que la web sabe colorear.
function accentInsensitive(value) {
  return escapeRe(value)
    .replace(/[aá]/gi, "[aá]")
    .replace(/[eé]/gi, "[eé]")
    .replace(/[ií]/gi, "[ií]")
    .replace(/[oó]/gi, "[oó]")
    .replace(/[uú]/gi, "[uú]");
}

const zoneSource = `(${zones.phraseColors.map((p) => accentInsensitive(p.phrase)).join("|")}|${Object.keys(zones.codeColors).join("|")})`;

const isFilled = (cell) => Boolean(cell && (cell.text || "").trim());

// Palabras que abren una fase de la sesión. "Drill" no está: en los Word introduce la
// descripción de un ejercicio ("Drill: técnica focalizando…"), no una fase.
const PHASE_WORD = /^\s*(WARM[\s-]*UP|MAIN[\s-]*SET|COOL[\s-]*DOWN|PRE[\s-]*SET|CALENTAMIENTO|PARTE\s+PRINCIPAL|SERIE\s+PRINCIPAL|VUELTA\s+A\s+LA\s+CALMA|ENFRIAMIENTO|T[ÉE]CNICA)\b/i;
// Es cabecera si tras la palabra viene ":", "(", un guion, una cifra o nada: "MAIN SET: 2.800 m",
// "COOL DOWN", "Pre set 300m". "Calentamiento basado en…" es una frase.
const PHASE_HEADING = new RegExp(`${PHASE_WORD.source}\\s*([:(\\-–]|\\d|$)`, "i");

const normalizeSpaces = (text) => (text || "").replace(/\s+/g, " ").trim();

export function isPhaseHeading(text) {
  return PHASE_HEADING.test(normalizeSpaces(text));
}

/** Variante que corresponde a un párrafo según sea o no cabecera de fase. */
function phaseVariant(block) {
  const text = normalizeSpaces(block.text);
  const variant = block.variant ?? "body";
  // `heading` también: el grupo heredado de sesiones por zonas maquetaba las fases como título
  // grande sin caja, un tercer aspecto para el mismo elemento.
  if ((variant === "body" || variant === "heading") && PHASE_HEADING.test(text)) return "subheading";
  if (variant === "subheading" && PHASE_WORD.test(text) && !PHASE_HEADING.test(text)) return "body";
  return block.variant;
}

/** Reparte el texto de los runs para que ningún código de zona quede partido entre dos. */
export function healZoneTokens(runs) {
  if (!Array.isArray(runs) || runs.length < 2) return runs;

  const full = runs.map((r) => r.text || "").join("");
  // Límites entre runs: boundaries[k] es donde empieza el run k.
  const boundaries = [];
  let offset = 0;
  for (const r of runs) {
    boundaries.push(offset);
    offset += (r.text || "").length;
  }

  let changed = false;
  for (const match of full.matchAll(new RegExp(zoneSource, "gi"))) {
    const start = match.index;
    const end = start + match[0].length;
    for (let k = 1; k < boundaries.length; k++) {
      if (boundaries[k] > start && boundaries[k] < end) {
        boundaries[k] = end;
        changed = true;
      }
    }
  }
  if (!changed) return runs;

  // Un límite movido puede adelantar al siguiente: se mantienen crecientes.
  for (let k = 1; k < boundaries.length; k++) boundaries[k] = Math.max(boundaries[k], boundaries[k - 1]);

  const out = [];
  for (let k = 0; k < runs.length; k++) {
    const text = full.slice(boundaries[k], k + 1 < boundaries.length ? boundaries[k + 1] : full.length);
    if (text) out.push({ ...runs[k], text });
  }
  return out;
}

/** Tabla de una fila con como mucho una celda con texto: es una cabecera, no una tabla. */
export function isHeaderTable(block) {
  return block?.type === "table" && block.rows.length === 1 && block.rows[0].filter(isFilled).length <= 1;
}

const colorAliases = Object.fromEntries(Object.entries(zones.colorAliases || {}).map(([from, to]) => [from.toUpperCase(), to]));

/** Lleva a la paleta oficial los tonos de zona que trae el Word. Mismo array si no hay cambios. */
export function canonicalizeZoneColors(runs) {
  if (!Array.isArray(runs)) return runs;
  let changed = false;
  const out = runs.map((run) => {
    const canonical = run.color && colorAliases[run.color.toUpperCase()];
    if (!canonical) return run;
    changed = true;
    return { ...run, color: canonical };
  });
  return changed ? out : runs;
}

const emptyStats = () => ({ headerTables: 0, healedRuns: 0, recoloredRuns: 0, phaseHeadings: 0, demotedSentences: 0 });

export function normalizeBlocks(blocks, stats = emptyStats()) {
  const heal = (runs) => {
    const healed = healZoneTokens(runs);
    if (healed !== runs) stats.healedRuns++;
    const recolored = canonicalizeZoneColors(healed);
    if (recolored !== healed) stats.recoloredRuns++;
    return recolored;
  };

  const out = [];
  for (const block of blocks) {
    if (isHeaderTable(block)) {
      stats.headerTables++;
      const cell = block.rows[0].find(isFilled);
      if (cell) {
        const runs = cell.runs && cell.runs.length ? cell.runs : [{ text: cell.text }];
        const header = { type: "paragraph", text: cell.text.trim(), runs: heal(runs), variant: "subheading" };
        // Misma regla que los párrafos sueltos, en esta misma pasada: si no, una segunda
        // ejecución podría reclasificarla y la normalización dejaría de ser idempotente.
        header.variant = phaseVariant(header);
        out.push(header);
      }
      continue;
    }
    if (block.type === "table") {
      out.push({ ...block, rows: block.rows.map((row) => row.map((cell) => (cell.runs ? { ...cell, runs: heal(cell.runs) } : cell))) });
      continue;
    }
    const next = block.runs ? { ...block, runs: heal(block.runs) } : { ...block };
    if (block.type === "paragraph") {
      const variant = phaseVariant(block);
      if (variant !== block.variant) {
        if (variant === "subheading") stats.phaseHeadings++;
        else stats.demotedSentences++;
        next.variant = variant;
      }
    }
    out.push(next);
  }
  return out;
}

/**
 * Normaliza todo lo que tenga `blocks` en cualquier punto del árbol (secciones, retos,
 * planes de preparación anidados…). Devuelve el árbol nuevo y un recuento de cambios.
 */
export function normalizeContent(tree) {
  const stats = emptyStats();

  function visit(node) {
    if (Array.isArray(node)) return node.map(visit);
    if (!node || typeof node !== "object") return node;

    const next = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "blocks" && Array.isArray(value)) {
        next.blocks = normalizeBlocks(value, stats).map(visit);
      } else {
        next[key] = visit(value);
      }
    }
    return next;
  }

  return { tree: visit(tree), stats };
}
