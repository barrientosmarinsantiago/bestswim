// Importa los desafíos nuevos (content-import/Desafios) al JSON estático.
// Dos formatos: carpeta multi-sesión (INTRODUCCIÓN + SESION N) y doc único con
// sesiones embebidas (cabeceras "SESIÓN N"). Reemplaza j.challenges por completo.
//
//   node scripts/import-challenges.mjs --dry-run   (plan)
//   node scripts/import-challenges.mjs             (aplica)

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseDocxFile, unwrapSingleColumnTables, cleanBlocks, deriveSummary, deriveTotal } from "./lib/docx.mjs";

const ROOT = process.cwd();
const JSON_PATH = join(ROOT, "src", "content", "imported-content.json");
const BASE = "content-import/Desafios";
const DRY = process.argv.includes("--dry-run");

// Catálogo: orden por nivel = orden del pipeline (pos 1 = por defecto).
const CATALOG = [
  // --- Principiante ---
  { slug: "reto-triple-corona-principiante-inicial", title: "Reto Triple Corona Extremadura — Principiante (inicial)", distance: "3×1,5 km", level: "Principiante", type: "single", path: "RETOS TRIPLE CORONA EXTREMADURA/NIVEL PRINCIPIANTE/RETO 2 TRIPLE CORONA EXTREMADURA PRINCIPIANTE - copia.docx" },
  { slug: "reto-alcatraz-7km-principiante", title: "Reto Alcatraz 7K — Principiante", distance: "7 km", level: "Principiante", type: "single", path: "RETOS ALCATRAZ/RETO ALCATRAZ NIVEL PRINCIPIANTE.docx" },
  { slug: "reto-triple-corona-principiante", title: "Reto Triple Corona Extremadura — Principiante", distance: "3×3 km", level: "Principiante", type: "single", path: "RETOS TRIPLE CORONA EXTREMADURA/NIVEL PRINCIPIANTE/RETO 1 TRIPLE CORONA EXTREMADURA PRINCIPIANTE.docx" },
  { slug: "reto-memorial-mike-12km-principiante", title: "Reto Memorial Mike 12K — Principiante", distance: "12 km", level: "Principiante", type: "folder", path: "RETOS MEMORIAL MIKE/RETO 12KM PRINCIPIANTE" },
  { slug: "reto-gibraltar-14km-principiante", title: "Reto Estrecho de Gibraltar 14K — Principiante", distance: "14 km", level: "Principiante", type: "folder", path: "RETO GIBRALTAR/14KM PRINCIPIANTE" },

  // --- Intermedio ---
  { slug: "reto-alcatraz-7km-intermedio", title: "Reto Alcatraz 7K — Intermedio", distance: "7 km", level: "Intermedio", type: "single", path: "RETOS ALCATRAZ/RETO ALCATRAZ NIVEL INTERMEDIO.docx" },
  { slug: "reto-triple-corona-intermedio", title: "Reto Triple Corona Extremadura — Intermedio", distance: "3 sesiones", level: "Intermedio", type: "single", path: "RETOS TRIPLE CORONA EXTREMADURA/RETO TRIPLE CORONA EXTREMADURA INTERMEDIO.docx" },
  { slug: "reto-memorial-mike-28km-intermedio", title: "Reto Memorial Mike 28K — Intermedio", distance: "28 km", level: "Intermedio", type: "folder", path: "RETOS MEMORIAL MIKE/RETO 28KM INTERMEDIO" },

  // --- Avanzado ---
  { slug: "reto-alcatraz-7km-avanzado", title: "Reto Alcatraz 7K — Avanzado", distance: "7 km", level: "Avanzado", type: "single", path: "RETOS ALCATRAZ/RETO ALCATRAZ NIVEL AVANZADO.docx" },
  { slug: "reto-triple-corona-avanzado", title: "Reto Triple Corona Extremadura — Avanzado", distance: "3 sesiones", level: "Avanzado", type: "single", path: "RETOS TRIPLE CORONA EXTREMADURA/RETO TRIPLE CORONA EXTREMADURA AVANZADO.docx" },
  { slug: "reto-memorial-mike-42km-avanzado", title: "Reto Memorial Mike 42K — Avanzado", distance: "42 km", level: "Avanzado", type: "folder", path: "RETOS MEMORIAL MIKE/RETO 42KM AVANZADO" }
];

const SESSION_HEADING = /^SESI[OÓ]N\s+\d+/i;

function buildBlocks(rawBlocks, { titleFirst = true } = {}) {
  let blocks = unwrapSingleColumnTables(rawBlocks);
  if (titleFirst) {
    let titled = false;
    blocks = blocks.map((b) => {
      if (!titled && b.type === "paragraph" && b.text.trim()) { titled = true; return { ...b, variant: "title" }; }
      return b;
    });
  }
  return cleanBlocks(blocks).map(({ _lines, ...b }) => b);
}

function sessionTitle(text) {
  const m = text.match(/SESI[OÓ]N\s+\d+/i);
  return m ? m[0].replace(/SESION/i, "Sesión").replace(/SESIÓN/i, "Sesión") : text.slice(0, 40);
}

