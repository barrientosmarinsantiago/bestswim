// Lector .docx sin dependencias (ZIP + inflate) y parser de bloques a formato ImportedDocument.
// Compartido por los importadores de contenido. Las intensidades de zona se aplican en render
// (ZoneAwareText), por eso se descartan los colores de texto ad-hoc del Word.

import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

export function readZipEntry(buf, name) {
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

function parseRuns(pXml) {
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
    runs.push(run);
  }
  const merged = [];
  for (const r of runs) {
    const last = merged[merged.length - 1];
    if (last && last.bold === r.bold && last.italic === r.italic && last.underline === r.underline) {
      last.text += r.text;
    } else merged.push({ ...r });
  }
  return merged;
}

// Busca el siguiente <w:tbl> real (apertura de tabla), evitando <w:tblPr>/<w:tblGrid>
// que empiezan igual — el \b garantiza que tras "tbl" venga ">" o espacio, no una letra.
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

export function parseDocxFile(path) {
  const xml = readZipEntry(readFileSync(path), "word/document.xml").toString("utf8");
  const body = (xml.match(/<w:body>([\s\S]*)<\/w:body>/) || [, xml])[1];
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
            lines.push({ runs: rs, text: rs.map((r) => r.text).join("") });
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
      const runs = parseRuns(body.slice(pIdx, end));
      const text = runs.map((r) => r.text).join("");
      const block = { type: "paragraph", text, runs };
      const norm = text.trim().replace(/\s+/g, " ");
      if (PHASE_RE.test(norm)) block.variant = "subheading";
      else if (NOTE_RE.test(norm)) block.variant = "note";
      blocks.push(block);
      i = end;
    }
  }
  return blocks;
}

const PHASE_RE = /^\s*(WARM\s*UP|MAIN\s*SET|COOL\s*DOWN|CALENTAMIENTO|PARTE\s+PRINCIPAL|SERIE\s+PRINCIPAL|VUELTA\s+A\s+LA\s+CALMA|ENFRIAMIENTO)\b/i;
const NOTE_RE = /^\s*(¡¡|Nota|Objetivo|Opción|Comprueba|Recuerda|Importante|Es recomendable|Excelente)/i;

function lineToParagraph(line) {
  const text = line.text.trim();
  const norm = text.replace(/[ \s]+/g, " "); // NBSP y espacios raros → espacio normal
  const runs = line.runs.length ? line.runs.map((r) => ({ ...r })) : [{ text }];
  let variant = "body";
  if (PHASE_RE.test(norm)) variant = "subheading";
  else if (NOTE_RE.test(norm)) variant = "note";
  return { type: "paragraph", text, runs, variant };
}

export function unwrapSingleColumnTables(blocks) {
  const out = [];
  for (const b of blocks) {
    // Tablas de maquetación (1-2 columnas, texto de sesión) → párrafos en orden de lectura.
    // Las tablas de datos reales (p. ej. la referencia de zonas, ≥3 columnas) se conservan.
    if (b.type === "table" && Math.max(...b.rows.map((r) => r.length)) <= 2) {
      for (const row of b.rows) {
        for (const cell of row) {
          const lines = cell._lines && cell._lines.length ? cell._lines : [{ runs: [{ text: cell.text }], text: cell.text }];
          for (const line of lines) {
            if (!line.text.trim()) continue;
            out.push(lineToParagraph(line));
          }
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

export function cleanBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === "paragraph" && !b.text.trim()) {
      if (out.length && out[out.length - 1]._empty) continue;
      out.push({ ...b, _empty: true });
      continue;
    }
    out.push(b);
  }
  while (out.length && out[0]._empty) out.shift();
  while (out.length && out[out.length - 1]._empty) out.pop();
  return out.map(({ _empty, _lines, ...b }) => b).filter((b) => !(b.type === "paragraph" && !b.text.trim()));
}

export function slug(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function deriveSummary(blocks) {
  const vol = blocks.find((b) => b.type === "paragraph" && /^(volumen|total)\b/i.test(b.text.trim()));
  if (vol) return vol.text.trim();
  const firstBody = blocks.find((b) => b.type === "paragraph" && b.text.trim().length > 8);
  return firstBody ? firstBody.text.trim().slice(0, 200) : "";
}

export function deriveTotal(text) {
  const m = text.match(/(\d[\d.,]*\s*m\b)/i) || text.match(/(\d[\d.,]*\s*km\b)/i);
  return m ? m[1].replace(/\s+/g, "") : undefined;
}
