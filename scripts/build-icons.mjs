// Genera el juego completo de iconos del sitio a partir de public/favicon.svg.
//
// Un SVG suelto no basta: Google resuelve el icono del resultado de búsqueda desde el
// rel="icon" de la home y cae a /favicon.ico cuando no encuentra otra cosa, y pide un
// cuadrado múltiplo de 48px. Safari/iOS ignoran el SVG y buscan apple-touch-icon.
// Sin estos ficheros el resultado sale con el icono genérico.
//
// Uso:  node scripts/build-icons.mjs   (también corre en prebuild)
import { Buffer } from "node:buffer";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "public", "favicon.svg");
const PUBLIC = join(ROOT, "public");

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("[icons] sharp no está instalado — se omite.");
  process.exit(0);
}

const svg = readFileSync(SRC);

/** El SVG ya trae su propio fondo (#020A18), así que no hace falta aplanar nada. */
const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: "contain" }).png({ compressionLevel: 9 }).toBuffer();

/**
 * .ico multi-tamaño envolviendo PNGs.
 *
 * Un ICO es una cabecera de 6 bytes, una entrada de 16 por imagen y luego los datos.
 * Desde Vista el payload puede ser PNG, así que no hace falta un codificador BMP — que
 * es justo por lo que esto son ocho líneas y no una dependencia.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 significa 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

// 16/32/48 para el .ico; 96 y 192 son múltiplos de 48 (Google, Android);
// 180 es el tamaño fijo de Apple; 512 es el icono de instalación del manifest.
const sizes = [16, 32, 48, 96, 180, 192, 512];
const rendered = new Map();
for (const size of sizes) rendered.set(size, await render(size));

writeFileSync(join(PUBLIC, "favicon.ico"), ico([16, 32, 48].map((size) => ({ size, data: rendered.get(size) }))));
writeFileSync(join(PUBLIC, "icon-96.png"), rendered.get(96));
writeFileSync(join(PUBLIC, "apple-touch-icon.png"), rendered.get(180));
writeFileSync(join(PUBLIC, "icon-192.png"), rendered.get(192));
writeFileSync(join(PUBLIC, "icon-512.png"), rendered.get(512));

for (const f of ["favicon.ico", "icon-96.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"]) {
  console.log(`[icons] ${f} — ${(statSync(join(PUBLIC, f)).size / 1024).toFixed(1)} KB`);
}
