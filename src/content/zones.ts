import zonesData from "./zones.json";

export type ZoneLegendItem = { label: string; color: string; name: string };

export const zoneCodeColors: Record<string, string> = zonesData.codeColors;
export const zonePhraseColors: ReadonlyArray<{ phrase: string; color: string }> = zonesData.phraseColors;
export const zoneTextColors: Record<string, string> = zonesData.textColors;
export const zoneLegend: ReadonlyArray<ZoneLegendItem> = zonesData.legend;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripAccents(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Convierte una frase en un patrón insensible a acentos (máxima == maxima).
function accentInsensitivePattern(value: string): string {
  return escapeRegExp(value)
    .replace(/[aá]/gi, "[aá]")
    .replace(/[eé]/gi, "[eé]")
    .replace(/[ií]/gi, "[ií]")
    .replace(/[oó]/gi, "[oó]")
    .replace(/[uú]/gi, "[uú]");
}

// Tokenizador: frases exactas primero (más específicas), luego códigos de zona.
const phraseAlternation = zonePhraseColors.map((entry) => accentInsensitivePattern(entry.phrase)).join("|");
const codeAlternation = Object.keys(zoneCodeColors).join("|");

export const zoneTokenPattern = new RegExp(`(${phraseAlternation}|${codeAlternation})`, "gi");

export function colorForZoneToken(token: string): string | null {
  const code = zoneCodeColors[token.toUpperCase()];
  if (code) {
    return code;
  }

  const normalized = stripAccents(token);
  const phrase = zonePhraseColors.find((entry) => stripAccents(entry.phrase) === normalized);
  return phrase ? phrase.color : null;
}

export function zoneTextColor(color: string): string {
  return zoneTextColors[color] || "#FFFFFF";
}
