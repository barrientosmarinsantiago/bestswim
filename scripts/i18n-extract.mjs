// Lista los textos del contenido de sesiones que aún no tienen traducción.
//
// Uso:  node scripts/i18n-extract.mjs              (resumen por idioma)
//       node scripts/i18n-extract.mjs --chunks 120 (escribe .dev-logs/i18n/pending-NNN.json)
//
// Recorre lo mismo que traduce la web (src/content/imported-content.ts): títulos, resúmenes,
// totales, rutas de categoría, títulos de grupo y sección, y los bloques de cada documento,
// sesión de reto e introducción. Las claves son las plantillas de content-i18n.mjs, así que
// "COOL DOWN: 200m" y "COOL DOWN: 500m" cuentan una sola vez.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { encodeRuns, toTemplate } from "../src/content/content-i18n.mjs";

const ROOT = process.cwd();
const content = JSON.parse(readFileSync(join(ROOT, "src/content/imported-content.json"), "utf8"));
const LOCALES = ["en", "pt"];
const dictionaries = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(join(ROOT, `src/content/i18n/${l}.json`), "utf8"))])
);

const keys = new Map(); // plantilla -> nº de apariciones

function addRuns(runs) {
  const { markup } = encodeRuns(runs);
  const normalized = markup.replace(/\s+/g, " ").trim();
  if (!normalized || !/\p{L}/u.test(normalized)) return;
  const { template } = toTemplate(normalized);
  keys.set(template, (keys.get(template) || 0) + 1);
}
const addText = (text) => text && addRuns([{ text }]);

function addDocument(doc) {
  if (!doc) return;
  addText(doc.title);
  addText(doc.summary);
  addText(doc.total);
  (doc.categoryPath || []).forEach(addText);
  for (const block of doc.blocks || []) {
    if (block.type === "table") block.rows.flat().forEach((cell) => addRuns(cell.runs?.length ? cell.runs : [{ text: cell.text }]));
    else addRuns(block.runs?.length ? block.runs : [{ text: block.text }]);
  }
}

for (const section of content.natacionSections || []) {
  addText(section.title);
  (section.documents || []).forEach(addDocument);
  for (const group of section.groups || []) {
    addText(group.title);
    group.documents.forEach(addDocument);
  }
}
for (const challenge of content.challenges || []) {
  addText(challenge.title);
  addText(challenge.level);
  addDocument(challenge.intro);
  (challenge.sessions || []).forEach(addDocument);
}

const all = [...keys.keys()];
const chars = all.reduce((n, k) => n + k.length, 0);
console.log(`Textos únicos (plantillas): ${all.length} · ${chars} caracteres`);

const pendingAll = new Set();
for (const locale of LOCALES) {
  const missing = all.filter((k) => typeof dictionaries[locale][k] !== "string");
  missing.forEach((k) => pendingAll.add(k));
  const unused = Object.keys(dictionaries[locale]).filter((k) => !keys.has(k)).length;
  console.log(`  ${locale}: ${all.length - missing.length} traducidos · ${missing.length} pendientes · ${unused} entradas que ya no se usan`);
}

const chunkArg = process.argv.indexOf("--chunks");
if (chunkArg > -1) {
  const size = Number(process.argv[chunkArg + 1]) || 120;
  const dir = join(ROOT, ".dev-logs", "i18n");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  // Orden estable y agrupado: textos parecidos juntos traducen más coherente.
  const pending = [...pendingAll].sort((a, b) => a.localeCompare(b, "es"));
  let n = 0;
  for (let i = 0; i < pending.length; i += size) {
    const file = join(dir, `pending-${String(++n).padStart(3, "0")}.json`);
    writeFileSync(file, JSON.stringify(pending.slice(i, i + size), null, 1) + "\n");
  }
  console.log(`\n${pending.length} pendientes en ${n} ficheros de ${size} en ${dir}`);
}
