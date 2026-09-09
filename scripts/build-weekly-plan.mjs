// Construye el plan semanal automatizado del portal: 4 sesiones/semana por nivel,
// intercalando técnica, calidad, acondicionamiento y volumen, con mesociclo 3:1
// (tres semanas de carga creciente + una de descarga que termina en test).
//
// Por qué por SLOTS y no por orden de fichero: las sesiones del entrenador vienen
// numeradas dentro de su método (todas las escaleras juntas, todos los fartlek juntos),
// así que servirlas en orden daría semanas enteras del mismo estímulo. El slot fija el
// PAPEL de cada día y el catálogo decide qué sesión lo cubre, que es lo que permite que
// la semana quede equilibrada sin que nadie tenga que montarla a mano.
//
// Uso:
//   node scripts/build-weekly-plan.mjs                -> plan + cobertura (no escribe)
//   node scripts/build-weekly-plan.mjs --sql          -> SQL idempotente para Supabase
//   node scripts/build-weekly-plan.mjs --weeks 12     -> horizonte (por defecto 8)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "src/content/session-catalog.json"), "utf8")).sessions;
const wArg = process.argv.indexOf("--weeks");
const WEEKS = wArg > -1 && process.argv[wArg + 1] ? Number(process.argv[wArg + 1]) : 8;
const EMIT_SQL = process.argv.includes("--sql");

const BASE_MONDAY = "2026-01-05"; // lunes ancla; el portal desplaza según el alta del cliente
const START_WEEK = 3; // semanas 1-2 = onboarding
const LEVELS = ["principiante", "intermedio", "avanzado"];

/** Los cuatro papeles de la semana. `pick` ordena a los candidatos: el primero gana. */
const SLOTS = [
  {
    key: "tecnica",
    day: 1,
    label: "Técnica y base aeróbica",
    methods: ["continuo-extensivo", "fraccionamiento-largo", "tecnica-snorkel"],
    // El lunes es día de reconstruir técnica, no de acumular: AEL primero (un continuo
    // extensivo en AEM ya es carga), y dentro de AEL las que más trabajo técnico traen.
    preferZone: "AEL",
    pick: (a, b) =>
      (b.zone === "AEL") - (a.zone === "AEL") || b.techLoad - a.techLoad || (a.volumeM ?? 9e9) - (b.volumeM ?? 9e9)
  },
  {
    key: "calidad",
    day: 3,
    label: "Calidad / umbral",
    methods: ["intervalico-intensivo", "intervalico-extensivo", "cambios-ritmo"],
    pick: (a, b) => b.intensity - a.intensity || (a.volumeM ?? 0) - (b.volumeM ?? 0)
  },
  {
    key: "acondicionamiento",
    day: 5,
    label: "Acondicionamiento / fuerza-resistencia",
    methods: ["fuerza-resistencia", "escalera"],
    // Prioriza lo que usa material: palas, pull y tabla son el estímulo de fuerza.
    pick: (a, b) => b.gear.length - a.gear.length || (a.volumeM ?? 0) - (b.volumeM ?? 0)
  },
  {
    key: "volumen",
    day: 6,
    label: "Volumen / ritmo de competición",
    methods: ["fartlek", "continuo-intensivo", "escalera"],
    pick: (a, b) => (b.volumeM ?? 0) - (a.volumeM ?? 0)
  }
];

const isDeload = (w) => w % 4 === 0; // 4.ª semana de cada mesociclo
const mesocycleOf = (w) => Math.ceil(w / 4);
const phaseOf = (w) => (isDeload(w) ? "descarga" : ["introduccion", "carga", "pico"][(w - 1) % 4]);

const poolFor = (level) => catalog.filter((s) => (s.level === level || s.level === "todos") && !s.isTest);
const testsFor = (level) => catalog.filter((s) => s.isTest && (s.level === level || s.level === "todos"));

/**
 * Se planifica por MESOCICLO completo, no semana a semana.
 *
 * Elegir la "mejor" sesión cada semana por separado da un volumen que sube y baja al
 * azar, y entonces el bloque 3:1 no significa nada: una semana de carga puede salir
 * más suave que la de introducción. Escogiendo las tres de golpe y repartiéndolas de
 * menor a mayor volumen, la progresión queda garantizada por construcción.
 */
