// Importa sesiones .docx de content-import/ al JSON estático (src/content/imported-content.json).
//
// - Lee .docx sin dependencias (un .docx es un ZIP; zlib.inflateRawSync descomprime).
// - Extrae texto + negrita/cursiva/subrayado + sombreado de celda. NO conserva los
//   colores de texto ad-hoc del Word: las intensidades de zona (AEL/AEM/Z1-Z5/velocidad
//   máxima, etc.) las aplica el coloreado canónico en render (src/content/zones.*).
// - Las tablas de una sola columna (WARM UP / MAIN SET / COOL DOWN) se "desenvuelven"
//   a párrafos para igualar el estilo de las sesiones ya existentes.
// - Deduplica por contenido dentro de cada grupo (copias idénticas se descartan).
// - Idempotente: reemplaza grupos por id, así re-ejecutar no duplica.
//
// Uso:
//   node scripts/import-sessions.mjs --dry-run   (muestra el plan, no escribe)
//   node scripts/import-sessions.mjs             (aplica y reescribe el JSON)

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { join } from "node:path";
import { createHash } from "node:crypto";

const ROOT = process.cwd();
const JSON_PATH = join(ROOT, "src", "content", "imported-content.json");
const SECTION_ID = "entrenamiento";
const BASE_REL = "content-import/Natacion/Entrenamiento";
const DRY = process.argv.includes("--dry-run");

// Carpetas nuevas a importar (relativas a BASE_REL). Cada subcarpeta con .docx = un grupo.
const TOP_FOLDERS = [
  "SESIONES DE ENTRENAMIENTO AEL",
  "SESIONES DE ENTRENAMIENTO AEM",
  "SESIONES COMBINADAS AEL-AEM-AEI",
  "TEST DE RENDIMIENTO EN PISCINA"
];

// ---------- ZIP mínimo ----------
function readZipEntry(buf, name) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("EOCD no encontrado");
  const cdCount = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < cdCount; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error("central dir corrupto");
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const fname = buf.toString("utf8", off + 46, off + 46 + nameLen);
    if (fname === name) {
      const lNameLen = buf.readUInt16LE(lho + 26);
      const lExtraLen = buf.readUInt16LE(lho + 28);
      const dataStart = lho + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(dataStart, dataStart + compSize);
      return method === 0 ? Buffer.from(raw) : inflateRawSync(raw);
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`entry ${name} no encontrada`);
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

// ---------- Parser docx ----------
function parseRuns(pXml, { keepColor = false } = {}) {
  const runs = [];
  const runRe = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g;
  let m;
  while ((m = runRe.exec(pXml))) {
    const rXml = m[1];
    const rPr = (rXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/) || [, ""])[1];
    let text = "";
    const tokRe = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
    let t;
    while ((t = tokRe.exec(rXml))) {
      if (t[1] !== undefined) text += decodeEntities(t[1]);
      else text += " ";
    }
    if (!text) continue;
    const run = { text };
    if (/<w:b\/>/.test(rPr) || /<w:b\b[^>]*\bw:val="(?:1|true|on)"/.test(rPr)) run.bold = true;
    if (/<w:b\b[^>]*\bw:val="(?:0|false|off)"/.test(rPr)) delete run.bold;
    if (/<w:i\/>/.test(rPr) || /<w:i\b[^>]*\bw:val="(?:1|true|on)"/.test(rPr)) run.italic = true;
    const u = rPr.match(/<w:u\b[^>]*\bw:val="([^"]+)"/);
    if (u && u[1] !== "none") run.underline = true;
    if (keepColor) {
      const color = rPr.match(/<w:color\b[^>]*\bw:val="([0-9A-Fa-f]{6})"/);
      if (color && color[1].toLowerCase() !== "000000") run.color = "#" + color[1].toUpperCase();
    }
    runs.push(run);
  }
  // fusiona runs adyacentes con idéntico formato (mejor detección de tokens de zona)
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && last.bold === r.bold && last.italic === r.italic && last.underline === r.underline && last.color === r.color) {
      last.text += r.text;
    } else merged.push({ ...r });
  }
  return merged;
}

// Busca la siguiente APERTURA de tabla real. `indexOf("<w:tbl")` también casa con
// <w:tblPr> y <w:tblGrid>, que son propiedades DENTRO de la tabla: contarlas como
// aperturas descuadra el anidamiento y hace que findMatchingTbl devuelva un final
// equivocado, tragándose los párrafos que van entre tablas (las series de la sesión).
// El \b obliga a que tras "tbl" venga ">" o un espacio, no otra letra.
function nextTblOpen(s, from) {
  const re = /<w:tbl\b/g;
  re.lastIndex = Math.max(0, from);
  const m = re.exec(s);
  return m ? m.index : -1;
}

