// Aplica scripts/lib/normalize-content.mjs a todo src/content/imported-content.json.
//
// Uso:  node scripts/normalize-content.mjs            (aplica)
//       node scripts/normalize-content.mjs --dry-run  (solo informa)
//
// Los importadores ya lo hacen al escribir; esto cubre el contenido que no se reimporta
// (aguas abiertas, oposiciones, bases) y sirve para comprobar que todo está normalizado.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeContent } from "./lib/normalize-content.mjs";

const JSON_PATH = fileURLToPath(new URL("../src/content/imported-content.json", import.meta.url));
const DRY = process.argv.includes("--dry-run");

const before = readFileSync(JSON_PATH, "utf8");
const { tree, stats } = normalizeContent(JSON.parse(before));
const after = JSON.stringify(tree, null, 2) + "\n";

console.log(`Cabeceras en tabla convertidas: ${stats.headerTables}`);
console.log(`Párrafos/celdas con códigos de zona reunidos: ${stats.healedRuns}`);
console.log(`Párrafos/celdas con tonos de zona llevados a la paleta oficial: ${stats.recoloredRuns}`);
console.log(`Cabeceras de fase que salían como texto: ${stats.phaseHeadings}`);
console.log(`Frases que salían como cabecera: ${stats.demotedSentences}`);

if (after === before) {
  console.log("Sin cambios: el contenido ya estaba normalizado.");
} else if (DRY) {
  console.log("--dry-run: no se escribe nada.");
} else {
  writeFileSync(JSON_PATH, after);
  console.log(`Escrito ${JSON_PATH}`);
}
