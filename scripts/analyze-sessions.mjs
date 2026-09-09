// Clasifica cada sesión de src/content/imported-content.json en un perfil estructurado.
//
// Es la pieza que hace posible programar solo: el portal no puede "intercalar técnica,
// acondicionamiento y test" si no sabe qué es cada sesión, y el .docx solo trae prosa.
// Aquí se lee esa prosa una vez y se deja un catálogo con nivel, zona, método, volumen
// y carga técnica, que es lo que consume scripts/build-weekly-plan.mjs.
//
// Uso:  node scripts/analyze-sessions.mjs            (resumen por consola)
//       node scripts/analyze-sessions.mjs --json     (vuelca el catálogo)
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const JSON_PATH = join(ROOT, "src", "content", "imported-content.json");
const OUT_PATH = join(ROOT, "src", "content", "session-catalog.json");

const flat = (d) =>
  d.blocks
    .map((b) => (b.type === "paragraph" ? b.text : (b.rows || []).map((r) => r.map((c) => c.text).join(" ")).join(" ")))
    .join("\n");

function levelOf(groupId, text, title) {
  // El titulo manda sobre el grupo: las sesiones combinadas AEL-AEM-AEI viven todas en
  // una carpeta sin nivel, pero cada fichero declara el suyo. Si se resolvieran como
  // "todos" acabarian ofreciendose a cualquiera, y una de ellas es de 5.000 m: en el
  // plan de principiante eso no es una variacion, es una sesion que no toca.
  const fromTitle = String(title).match(/\b(principiante|intermedio|avanzado)\b/i);
  if (fromTitle) return fromTitle[1].toLowerCase();
  if (/principiante/i.test(groupId)) return "principiante";
  if (/intermedio/i.test(groupId)) return "intermedio";
  if (/avanzado/i.test(groupId)) return "avanzado";
  const m = text.match(/-?\s*nivel\s+(principiante|intermedio|avanzado)/i);
  return m ? m[1].toLowerCase() : "todos";
}

/** Zona dominante. El MAIN SET manda: el calentamiento casi siempre es AEL y
 *  contaría en todas las sesiones si se mirara el documento entero. */
function zoneOf(title, text) {
  const main = (text.split(/MAIN SET/i)[1] || text).slice(0, 1200);
  const has = (re) => re.test(main);
  const aei = has(/\bAEI\b|zona\s*3|aer[óo]bico intensivo/i);
  const aem = has(/\bAEM\b|zona\s*2|aer[óo]bico medio/i);
  const ael = has(/\bAEL\b|zona\s*1|aer[óo]bico ligero/i);
  const vel = has(/velocidad m[áa]xima|anaer[óo]bico|zona\s*[45]|tolerancia l[áa]ctica/i);
  const zones = [ael && "AEL", aem && "AEM", aei && "AEI", vel && "VEL"].filter(Boolean);
  if (zones.length > 1) return { zone: "MIXTA", zones };
  if (zones.length === 1) return { zone: zones[0], zones };
  if (/\bAEM\b/i.test(title)) return { zone: "AEM", zones: ["AEM"] };
  if (/\bAEL\b/i.test(title)) return { zone: "AEL", zones: ["AEL"] };
  return { zone: "AEL", zones: ["AEL"] };
}

const METHODS = [
  [/test/i, "test"],
  [/fuerza\s*resistencia/i, "fuerza-resistencia"],
  [/escalera/i, "escalera"],
  [/fartlek|continuo variable/i, "fartlek"],
  [/fraccionamiento\s+distancias\s+largas/i, "fraccionamiento-largo"],
  [/interv[áa]lico\s+intensivo/i, "intervalico-intensivo"],
  [/interv[áa]lico/i, "intervalico-extensivo"],
  [/continuo\s+uniforme\s+intensivo|\(CI\)/i, "continuo-intensivo"],
  [/continuo\s+uniforme\s+extensivo|\(CE\)/i, "continuo-extensivo"],
  [/cambios?\s+de\s+ritmo/i, "cambios-ritmo"],
  [/snorkel/i, "tecnica-snorkel"]
];
function methodOf(title, text) {
  const declared = (text.match(/M[ée]todos?\s*:?\s*([^\n]{3,80})/i) || [])[1] || "";
  const hay = `${title} ${declared}`;
  for (const [re, name] of METHODS) if (re.test(hay)) return name;
  // El respaldo mira solo el MAIN SET: en el calentamiento aparecen tuba, aletas y
  // series cortas en casi todas las sesiones, y clasificarían por material en vez de
  // por el trabajo real de la sesión.
  const main = (text.split(/MAIN SET/i)[1] || "").slice(0, 1200);
  for (const [re, name] of METHODS) if (name !== "tecnica-snorkel" && re.test(main)) return name;
  return "continuo-extensivo";
}