function findMatchingTbl(body, start) {
  let depth = 0, pos = start;
  while (pos < body.length) {
    const no = nextTblOpen(body, pos + 1);
    const nc = body.indexOf("</w:tbl>", pos + 1);
    if (nc === -1) return body.length;
    if (no !== -1 && no < nc) { depth++; pos = no; }
    else { if (depth === 0) return nc + 8; depth--; pos = nc; }
  }
  return body.length;
}

function parseDocxBlocks(documentXml) {
  const body = (documentXml.match(/<w:body>([\s\S]*)<\/w:body>/) || [, documentXml])[1];
  const blocks = [];
  let i = 0;
  while (i < body.length) {
    const pIdx = body.indexOf("<w:p", i);
    const tIdx = nextTblOpen(body, i);
    if (pIdx === -1 && tIdx === -1) break;
    const isTable = tIdx !== -1 && (pIdx === -1 || tIdx < pIdx);
    if (isTable) {
      const j = findMatchingTbl(body, tIdx);
      const tblXml = body.slice(tIdx, j);
      const rows = [];
      const rowRe = /<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g;
      let rm;
      while ((rm = rowRe.exec(tblXml))) {
        const cells = [];
        const cellRe = /<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g;
        let cm;
        while ((cm = cellRe.exec(rm[1]))) {
          const cXml = cm[1];
          const cShd = cXml.match(/<w:tcPr>[\s\S]*?<w:shd\b[^>]*\bw:fill="([0-9A-Fa-f]{6})"/);
          const cellRuns = [];
          const lines = [];
          const cpRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
          let cp;
          while ((cp = cpRe.exec(cXml))) {
            const rs = parseRuns(cp[1]);
            const lineText = rs.map((r) => r.text).join("");
            lines.push({ runs: rs, text: lineText });
            cellRuns.push(...rs);
          }
          const cell = { text: lines.map((l) => l.text).join("\n"), runs: cellRuns.length ? cellRuns : [{ text: "" }], _lines: lines };
          if (cShd && !["ffffff", "auto"].includes(cShd[1].toLowerCase())) cell.background = "#" + cShd[1].toUpperCase();
          cells.push(cell);
        }
        if (cells.length) rows.push(cells);
      }
      if (rows.length) blocks.push({ type: "table", rows });
      i = j;
    } else {
      const pEnd = body.indexOf("</w:p>", pIdx);
      const end = pEnd === -1 ? body.length : pEnd + 6;
      const pXml = body.slice(pIdx, end);
      const runs = parseRuns(pXml);
      const text = runs.map((r) => r.text).join("");
      blocks.push({ type: "paragraph", text, runs });
      i = end;
    }
  }
  return blocks;
}

// ---------- Transformaciones de contenido ----------
const PHASE_RE = /^\s*(WARM\s*UP|MAIN\s*SET|COOL\s*DOWN|CALENTAMIENTO|PARTE\s+PRINCIPAL|SERIE\s+PRINCIPAL|VUELTA\s+A\s+LA\s+CALMA|ENFRIAMIENTO)\b/i;
const NOTE_RE = /^\s*(¡¡|Nota|Objetivo|Opción|Comprueba|Recuerda|Importante)/i;

function lineToParagraph(line) {
  const text = line.text.trim();
  const runs = line.runs.length ? line.runs.map((r) => ({ ...r, text: r.text })) : [{ text }];
  let variant = "body";
  if (PHASE_RE.test(text)) variant = "subheading";
  else if (NOTE_RE.test(text)) variant = "note";
  return { type: "paragraph", text, runs, variant };
}

// Desenvuelve tablas de 1 columna a párrafos; conserva tablas multi-columna.
function unwrapSingleColumnTables(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === "table" && b.rows.every((r) => r.length === 1)) {
      for (const row of b.rows) {
        const cell = row[0];
        const lines = cell._lines && cell._lines.length ? cell._lines : [{ runs: [{ text: cell.text }], text: cell.text }];
        for (const line of lines) {
          if (!line.text.trim()) continue;
          out.push(lineToParagraph(line));
        }
      }
    } else if (b.type === "table") {
      out.push({ type: "table", rows: b.rows.map((r) => r.map((c) => ({ text: c.text, runs: c.runs, ...(c.background ? { background: c.background } : {}) }))) });
    } else {
      out.push(b);
    }
  }
  return out;
}

