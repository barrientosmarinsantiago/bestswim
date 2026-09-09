// Genera SQL idempotente para cargar los desafíos al portal (Supabase):
// content_groups (challenge) + training_sessions (sesiones) + asociaciones.
// Elimina los retos viejos (reto-7km/14km-estrecho/21km). source_key = id del
// documento importado (lo resuelve getPortalTrainingDocumentBySourceKey).
//
//   node scripts/portal-load-challenges.mjs --sql   -> imprime el SQL
//   node scripts/portal-load-challenges.mjs         -> resumen (dry-run)

import { readFileSync } from "node:fs";
import { join } from "node:path";

const j = JSON.parse(readFileSync(join(process.cwd(), "src/content/imported-content.json"), "utf8"));
const OLD = ["reto-7km", "reto-14km-estrecho", "reto-21km"];
const BASE_DATE = "2026-01-05";

function sqlStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
function levelKey(level) {
  const l = (level || "").toLowerCase();
  if (l.includes("avanzado")) return "avanzado";
  if (l.includes("intermedio")) return "intermedio";
  return "principiante";
}
function addDays(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

const rows = [];
let di = 0;
for (const c of j.challenges) {
  const lvl = levelKey(c.level);
  c.sessions.forEach((s) => {
    rows.push({
      source_key: s.id,
      program_slug: c.id,
      level: lvl,
      title: s.title,
      summary: s.summary || s.title,
      date: addDays(BASE_DATE, di++)
    });
  });
}

if (process.argv.includes("--sql")) {
  const groups = j.challenges
    .map((c) => `  (${sqlStr(c.id)}, 'challenge', ${sqlStr(JSON.stringify({ es: c.title }))}::jsonb)`)
    .join(",\n");

  const sessions = rows
    .map((r) => {
      const tags = `array['challenge', ${sqlStr(r.level)}, ${sqlStr(r.program_slug)}]`;
      return `  (${sqlStr(r.source_key)}, ${sqlStr(r.program_slug)}, ${sqlStr(r.date)}::date, ${sqlStr(r.level)}, ${sqlStr(JSON.stringify({ es: r.title }))}::jsonb, ${sqlStr(JSON.stringify({ es: r.summary }))}::jsonb, ${tags}, 'group', true)`;
    })
    .join(",\n");

  console.log(`begin;

-- 1) Eliminar retos antiguos (${OLD.join(", ")})
delete from training_session_groups where group_id in (select id from content_groups where slug in (${OLD.map(sqlStr).join(",")}));
delete from training_sessions where program_slug in (${OLD.map(sqlStr).join(",")});
delete from profile_content_groups where group_id in (select id from content_groups where slug in (${OLD.map(sqlStr).join(",")}));
delete from content_groups where slug in (${OLD.map(sqlStr).join(",")});

-- 2) Limpieza idempotente de una carga previa de los retos nuevos
delete from training_session_groups where training_session_id in (select id from training_sessions where source_key like 'reto-%-sesion-%');
delete from training_sessions where source_key like 'reto-%-sesion-%';

-- 3) Upsert de los grupos de desafío (group_type='challenge')
insert into content_groups (slug, group_type, name) values
${groups}
on conflict (slug) do update set group_type = excluded.group_type, name = excluded.name;

-- 4) Insertar las sesiones de los desafíos
insert into training_sessions
  (source_key, program_slug, session_date, difficulty, title, body, tags, access_scope, published)
values
${sessions};

-- 5) Asociar cada sesión a su grupo de desafío (program_slug = slug del grupo)
insert into training_session_groups (training_session_id, group_id)
select ts.id, cg.id
from training_sessions ts
join content_groups cg on cg.slug = ts.program_slug
where ts.source_key like 'reto-%-sesion-%';

commit;`);
} else {
  console.log("=== Carga de desafíos al portal (dry-run) ===\n");
  for (const c of j.challenges) {
    console.log(`• ${c.id}  [${levelKey(c.level)}]  sesiones=${c.sessions.length}`);
  }
  console.log(`\nTOTAL: ${j.challenges.length} grupos · ${rows.length} sesiones · elimina ${OLD.length} retos viejos`);
}
