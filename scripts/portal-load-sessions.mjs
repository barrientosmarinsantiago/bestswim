// Genera el SQL (idempotente y reversible) para cargar las sesiones nuevas AEL/AEM
// en el portal (training_sessions + training_session_groups), programadas por semanas
// a partir de la semana 3 (tras las 2 semanas de onboarding), 3/semana (días 1,3,5),
// mapeadas al grupo de nivel por volumen (principiante/intermedio/avanzado).
//
// Uso:
//   node scripts/portal-load-sessions.mjs            -> resumen (dry-run, no escribe)
//   node scripts/portal-load-sessions.mjs --sql      -> imprime el SQL completo
//
// El SQL no se aplica desde aquí: se revisa y se ejecuta vía la herramienta de Supabase.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const json = JSON.parse(readFileSync(join(process.cwd(), "src/content/imported-content.json"), "utf8"));
const section = json.natacionSections.find((s) => s.id === "entrenamiento");

const SOURCE_PREFIX = "sesiones-de-entrenamiento-ae"; // ids de los grupos AEL/AEM nuevos
const BASE_MONDAY = "2026-01-05"; // lunes base; el portal recalcula la fecha real según el onboarding del cliente
const DAYS = [1, 3, 5]; // lun/mié/vie
const START_WEEK = 3; // semanas 1-2 = onboarding existente

function levelOf(group) {
  const t = group.title.toUpperCase();
  if (t.includes("PRINCIPIANTE")) return "principiante";
  if (t.includes("AVANZADO") && !t.includes("INTERMEDIO")) return "avanzado";
  if (t.includes("INTERMEDIO")) return "intermedio";
  return null;
}
function modalityOf(group) {
  return group.title.toUpperCase().includes("AEM") ? "aem" : "ael";
}
function sessionNumber(title) {
  const m = title.match(/sesi[oó]n\s+(\d+)/i) || title.match(/\b(\d+)\b/);
  return m ? Number(m[1]) : 999;
}
function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function sqlStr(s) {
  return "'" + String(s).replace(/'/g, "''") + "'";
}

// Agrupar por nivel (AEL primero, luego AEM; dentro, por nº de sesión)
const byLevel = { principiante: [], intermedio: [], avanzado: [] };
for (const group of section.groups) {
  const level = levelOf(group);
  if (!level || !group.id.startsWith(SOURCE_PREFIX)) continue;
  const modality = modalityOf(group);
  for (const doc of group.documents) {
    byLevel[level].push({ doc, modality, num: sessionNumber(doc.title) });
  }
}
for (const level of Object.keys(byLevel)) {
  byLevel[level].sort((a, b) => (a.modality === b.modality ? a.num - b.num : a.modality === "ael" ? -1 : 1));
}

// Construir filas programadas
const rows = [];
for (const level of ["principiante", "intermedio", "avanzado"]) {
  byLevel[level].forEach((item, i) => {
    const week = START_WEEK + Math.floor(i / DAYS.length);
    const day = DAYS[i % DAYS.length];
    const sessionDate = addDays(BASE_MONDAY, (week - 1) * 7 + (day - 1));
    rows.push({
      source_key: item.doc.id,
      level,
      modality: item.modality,
      week,
      day,
      session_date: sessionDate,
      title: item.doc.title,
      summary: item.doc.summary || item.doc.title
    });
  });
}

if (process.argv.includes("--sql")) {
  const values = rows
    .map((r) => {
      const tags = `array[${["onboarding", `onboarding-week-${r.week}`, `onboarding-day-${r.day}`, r.level, r.modality].map(sqlStr).join(",")}]`;
      const title = sqlStr(JSON.stringify({ es: r.title }));
      const body = sqlStr(JSON.stringify({ es: r.summary }));
      return `  (${sqlStr(r.source_key)}, 'entrenamiento', ${sqlStr(r.session_date)}::date, ${sqlStr(r.level)}, ${title}::jsonb, ${body}::jsonb, ${tags}, 'group', true)`;
    })
    .join(",\n");

  console.log(`begin;

-- 1) Limpieza idempotente de una carga previa (reversible: solo afecta a estas filas)
delete from training_session_groups
where training_session_id in (select id from training_sessions where source_key like '${SOURCE_PREFIX}%');
delete from training_sessions where source_key like '${SOURCE_PREFIX}%';

-- 2) Insertar las sesiones
insert into training_sessions
  (source_key, program_slug, session_date, difficulty, title, body, tags, access_scope, published)
values
${values};

-- 3) Asociar cada sesión a su grupo de nivel (nivel-principiante/intermedio/avanzado)
insert into training_session_groups (training_session_id, group_id)
select ts.id, cg.id
from training_sessions ts
join content_groups cg on cg.slug =
  case
    when ts.source_key like '%nivel-principiante%' then 'nivel-principiante'
    when ts.source_key like '%nivel-avanzado%'     then 'nivel-avanzado'
    when ts.source_key like '%nivel-intermedio%'   then 'nivel-intermedio'
  end
where ts.source_key like '${SOURCE_PREFIX}%';

commit;`);
} else {
  console.log("=== Plan de carga al portal (dry-run, sin escribir) ===\n");
  for (const level of ["principiante", "intermedio", "avanzado"]) {
    const r = rows.filter((x) => x.level === level);
    const weeks = r.length ? `semanas ${r[0].week}–${r[r.length - 1].week}` : "—";
    const ael = r.filter((x) => x.modality === "ael").length;
    const aem = r.filter((x) => x.modality === "aem").length;
    console.log(`• nivel-${level}: ${r.length} sesiones (AEL ${ael} + AEM ${aem}) → ${weeks}, 3/semana (lun/mié/vie)`);
  }
  console.log(`\nTOTAL: ${rows.length} sesiones a cargar.`);
  console.log("\nPrimeras 6 (orden de programación):");
  rows.slice(0, 6).forEach((r) =>
    console.log(`  sem${r.week} día${r.day} [${r.level}/${r.modality}] ${r.title}`)
  );
}
