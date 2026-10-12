// Rutina de validación de colores de zona en las sesiones de entrenamiento.
// Uso:  node scripts/validate-sessions.mjs        (reporte, no bloquea)
//       node scripts/validate-sessions.mjs --strict (sale con error si hay términos ambiguos)
// Fuente del mapeo: src/content/zones.json  ·  Contenido: src/content/imported-content.json
// Ejecuta esto ANTES de subir o actualizar sesiones para mantener la consistencia de colores.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeContent } from "./lib/normalize-content.mjs";

const zones = JSON.parse(readFileSync(fileURLToPath(new URL("../src/content/zones.json", import.meta.url)), "utf8"));
const content = JSON.parse(readFileSync(fileURLToPath(new URL("../src/content/imported-content.json", import.meta.url)), "utf8"));
const strict = process.argv.includes("--strict");

function collectText(node, out) {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) collectText(item, out);
    return;
  }
  if (typeof node === "object") {
    if (typeof node.text === "string") out.push(node.text);
    for (const key of Object.keys(node)) {
      if (key !== "text") collectText(node[key], out);
    }
  }
}

function stripAccents(value) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const parts = [];
collectText(content, parts);
const corpus = parts.join("\n");
const strippedCorpus = stripAccents(corpus);

console.log("=== Validación de colores de zonas en sesiones ===\n");

let mappedTotal = 0;
console.log("Códigos de zona (se colorean automáticamente):");
for (const [code, color] of Object.entries(zones.codeColors)) {
  const n = (corpus.match(new RegExp(`\\b${escapeRe(code)}\\b`, "gi")) || []).length;
  mappedTotal += n;
  console.log(`  ${code.padEnd(8)} ${color}  →  ${n} apariciones`);
}

console.log("\nFrases anaeróbicas (se colorean automáticamente):");
for (const { phrase, color } of zones.phraseColors) {
  const n = (strippedCorpus.match(new RegExp(escapeRe(stripAccents(phrase)), "g")) || []).length;
  mappedTotal += n;
  console.log(`  ${phrase.padEnd(22)} ${color}  →  ${n} apariciones`);
}

console.log("\nTérminos AMBIGUOS (revisar / renombrar antes de publicar):");
let ambiguousTotal = 0;
for (const rule of zones.ambiguous) {
  const matches = corpus.match(new RegExp(rule.pattern, "gi")) || [];
  ambiguousTotal += matches.length;
  console.log(`  [${rule.id}] ${matches.length} casos — ${rule.note}`);
}

// Lo que la normalización cambiaría es contenido que la web mostraría mal: cabeceras con una
// caja vacía al lado, códigos de zona sin color, tonos fuera de paleta, cabeceras de fase en
// distinto estilo según la sesión. Ver scripts/lib/normalize-content.mjs.
const { stats } = normalizeContent(content);
const pending = Object.values(stats).reduce((a, n) => a + n, 0);
console.log("\nNormalización (cabeceras, códigos partidos, tonos de zona):");
console.log(`  cabeceras en tabla: ${stats.headerTables} · códigos partidos: ${stats.healedRuns} · tonos fuera de paleta: ${stats.recoloredRuns} · cabeceras de fase sin caja: ${stats.phaseHeadings} · frases en caja: ${stats.demotedSentences}`);
if (pending) console.log("  → ejecuta `npm run content:normalize` antes de publicar.");

console.log(`\nResumen: ${mappedTotal} términos con color · ${ambiguousTotal} ambiguos a revisar · ${pending} pendientes de normalizar.`);

if (strict && (ambiguousTotal > 0 || pending > 0)) {
  if (ambiguousTotal > 0) console.error(`\n✗ --strict: ${ambiguousTotal} términos ambiguos. Renómbralos a frases exactas (ver docs/COLORES-ZONAS-ENTRENAMIENTO.md) antes de publicar.`);
  if (pending > 0) console.error(`\n✗ --strict: ${pending} cambios de normalización pendientes. Ejecuta \`npm run content:normalize\`.`);
  process.exit(1);
}

console.log("\n✓ Validación completada.");
