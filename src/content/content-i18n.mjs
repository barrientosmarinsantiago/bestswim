// Traducción del contenido de sesiones (inglés y portugués) por diccionario.
//
// JavaScript plano a propósito: lo usan la web (src/content/imported-content.ts, con los
// tipos de content-i18n.d.mts) y los scripts de Node (plan semanal, extracción de textos),
// que no compilan TypeScript. Una sola implementación para los dos.
//
// Cómo funciona:
//  1. Los runs de un párrafo se codifican en un texto con marcas: ⟦1⟧negrita⟦/1⟧. Así una
//     traducción conserva qué palabras van en negrita o en color, y se reconstruyen los runs.
//  2. Las cifras se sustituyen por ⟨0⟩, ⟨1⟩…: "COOL DOWN: 200m" y "COOL DOWN: 500m" son la
//     misma entrada del diccionario. Al rellenar, cada cifra se escribe a la manera del
//     idioma: "4.500m" en inglés es "4,500m" (si no, se leería 4,5 metros).
//  3. La clave del diccionario es esa plantilla en español; el valor, la plantilla traducida.

const OPEN = "⟦";
const CLOSE = "⟧";
const TAG_RE = /⟦(\/?)(\d+)⟧/g;

// Miles con punto ("4.500", "12.000") como una sola cifra; si no, decimales o enteros.
// No cuenta como cifra el dígito de un código de zona: VO2max, Z1…Z5.
const NUMBER_RE = /(?<![Vv][Oo]|[Zz])(?:\d{1,3}(?:\.\d{3})+(?![\d.,])|\d+(?:[.,]\d+)?)/g;
const PLACEHOLDER_RE = /⟨(\d+)⟩/g;

const styleOf = (run) => {
  const style = {};
  for (const key of ["bold", "italic", "underline", "color", "background"]) if (run[key]) style[key] = run[key];
  return style;
};
const isPlain = (style) => Object.keys(style).length === 0;
const sameStyle = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Runs -> texto con marcas + lista de estilos. Los runs sin formato van sin marca. */
export function encodeRuns(runs) {
  const styles = [];
  let markup = "";
  // Word parte una misma negrita en muchos runs ("¡¡" + " " + "descansa"…). Se unen los
  // contiguos con el mismo estilo: en pantalla son idénticos, y así textos iguales dan la
  // misma clave y la traducción no arrastra marcas sueltas.
  const merged = [];
  for (const run of runs || []) {
    if (!run.text) continue;
    const prev = merged[merged.length - 1];
    if (prev && sameStyle(styleOf(prev), styleOf(run))) prev.text += run.text;
    else merged.push({ ...run });
  }
  for (const run of merged) {
    const text = run.text || "";
    if (!text) continue;
    const style = styleOf(run);
    if (isPlain(style)) {
      markup += text;
      continue;
    }
    let index = styles.findIndex((s) => sameStyle(s, style));
    if (index === -1) index = styles.push(style) - 1;
    markup += `${OPEN}${index + 1}${CLOSE}${text}${OPEN}/${index + 1}${CLOSE}`;
  }
  return { markup, styles };
}

/** Texto con marcas + estilos -> runs. Tolera marcas desemparejadas: el texto nunca se pierde. */
export function decodeRuns(markup, styles) {
  const runs = [];
  const stack = [];
  let last = 0;
  const push = (text) => {
    if (!text) return;
    const index = stack.length ? stack[stack.length - 1] : 0;
    const style = index ? styles[index - 1] || {} : {};
    const prev = runs[runs.length - 1];
    if (prev && sameStyle(styleOf(prev), style)) prev.text += text;
    else runs.push({ text, ...style });
  };
  for (const match of markup.matchAll(TAG_RE)) {
    push(markup.slice(last, match.index));
    const index = Number(match[2]);
    if (match[1]) {
      const at = stack.lastIndexOf(index);
      if (at !== -1) stack.splice(at, 1);
    } else {
      stack.push(index);
    }
    last = match.index + match[0].length;
  }
  push(markup.slice(last));
  return runs;
}

/** Plantilla: el texto con las cifras sustituidas por ⟨0⟩, ⟨1⟩… y las cifras aparte. */
export function toTemplate(text) {
  const numbers = [];
  // Solo fuera de las marcas: el índice de ⟦1⟧ también es una cifra.
  const template = text
    .split(/(⟦\/?\d+⟧)/)
    .map((part) => (/^⟦\/?\d+⟧$/.test(part) ? part : part.replace(NUMBER_RE, (n) => `⟨${numbers.push(n) - 1}⟩`)))
    .join("");
  return { template, numbers };
}

/** Escribe una cifra del original a la manera del idioma de destino. */
export function formatNumber(value, locale) {
  if (locale !== "en") return value;
  // Español: punto de miles y, en este material, decimales con punto o coma.
  if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) return value.replace(/\./g, ",");
  return value.replace(",", ".");
}

export function fillTemplate(template, numbers, locale) {
  return template.replace(PLACEHOLDER_RE, (_, i) => (numbers[Number(i)] !== undefined ? formatNumber(numbers[Number(i)], locale) : ""));
}

/** Clave de diccionario de un texto: plantilla sin espacios sobrantes. */
export function templateKey(text) {
  return toTemplate(text.replace(/\s+/g, " ").trim()).template;
}

/**
 * Traduce runs con el diccionario. Devuelve los runs traducidos, o null si el texto no
 * está en el diccionario (el llamador decide el respaldo).
 */
export function translateRuns(runs, dictionary, locale) {
  const { markup, styles } = encodeRuns(runs);
  const normalized = markup.replace(/\s+/g, " ").trim();
  if (!normalized || !/\p{L}/u.test(normalized)) return null;
  const { template, numbers } = toTemplate(normalized);
  const target = dictionary[template];
  if (typeof target !== "string") return null;
  return decodeRuns(fillTemplate(target, numbers, locale), styles);
}

/** Traduce un texto plano (títulos, resúmenes). null si no está en el diccionario. */
export function translatePlain(text, dictionary, locale) {
  if (!text) return null;
  const runs = translateRuns([{ text }], dictionary, locale);
  return runs ? runs.map((r) => r.text).join("") : null;
}