function buildLevel(level) {
  const pool = poolFor(level);
  const tests = testsFor(level);
  const used = new Set();
  const rows = [];
  let testIdx = 0;

  const mesocycles = Math.ceil(WEEKS / 4);
  for (let m = 1; m <= mesocycles; m++) {
    const weeks = [1, 2, 3, 4].map((i) => (m - 1) * 4 + i).filter((w) => w <= WEEKS);
    const loadWeeks = weeks.filter((w) => !isDeload(w));
    const deloadWeeks = weeks.filter((w) => isDeload(w));

    for (const slot of SLOTS) {
      const take = (n) => {
        let cands = pool.filter((s) => slot.methods.includes(s.method) && !used.has(s.id));
        if (cands.length < n) {
          // Agotado el slot, se recicla SOLO ese slot: en periodización repetir un
          // bloque con más carga es correcto, y es mejor que dejar el día vacío.
          // Vaciar el `used` entero castigaría a los slots con material sin usar.
          for (const s of pool) if (slot.methods.includes(s.method)) used.delete(s.id);
          cands = pool.filter((s) => slot.methods.includes(s.method));
        }
        const picked = [...cands].sort(slot.pick).slice(0, n);
        for (const s of picked) used.add(s.id);
        return picked;
      };

      // Semanas de carga: progresión ascendente de volumen dentro del mesociclo.
      const load = take(loadWeeks.length).sort((a, b) => (a.volumeM ?? 0) - (b.volumeM ?? 0));
      loadWeeks.forEach((w, i) => {
        rows.push({
          week: w, day: slot.day, slot: slot.key, label: slot.label,
          session: load[i] ?? null, deload: false
        });
      });

      // Descarga: el día de calidad se sustituye por un test — cierra el mesociclo
      // midiendo en vez de acumulando, que es lo que hace comparables los bloques.
      for (const w of deloadWeeks) {
        if (slot.key === "calidad") {
          const t = tests.length ? tests[testIdx++ % tests.length] : null;
          rows.push({ week: w, day: slot.day, slot: "test", label: "Test de control", session: t, deload: true });
          continue;
        }
        const short = [...pool]
          .filter((s) => slot.methods.includes(s.method))
          .sort((a, b) => (a.volumeM ?? 9e9) - (b.volumeM ?? 9e9))[0] ?? null;
        rows.push({ week: w, day: slot.day, slot: slot.key, label: slot.label, session: short, deload: true });
      }
    }
  }
  return rows.sort((a, b) => a.week - b.week || a.day - b.day);
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const sq = (s) => "'" + String(s).replace(/'/g, "''") + "'";

function main() {
  const plans = Object.fromEntries(LEVELS.map((l) => [l, buildLevel(l)]));

  for (const level of LEVELS) {
    const rows = plans[level];
    console.log("\n" + "=".repeat(78));
    console.log("NIVEL " + level.toUpperCase() + "  ·  " + WEEKS + " semanas x 4 sesiones = " + rows.length + " slots");
    console.log("=".repeat(78));
    for (let w = 1; w <= WEEKS; w++) {
      const week = rows.filter((r) => r.week === w);
      const vol = week.reduce((n, r) => n + (r.session?.volumeM || 0), 0);
      console.log(
        "\n  Semana " + String(w).padStart(2) + " · mesociclo " + mesocycleOf(w) + " · " +
          phaseOf(w).padEnd(12) + " · volumen " + (vol ? (vol / 1000).toFixed(1) + " km" : "-")
      );
      for (const r of week) {
        const s = r.session;
        const meta = s ? s.zone + "/" + s.method + (s.volumeM ? " " + s.volumeM + "m" : "") : "SIN CANDIDATO";
        console.log("    D" + r.day + " " + r.label.padEnd(40) + (s ? s.title : "-").slice(0, 42).padEnd(44) + meta);
      }
    }
    const distinct = new Set(rows.filter((r) => r.session).map((r) => r.session.id)).size;
    const filled = rows.filter((r) => r.session).length;
    console.log(
      "\n  -> " + distinct + " sesiones distintas · " + (rows.length - filled) + " huecos · " +
        (filled - distinct) + " repeticiones"
    );
  }

  if (!EMIT_SQL) {
    console.log("\n(sin --sql no se genera SQL)\n");
    return;
  }

  const values = [];
  for (const level of LEVELS) {
    for (const r of plans[level]) {
      if (!r.session) continue;
      const week = START_WEEK + r.week - 1;
      const date = addDays(BASE_MONDAY, (week - 1) * 7 + (r.day - 1));
      const tags = [
        "plan-semanal", "plan-week-" + week, "plan-day-" + r.day, "slot-" + r.slot,
        "mesociclo-" + mesocycleOf(r.week), phaseOf(r.week), level,
        r.session.method, r.session.zone.toLowerCase()
      ];
      values.push(
        "  (" + sq(r.session.id) + ", 'entrenamiento', " + sq(date) + "::date, " + sq(level) + ", " +
          sq(JSON.stringify({ es: r.session.title })) + "::jsonb, " +
          sq(JSON.stringify({ es: r.label + " · " + r.session.zone + " · " + r.session.method })) + "::jsonb, " +
          "array[" + tags.map(sq).join(",") + "], 'group', true)"
      );
    }
  }

  const sql = [
    "-- Plan semanal automatizado Best Swim · 4 sesiones/semana · " + WEEKS + " semanas",
    "-- Generado por scripts/build-weekly-plan.mjs - idempotente y reversible.",
    "-- Reversion:  delete from training_sessions where 'plan-semanal' = any(tags);",
    "begin;",
    "",
    "delete from training_session_groups",
    " where training_session_id in (select id from training_sessions where 'plan-semanal' = any(tags));",
    "delete from training_sessions where 'plan-semanal' = any(tags);",
    "",
    "insert into training_sessions",
    "  (source_key, program_slug, session_date, difficulty, title, body, tags, access_scope, published)",
    "values",
    values.join(",\n") + ";",
    "",
    "-- Asocia cada sesion al grupo de su nivel",
    "insert into training_session_groups (training_session_id, content_group_id)",
    "select ts.id, cg.id",
    "  from training_sessions ts",
    "  join content_groups cg on cg.slug = 'nivel-' || ts.difficulty",
    " where 'plan-semanal' = any(ts.tags)",
    "on conflict do nothing;",
    "",
    "commit;",
    ""
  ].join("\n");

  mkdirSync(join(ROOT, ".dev-logs"), { recursive: true });
  const out = join(ROOT, ".dev-logs", "plan-semanal.sql");
  writeFileSync(out, sql);
  console.log("\n✓ SQL escrito en " + out + " (" + values.length + " sesiones)\n");
}

main();
