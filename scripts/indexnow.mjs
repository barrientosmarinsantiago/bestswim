// Avisa a Bing (y Yandex, Seznam…) de las URL publicadas, vía IndexNow.
//
// Google NO usa IndexNow: allí el rastreo se pide desde Search Console. Esto sirve para
// que Bing no tarde semanas en descubrir el sitio, que es su ritmo normal para un dominio
// nuevo sin enlaces entrantes.
//
// El protocolo exige demostrar que controlas el dominio publicando la clave en un fichero
// de texto accesible. Este script lo escribe en public/ además de enviar las URL, para que
// no se pueda enviar nada sin que la verificación exista.
//
// Uso:
//   INDEXNOW_KEY=<clave> node scripts/indexnow.mjs            -> escribe la clave y envía
//   INDEXNOW_KEY=<clave> node scripts/indexnow.mjs --key-only -> solo escribe el fichero
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const KEY = process.env.INDEXNOW_KEY;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://bestswim.es").replace(/\/$/, "");
const KEY_ONLY = process.argv.includes("--key-only");

if (!KEY) {
  console.error("[indexnow] Falta INDEXNOW_KEY. Genera una cadena hex de 8-128 caracteres y ponla en el entorno.");
  process.exit(1);
}
if (!/^[a-zA-Z0-9-]{8,128}$/.test(KEY)) {
  console.error("[indexnow] La clave debe tener entre 8 y 128 caracteres alfanuméricos o guiones.");
  process.exit(1);
}

// El fichero debe llamarse exactamente <clave>.txt y contener solo la clave.
const keyFile = join(ROOT, "public", `${KEY}.txt`);
writeFileSync(keyFile, KEY);
console.log(`[indexnow] clave publicada en public/${KEY}.txt -> ${SITE}/${KEY}.txt`);

if (KEY_ONLY) process.exit(0);

const { locales } = await import("../src/i18n/config.js").catch(() => ({ locales: ["es", "en", "pt"] }));
const content = JSON.parse(
  await import("node:fs").then((fs) => fs.promises.readFile(join(ROOT, "src/content/imported-content.json"), "utf8"))
);

const paths = [
  "",
  ...content.natacionSections.map((s) => s.href),
  ...content.challenges.map((c) => c.href)
];
const urlList = (locales ?? ["es", "en", "pt"]).flatMap((locale) => paths.map((p) => `${SITE}/${locale}${p}`));

console.log(`[indexnow] enviando ${urlList.length} URL…`);

const response = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList
  })
});

// 200 = aceptado, 202 = aceptado pero la clave aún no se ha validado (normal la 1.ª vez).
if (response.ok) {
  console.log(`[indexnow] ✓ ${response.status} ${response.statusText}`);
} else {
  console.error(`[indexnow] ✗ ${response.status} ${response.statusText}`);
  console.error(await response.text().catch(() => ""));
  process.exit(1);
}