/** Volumen en metros. "Volumen sesión: 4.300m" / "Total: 3.100m" / "TOTAL 2.700m". */
function volumeOf(text) {
  const m = text.match(/(?:volumen\s*(?:de\s*la\s*)?sesi[óo]n|total)\s*:?\s*([\d][\d.,]*)\s*m\b/i);
  if (m) return Number(m[1].replace(/\./g, "").replace(",", ".")) || null;
  return null;
}
function minutesOf(text) {
  const m = text.match(/(\d{1,3})\s*minutos?\s+(?:de\s+)?nado/i) || text.match(/nado\s+continuo\s+(\d{1,3})\s*minutos?/i);
  return m ? Number(m[1]) : null;
}

const GEAR = { aletas: /aletas/i, palas: /palas/i, pull: /pull\s*buoy|con pull\b/i, tabla: /tabla/i, tuba: /tuba|snorkel/i, gomas: /gomas/i };
function gearOf(text) {
  return Object.entries(GEAR).filter(([, re]) => re.test(text)).map(([k]) => k);
}

/** Carga técnica: cuántas menciones de drill/técnica. Es lo que separa una sesión
 *  "de técnica" de una de volumen puro cuando ambas son AEL. */
function techLoadOf(text) {
  const hits = (text.match(/\bdrill|t[ée]cnica|\d\/\d\/\d|remadas|catch|braceo|alineaci[óo]n/gi) || []).length;
  return hits;
}

const INTENSITY = { AEL: 1, AEM: 2, AEI: 3, VEL: 5, MIXTA: 3 };

function classify(doc, group) {
  const text = flat(doc);
  const { zone, zones } = zoneOf(doc.title, text);
  const method = methodOf(doc.title, text);
  const volume = volumeOf(text);
  const minutes = minutesOf(text);
  const tech = techLoadOf(text);
  const isTest = method === "test" || /^test/i.test(doc.title);
  return {
    id: doc.id,
    groupId: group.id,
    title: doc.title,
    level: levelOf(group.id, text, doc.title),
    zone,
    zones,
    method,
    volumeM: volume,
    minutes,
    intensity: isTest ? 4 : INTENSITY[zone] ?? 2,
    techLoad: tech,
    techHeavy: tech >= 4,
    gear: gearOf(text),
    isTest
  };
}

function main() {
  const json = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  const section = json.natacionSections.find((s) => s.id === "entrenamiento");
  const catalog = [];
  for (const g of section.groups) for (const d of g.documents) catalog.push(classify(d, g));

  const by = (key) => {
    const m = new Map();
    for (const c of catalog) m.set(c[key], (m.get(c[key]) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  console.log(`\n=== CATÁLOGO: ${catalog.length} sesiones ===\n`);
  console.log("Por nivel:      ", by("level").map(([k, v]) => `${k}=${v}`).join("  "));
  console.log("Por zona:       ", by("zone").map(([k, v]) => `${k}=${v}`).join("  "));
  console.log("Por método:     ", by("method").map(([k, v]) => `${k}=${v}`).join("  "));
  console.log("Técnicas (>=6): ", catalog.filter((c) => c.techHeavy).length);
  console.log("Tests:          ", catalog.filter((c) => c.isTest).length);

  console.log("\n--- MATRIZ nivel × método ---");
  const levels = ["principiante", "intermedio", "avanzado", "todos"];
  const methods = [...new Set(catalog.map((c) => c.method))].sort();
  const w = Math.max(...methods.map((m) => m.length)) + 2;
  console.log("".padEnd(w) + levels.map((l) => l.slice(0, 6).padStart(8)).join(""));
  for (const m of methods) {
    const row = levels.map((l) => String(catalog.filter((c) => c.method === m && c.level === l).length).padStart(8)).join("");
    console.log(m.padEnd(w) + row);
  }

  const vols = catalog.filter((c) => c.volumeM);
  console.log(`\nVolumen: ${vols.length}/${catalog.length} con metros declarados · media ${Math.round(vols.reduce((n, c) => n + c.volumeM, 0) / vols.length)}m`);
  for (const l of levels.slice(0, 3)) {
    const v = vols.filter((c) => c.level === l).map((c) => c.volumeM).sort((a, b) => a - b);
    if (v.length) console.log(`  ${l.padEnd(13)} n=${String(v.length).padStart(3)}  min=${v[0]}  mediana=${v[Math.floor(v.length / 2)]}  max=${v[v.length - 1]}`);
  }

  if (process.argv.includes("--json")) {
    writeFileSync(OUT_PATH, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), sessions: catalog }, null, 2) + "\n");
    console.log(`\n✓ Escrito ${OUT_PATH}`);
  }
  console.log("");
}
main();