function cleanBlocks(blocks) {
  // quita párrafos vacíos consecutivos / al inicio
  const out = [];
  for (const b of blocks) {
    if (b.type === "paragraph") {
      if (!b.text.trim()) { if (out.length && out[out.length - 1]._empty) continue; out.push({ ...b, _empty: true }); continue; }
    }
    out.push(b);
  }
  while (out.length && out[0]._empty) out.shift();
  while (out.length && out[out.length - 1]._empty) out.pop();
  return out.map(({ _empty, ...b }) => b).filter((b) => !(b.type === "paragraph" && !b.text.trim()));
}

function slug(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const CODE_UPPER = new Set(["ael", "aem", "aei", "pae", "css", "ie", "ce", "vo2", "vo2max", "z1", "z2", "z3", "z4", "z5", "fc", "rpe"]);
function prettifyTitle(fileBase) {
  let s = fileBase.replace(/\s+\(\d+\)$/, "").replace(/\.docx$/i, "").replace(/\s+/g, " ").trim();
  s = s.replace(/\bSESION\b/i, "Sesión").replace(/\bSESIÓN\b/i, "Sesión");
  return s.split(" ").map((w) => {
    const low = w.toLowerCase();
    if (CODE_UPPER.has(low)) return w.toUpperCase();
    if (/^\d+m?$/i.test(w)) return w;
    return low.charAt(0).toUpperCase() + low.slice(1);
  }).join(" ");
}

function deriveSummary(blocks) {
  const vol = blocks.find((b) => b.type === "paragraph" && /^(volumen|total)\b/i.test(b.text.trim()));
  if (vol) return vol.text.trim();
  const firstBody = blocks.find((b) => b.type === "paragraph" && b.variant === "body" && b.text.trim().length > 8);
  return firstBody ? firstBody.text.trim().slice(0, 180) : "";
}

function deriveTotal(summary) {
  const m = summary.match(/(\d[\d.,]*\s*m\b)/i);
  return m ? m[1].replace(/\s+/g, "") : undefined;
}

function buildDocument(filePath, relPath, categoryPath, groupId, fileBase) {
  const buf = readFileSync(filePath);
  const xml = readZipEntry(buf, "word/document.xml").toString("utf8");
  let blocks = parseDocxBlocks(xml);
  blocks = unwrapSingleColumnTables(blocks);
  // primer párrafo no vacío = title
  let titled = false;
  blocks = blocks.map((b) => {
    if (!titled && b.type === "paragraph" && b.text.trim()) { titled = true; return { ...b, variant: "title" }; }
    return b;
  });
  blocks = cleanBlocks(blocks).map(({ _lines, ...b }) => b);
  const title = prettifyTitle(fileBase);
  const summary = deriveSummary(blocks);
  const total = deriveTotal(summary);
  const id = `${groupId}-${slug(fileBase.replace(/\.docx$/i, ""))}`;
  const doc = { id, title, sourcePath: relPath.replace(/\\/g, "/"), categoryPath, blocks, summary };
  if (total) doc.total = total;
  return doc;
}

function contentHash(doc) {
  const norm = doc.blocks.map((b) => b.type === "paragraph" ? b.text.trim() : b.rows.map((r) => r.map((c) => c.text.trim()).join("|")).join("\n")).join("\n").replace(/\s+/g, " ").toLowerCase();
  return createHash("sha1").update(norm).digest("hex");
}

function listDocx(dir) {
  return readdirSync(dir).filter((f) => /\.docx$/i.test(f) && !f.startsWith("~$")).sort();
}
function listSubdirs(dir) {
  return readdirSync(dir).filter((f) => { try { return statSync(join(dir, f)).isDirectory(); } catch { return false; } }).sort();
}

// ---------- Construcción de grupos ----------
function buildGroupFrom(absFolder, relFolder, groupTitle) {
  const groupId = slug(relFolder);
  const documents = [];
  const seen = new Map();
  const usedIds = new Set();
  const skipped = [];
  for (const file of listDocx(absFolder)) {
    const abs = join(absFolder, file);
    const rel = `${BASE_REL}/${relFolder}/${file}`.replace(/\\/g, "/");
    let doc;
    try { doc = buildDocument(abs, rel, [groupTitle], groupId, file); }
    catch (e) { skipped.push({ file, reason: "error: " + e.message }); continue; }
    const h = contentHash(doc);
    if (seen.has(h)) { skipped.push({ file, reason: "duplicado de " + seen.get(h) }); continue; }
    seen.set(h, file);
    // garantiza id único dentro del grupo
    let uid = doc.id, k = 2;
    while (usedIds.has(uid)) uid = `${doc.id}-${k++}`;
    usedIds.add(uid);
    doc.id = uid;
    documents.push(doc);
  }
  return { id: groupId, title: groupTitle, documents, skipped };
}

function collectGroups() {
  const groups = [];
  const report = [];
  for (const top of TOP_FOLDERS) {
    const topAbs = join(ROOT, BASE_REL.replace(/\//g, "\\"), top);
    const subs = listSubdirs(topAbs);
    if (subs.length) {
      for (const sub of subs) {
        const g = buildGroupFrom(join(topAbs, sub), `${top}/${sub}`, sub);
        groups.push(g);
        report.push({ group: `${top} / ${sub}`, imported: g.documents.length, skipped: g.skipped });
      }
    } else {
      const g = buildGroupFrom(topAbs, top, top);
      groups.push(g);
      report.push({ group: top, imported: g.documents.length, skipped: g.skipped });
    }
  }
  return { groups, report };
}

// ---------- Merge + escritura ----------
function main() {
  const json = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  const section = json.natacionSections.find((s) => s.id === SECTION_ID);
  if (!section) throw new Error(`sección ${SECTION_ID} no encontrada`);

  const { groups, report } = collectGroups();

  console.log(`\n=== PLAN DE IMPORTACIÓN (sección "${section.title}") ===`);
  let totalImported = 0, totalSkipped = 0;
  for (const r of report) {
    totalImported += r.imported; totalSkipped += r.skipped.length;
    console.log(`\n• ${r.group}`);
    console.log(`   importadas: ${r.imported}  |  descartadas: ${r.skipped.length}`);
    for (const s of r.skipped) console.log(`     - ${s.file}  (${s.reason})`);
  }
  console.log(`\nTOTAL: ${totalImported} sesiones en ${groups.length} grupos nuevos  |  ${totalSkipped} descartadas`);

  const existingIds = new Set(section.groups.map((g) => g.id));
  const willReplace = groups.filter((g) => existingIds.has(g.id)).map((g) => g.id);
  if (willReplace.length) console.log(`\nGrupos que se REEMPLAZAN por id: ${willReplace.join(", ")}`);

  // Reemplazo real, no merge. Un grupo "gestionado" es el que cuelga de una de las
  // TOP_FOLDERS (su id empieza por el slug de la carpeta). Si esta pasada no lo ha
  // producido, el material nuevo ya no lo contiene y se retira: mergeando solo por id,
  // un renombrado de carpeta dejaría el grupo viejo huérfano y el sitio serviría a la
  // vez el contenido nuevo y el que vino a sustituirlo.
  //
  // El plan de poda se calcula ANTES de salir por --dry-run: retirar grupos es la parte
  // destructiva, así que es justo lo que hay que poder revisar sin escribir nada.
  const managedPrefixes = TOP_FOLDERS.map((t) => slug(t));
  const isManaged = (id) => managedPrefixes.some((pre) => id === pre || id.startsWith(pre + "-"));
  const producedIds = new Set(groups.map((g) => g.id));
  const prunedIds = new Set(
    section.groups.filter((g) => isManaged(g.id) && !producedIds.has(g.id)).map((g) => g.id)
  );
  const kept = section.groups.filter((g) => !isManaged(g.id));

  if (prunedIds.size) {
    console.log(`\nGrupos RETIRADOS (gestionados y ya no presentes en content-import):`);
    for (const g of section.groups) {
      if (prunedIds.has(g.id)) console.log(`   - ${g.id}  (${g.documents.length} sesiones)`);
    }
  }
  if (kept.length) {
    console.log(`\nGrupos NO gestionados que se conservan intactos:`);
    for (const g of kept) console.log(`   · ${g.id}  (${g.documents.length} sesiones)`);
  }

  if (DRY) { console.log("\n[dry-run] No se ha escrito nada.\n"); return; }

  const byId = new Map(section.groups.filter((g) => !prunedIds.has(g.id)).map((g) => [g.id, g]));
  for (const g of groups) byId.set(g.id, { id: g.id, title: g.title, documents: g.documents });
  section.groups = Array.from(byId.values());

  writeFileSync(JSON_PATH, JSON.stringify(json, null, 2) + "\n");
  console.log(`\n✓ Escrito ${JSON_PATH}\n`);
}

main();