function doc(id, title, sourcePath, categoryPath, blocks, total) {
  const out = { id, title, sourcePath: sourcePath.replace(/\\/g, "/"), categoryPath, blocks, summary: deriveSummary(blocks) };
  if (total) out.total = total;
  return out;
}

function importFolder(c) {
  const abs = join(ROOT, BASE.replace(/\//g, "\\"), c.path.replace(/\//g, "\\"));
  const files = readdirSync(abs).filter((f) => /\.docx$/i.test(f) && !f.startsWith("~$"));
  const introFile = files.find((f) => /introducci/i.test(f));
  const sessionFiles = files
    .filter((f) => /sesion|sesión/i.test(f))
    .sort((a, b) => (Number(a.match(/\d+/)?.[0] || 0)) - (Number(b.match(/\d+/)?.[0] || 0)));

  const intro = introFile
    ? doc(`${c.slug}-introduccion`, "Introducción", `${BASE}/${c.path}/${introFile}`, [c.title], buildBlocks(parseDocxFile(join(abs, introFile))))
    : null;

  const sessions = sessionFiles.map((f, idx) => {
    const blocks = buildBlocks(parseDocxFile(join(abs, f)));
    const num = f.match(/\d+/)?.[0] || String(idx + 1);
    const total = deriveTotal(blocks.map((b) => (b.type === "paragraph" ? b.text : "")).join(" "));
    return doc(`${c.slug}-sesion-${num}`, `Sesión ${num}`, `${BASE}/${c.path}/${f}`, [c.title], blocks, total);
  });

  return { intro, sessions };
}

const SET_RE = /^\s*\d+\s*x\s*\d/i; // "14x500m", "3x1.000m", etc.

function importSingle(c) {
  const abs = join(ROOT, BASE.replace(/\//g, "\\"), c.path.replace(/\//g, "\\"));
  const all = buildBlocks(parseDocxFile(abs));
  let introBlocks = [];
  let sessionGroups = [];
  let cur = null;
  for (const b of all) {
    if (b.type === "paragraph" && SESSION_HEADING.test(b.text.trim())) {
      cur = { heading: b.text.trim(), blocks: [{ ...b, variant: "title" }] };
      sessionGroups.push(cur);
    } else if (cur) {
      cur.blocks.push(b);
    } else {
      introBlocks.push(b);
    }
  }

  // Doc sin cabecera "SESIÓN N" (reto de una sola sesión): intro = descripción hasta
  // el primer set/tabla; sesión 1 = el bloque de entrenamiento (sets + tabla de zonas).
  if (sessionGroups.length === 0) {
    const wi = all.findIndex((b) => (b.type === "paragraph" && SET_RE.test(b.text.trim())) || b.type === "table");
    if (wi > 0) {
      introBlocks = all.slice(0, wi);
      sessionGroups = [{ heading: "Sesión 1", blocks: all.slice(wi), single: true }];
    } else {
      introBlocks = [];
      sessionGroups = [{ heading: "Sesión 1", blocks: all, single: true }];
    }
  }

  const intro = doc(`${c.slug}-introduccion`, "Introducción", `${BASE}/${c.path}`, [c.title], cleanBlocks(introBlocks).map(({ _lines, ...b }) => b));
  const sessions = sessionGroups.map((g, i) => {
    const num = g.heading.match(/\d+/)?.[0] || String(i + 1);
    const total = deriveTotal(g.heading) || (g.single ? c.distance : deriveTotal(g.blocks.map((b) => (b.type === "paragraph" ? b.text : "")).join(" ")));
    return doc(`${c.slug}-sesion-${num}`, sessionTitle(g.heading), `${BASE}/${c.path}`, [c.title], cleanBlocks(g.blocks).map(({ _lines, ...b }) => b), total);
  });
  return { intro, sessions };
}

function buildChallenges() {
  return CATALOG.map((c) => {
    const { intro, sessions } = c.type === "folder" ? importFolder(c) : importSingle(c);
    return { id: c.slug, title: c.title, href: `/${c.slug}`, distance: c.distance, level: c.level, image: null, intro, sessions };
  });
}

function main() {
  const challenges = buildChallenges();

  console.log("=== PLAN DE IMPORTACIÓN DE DESAFÍOS ===\n");
  for (const c of challenges) {
    console.log(`• ${c.title}  [${c.level}]  ${c.distance}`);
    console.log(`   slug=${c.id}  intro=${c.intro ? "sí" : "NO"}  sesiones=${c.sessions.length}  img=${c.image ?? "INSERTAR IMAGEN"}`);
  }
  console.log(`\nTOTAL: ${challenges.length} desafíos · ${challenges.reduce((n, c) => n + c.sessions.length, 0)} sesiones`);

  if (DRY) { console.log("\n[dry-run] No se ha escrito nada.\n"); return; }

  const j = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  j.challenges = challenges;
  j.extraChallengeDocuments = [];
  writeFileSync(JSON_PATH, JSON.stringify(j, null, 2) + "\n");
  console.log(`\n✓ Escrito ${JSON_PATH}\n`);
}

main();
