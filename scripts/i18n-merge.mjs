// Incorpora a src/content/i18n/{en,pt}.json las traducciones de .dev-logs/i18n.
//
// Cada pending-NNN.json (lista de plantillas en español, de i18n-extract.mjs) se empareja
// con en-NNN.json / pt-NNN.json: listas de traducciones en el MISMO orden. Antes de
// aceptar una entrada se comprueba que conserva las cifras (⟨n⟩), las marcas de formato
// (⟦n⟧…⟦/n⟧) y los códigos de zona del original. Un lote desalineado no pasa esa prueba:
// es justo el error que más daño haría (cada traducción en la sesión de al lado).
//
// Uso:  node scripts/i18n-merge.mjs            (valida e incorpora)
//       node scripts/i18n-merge.mjs --check    (solo valida)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIR = join(ROOT, ".dev-logs", "i18n");
const CHECK = process.argv.includes("--check");

const count = (text, re) => {
  const m = new Map();
  for (const x of text.matchAll(re)) m.set(x[0], (m.get(x[0]) || 0) + 1);
  return [...m.entries()].sort().map(([k, v]) => `${k}×${v}`).join(" ");
};
const PLACEHOLDERS = /⟨\d+⟩/g;
const TAGS = /⟦\/?\d+⟧/g;
const ZONES = /\b(AEL|AEM|AEI|PAE|CSS|VO2\s?max|Z[1-5])\b/gi;
const zones = (t) => count(t.replace(ZONES, (z) => z.toUpperCase().replace(/\s/g, "")), /\b(AEL|AEM|AEI|PAE|CSS|VO2MAX|Z[1-5])\b/g);

export function problemsOf(source, target) {
  const out = [];
  if (typeof target !== "string" || !target.trim()) return ["vacía"];
  if (count(source, PLACEHOLDERS) !== count(target, PLACEHOLDERS)) out.push(`cifras ${count(source, PLACEHOLDERS)} ≠ ${count(target, PLACEHOLDERS)}`);
  if (count(source, TAGS) !== count(target, TAGS)) out.push(`formato ${count(source, TAGS)} ≠ ${count(target, TAGS)}`);
  if (zones(source) !== zones(target)) out.push(`zonas ${zones(source)} ≠ ${zones(target)}`);
  if (source.length > 25) {
    const ratio = target.length / source.length;
    if (ratio < 0.35 || ratio > 2.8) out.push(`longitud ${ratio.toFixed(2)}`);
  }
  return out;
}

const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => /^pending-\d+\.json$/.test(f)).sort() : [];
let errors = 0;
for (const locale of ["en", "pt"]) {
  const dictPath = join(ROOT, "src", "content", "i18n", `${locale}.json`);
  const dict = JSON.parse(readFileSync(dictPath, "utf8"));
  let added = 0;
  for (const file of files) {
    const n = file.match(/\d+/)[0];
    const tPath = join(DIR, `${locale}-${n}.json`);
    if (!existsSync(tPath)) continue;
    const sources = JSON.parse(readFileSync(join(DIR, file), "utf8"));
    const targets = JSON.parse(readFileSync(tPath, "utf8"));
    if (targets.length !== sources.length) {
      console.error(`✗ ${locale}-${n}: ${targets.length} traducciones para ${sources.length} textos — lote descartado`);
      errors++;
      continue;
    }
    sources.forEach((source, i) => {
      const problems = problemsOf(source, targets[i]);
      if (problems.length) {
        errors++;
        console.error(`✗ ${locale}-${n} #${i}: ${problems.join("; ")}\n    es: ${source.slice(0, 110)}\n    ${locale}: ${String(targets[i]).slice(0, 110)}`);
        return;
      }
      if (dict[source] !== targets[i]) added++;
      dict[source] = targets[i];
    });
  }
  const sorted = Object.fromEntries(Object.entries(dict).sort(([a], [b]) => a.localeCompare(b, "es")));
  if (!CHECK) writeFileSync(dictPath, JSON.stringify(sorted, null, 1) + "\n");
  console.log(`${locale}: ${Object.keys(sorted).length} entradas (${added} nuevas o cambiadas)${CHECK ? " [--check]" : ""}`);
}
if (errors) {
  console.error(`\n${errors} entradas con problemas (no incorporadas).`);
  process.exitCode = 1;
}
