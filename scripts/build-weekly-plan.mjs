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
// Las sesiones AEI (tandas 4 y 5) sí se sirven en el orden del entrenador: sus 32
// sesiones por nivel ya son una progresión (series de FC -> interválico corto y medio ->
// series largas -> repeticiones -> series cortas -> distancias descendentes -> todas las
// zonas). Cada mesociclo toma su tramo de esa progresión; ver CALIDAD_STAGES.
//
// Uso:
//   node scripts/build-weekly-plan.mjs                -> plan + cobertura (no escribe)
//   node scripts/build-weekly-plan.mjs --sql          -> SQL idempotente para Supabase
//   node scripts/build-weekly-plan.mjs --sql --json   -> además, las filas en .dev-logs/plan-semanal.json
//   node scripts/build-weekly-plan.mjs --weeks 8      -> horizonte (por defecto 12)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { translatePlain } from "../src/content/content-i18n.mjs";

const ROOT = process.cwd();
const catalog = JSON.parse(readFileSync(join(ROOT, "src/content/session-catalog.json"), "utf8")).sessions;
const dictionaries = {
  en: JSON.parse(readFileSync(join(ROOT, "src/content/i18n/en.json"), "utf8")),
  pt: JSON.parse(readFileSync(join(ROOT, "src/content/i18n/pt.json"), "utf8"))
};
const wArg = process.argv.indexOf("--weeks");
const WEEKS = wArg > -1 && process.argv[wArg + 1] ? Number(process.argv[wArg + 1]) : 12;
const EMIT_SQL = process.argv.includes("--sql");
const EMIT_JSON = process.argv.includes("--json"); // filas para cargar con supabase-js

const BASE_MONDAY = "2026-01-05"; // lunes ancla; el portal desplaza según el alta del cliente
const START_WEEK = 3; // semanas 1-2 = onboarding
const LEVELS = ["principiante", "intermedio", "avanzado"];

const isDeload = (w) => w % 4 === 0; // 4.ª semana de cada mesociclo
const mesocycleOf = (w) => Math.ceil(w / 4);
const phaseOf = (w) => (isDeload(w) ? "descarga" : ["introduccion", "carga", "pico"][(w - 1) % 4]);

/** Número de sesión que puso el entrenador ("Sesión 12 AEI…"): su orden de progresión. */
const coachNumber = (s) => Number(s.title.match(/sesi[oó]n\s+(\d+)/i)?.[1] ?? Infinity);
const byCoachOrder = (a, b) => coachNumber(a) - coachNumber(b) || (a.volumeM ?? 0) - (b.volumeM ?? 0);
const byVolumeAsc = (a, b) => (a.volumeM ?? 9e9) - (b.volumeM ?? 9e9);

/**
 * Miércoles de calidad: un método por semana de carga, por mesociclo. El primer bloque
 * entra en AEI guiado por pulsaciones y con distancias cortas; el segundo sube a
 * distancias medias, repeticiones y series cortas; el tercero cierra con series cortas
 * y distancias descendentes, lo más exigente. Dentro de cada método, la sesión de menor
 * número que quede libre. Más allá del tercer mesociclo se repite el último tramo.
 */
const CALIDAD_STAGES = [
  ["series-fc", "intervalico-intensivo", "intervalico-intensivo"],
  ["intervalico-intensivo", "repeticiones", "series-cortas"],
  ["series-cortas", "intervalico-descendente", "intervalico-descendente"]
];
const CALIDAD_FALLBACK = ["intervalico-intensivo", "intervalico-descendente", "series-cortas", "repeticiones", "series-fc", "cambios-ritmo"];

/**
 * Sábado de volumen según la fase. Introducción y descarga en AEM (fartlek, continuo
 * intensivo); en carga y pico las series largas AEI, que son el trabajo de volumen a
 * ritmo de prueba. El principiante solo las hace en el pico: dos días AEI por semana
 * desde el inicio es demasiado para quien acaba de entrar en esa zona. El último pico
 * del plan termina con la sesión que combina todas las zonas.
 */
function volumenMethods(level, phase, isLastPeak) {
  if (isLastPeak) return ["combinada", "series-largas", "fartlek", "continuo-intensivo"];
  if (phase === "pico") return ["series-largas", "fartlek", "continuo-intensivo"];
  if (phase === "carga" && level !== "principiante") return ["series-largas", "fartlek", "continuo-intensivo"];
  return ["fartlek", "continuo-intensivo"];
}

/** Los cuatro papeles de la semana. */
const SLOTS = [
  {
    key: "tecnica",
    day: 1,
    // El lunes es día de reconstruir técnica, no de acumular: AEL primero, y dentro de
    // AEL las que más trabajo técnico traen. El interválico extensivo es el respaldo
    // para que doce semanas no repitan sesión.
    methods: () => ["continuo-extensivo", "fraccionamiento-largo", "tecnica-snorkel", "intervalico-extensivo"],
    accepts: (s) => s.zone !== "AEI",
    pick: (a, b) =>
      (b.zone === "AEL") - (a.zone === "AEL") || b.techLoad - a.techLoad || byVolumeAsc(a, b)
  },
  {
    key: "calidad",
    day: 3,
    methods: () => CALIDAD_FALLBACK,
    accepts: () => true,
    // AEI antes que AEM: algún interválico intensivo de las tandas AEM tiene número bajo
    // y, solo por orden, se colaría en el primer bloque.
    pick: (a, b) => (b.zone === "AEI") - (a.zone === "AEI") || byCoachOrder(a, b)
  },
  {
    key: "acondicionamiento",
    day: 5,
    // Sin interválico extensivo: es el respaldo del lunes y el principiante no tiene de sobra.
    methods: () => ["fuerza-resistencia", "escalera", "cambios-ritmo"],
    accepts: (s) => s.zone !== "AEI",
    // Prioriza lo que usa material: palas, pull y tabla son el estímulo de fuerza.
    pick: (a, b) => b.gear.length - a.gear.length || (a.volumeM ?? 0) - (b.volumeM ?? 0)
  },
  {
    key: "volumen",
    day: 6,
    methods: (level, phase, isLastPeak) => volumenMethods(level, phase, isLastPeak),
    accepts: () => true,
    pick: (a, b) => byCoachOrder(a, b)
  }
];

const poolFor = (level) => catalog.filter((s) => (s.level === level || s.level === "todos") && !s.isTest);

/**
 * Tres tests por nivel, uno por descarga: el genérico de referencia en el primer
 * mesociclo y los dos propios del nivel después.
 *
 * `training_sessions.source_key` es único en toda la tabla, así que un test genérico
 * solo puede servirlo un nivel. Velocidad crítica para principiante (200m) e intermedio
 * (400m y 200m), que es de donde salen los ritmos AEI de sus sesiones; el avanzado ya
 * los mide con su test VO2max y gana más con la referencia de velocidad del 100m.
 */
const GENERIC_TEST = {
  principiante: "test-de-rendimiento-en-piscina-test-de-velocidad-critica-test-velocidad-critica-200m",
  intermedio: "test-de-rendimiento-en-piscina-test-de-velocidad-critica-test-velocidad-critica-400m-y-200m",
  avanzado: "test-de-rendimiento-en-piscina-test-100m-test-100m-crol"
};
const testsFor = (level) => {
  const generic = catalog.find((s) => s.id === GENERIC_TEST[level]);
  // Primero la serie de 50m del nivel, después el test VO2max, el más exigente.
  const own = catalog
    .filter((s) => s.isTest && s.level === level)
    .sort((a, b) => /vo2max/i.test(a.title) - /vo2max/i.test(b.title));
  return [generic, ...own].filter(Boolean);
};

function buildLevel(level) {
  const pool = poolFor(level);
  const tests = testsFor(level);
  const used = new Set();
  const rows = [];
  const lastPeak = Math.max(...Array.from({ length: WEEKS }, (_, i) => i + 1).filter((w) => phaseOf(w) === "pico"));

  const candidates = (slot, methods) =>
    pool.filter((s) => methods.includes(s.method) && slot.accepts(s) && !used.has(s.id));
  // El primer método de la lista que tenga sesión libre gana; dentro de él decide `pick`.
  const takeOne = (slot, methods, order = slot.pick) => {
    for (const method of methods) {
      const found = candidates(slot, [method]).sort(order)[0];
      if (found) {
        used.add(found.id);
        return found;
      }
    }
    return null;
  };
  // Todos los métodos compiten a la vez y decide el orden: para los slots cuyo criterio
  // es la zona o el material, no el método.
  const takeBest = (slot, methods, order = slot.pick) => {
    const found = candidates(slot, methods).sort(order)[0] ?? null;
    if (found) used.add(found.id);
    return found;
  };

  for (let m = 1; m <= Math.ceil(WEEKS / 4); m++) {
    const weeks = [1, 2, 3, 4].map((i) => (m - 1) * 4 + i).filter((w) => w <= WEEKS);

    for (const slot of SLOTS) {
      const loadWeeks = weeks.filter((w) => !isDeload(w));

      for (const w of weeks.filter(isDeload)) {
        // Descarga: el día de calidad se sustituye por un test — cierra el mesociclo
        // midiendo en vez de acumulando, que es lo que hace comparables los bloques.
        if (slot.key === "calidad") {
          rows.push({ week: w, day: slot.day, slot: "test", session: tests[m - 1] ?? null });
          continue;
        }
        // El resto de días, la sesión más corta libre en el papel del slot. Se elige antes
        // que las de carga para que la descarga no se quede con lo que sobra.
        rows.push({ week: w, day: slot.day, slot: slot.key, session: takeBest(slot, slot.methods(level, "descarga", false), byVolumeAsc) });
      }

      let picks;

      if (slot.key === "calidad") {
        const stage = CALIDAD_STAGES[Math.min(m, CALIDAD_STAGES.length) - 1];
        picks = loadWeeks.map((_, i) => takeOne(slot, [stage[i], ...CALIDAD_FALLBACK]));
      } else if (slot.key === "volumen") {
        picks = loadWeeks.map((w) => takeOne(slot, slot.methods(level, phaseOf(w), w === lastPeak)));
      } else {
        // Técnica y acondicionamiento: el mismo papel las tres semanas, así que se eligen
        // juntas y se reparten de menor a mayor volumen. La progresión del bloque 3:1
        // queda garantizada por construcción, no por suerte.
        const methods = slot.methods();
        picks = loadWeeks
          .map(() => takeBest(slot, methods))
          .sort((a, b) => (a?.volumeM ?? 0) - (b?.volumeM ?? 0));
      }
      loadWeeks.forEach((w, i) => rows.push({ week: w, day: slot.day, slot: slot.key, session: picks[i] ?? null }));
    }
  }
  return rows.sort((a, b) => a.week - b.week || a.day - b.day);
}

// --- Textos del portal en los tres idiomas ------------------------------------------

const SLOT_LABELS = {
  tecnica: { es: "Técnica y base aeróbica", en: "Technique and aerobic base", pt: "Técnica e base aeróbia" },
  calidad: { es: "Calidad · aeróbico intensivo", en: "Quality · intensive aerobic", pt: "Qualidade · aeróbio intensivo" },
  acondicionamiento: { es: "Acondicionamiento / fuerza-resistencia", en: "Conditioning / strength endurance", pt: "Condicionamento / força-resistência" },
  volumen: { es: "Volumen / ritmo de prueba", en: "Volume / race pace", pt: "Volume / ritmo de prova" },
  test: { es: "Test de control", en: "Benchmark test", pt: "Teste de controlo" }
};
const METHOD_LABELS = {
  "continuo-extensivo": { es: "continuo extensivo", en: "extensive continuous", pt: "contínuo extensivo" },
  "continuo-intensivo": { es: "continuo intensivo", en: "intensive continuous", pt: "contínuo intensivo" },
  "fraccionamiento-largo": { es: "fraccionamiento de distancias largas", en: "long-distance breakdown", pt: "fracionamento de distâncias longas" },
  "tecnica-snorkel": { es: "técnica con tubo", en: "snorkel technique", pt: "técnica com tubo frontal" },
  "intervalico-extensivo": { es: "interválico extensivo", en: "extensive interval", pt: "intervalado extensivo" },
  "intervalico-intensivo": { es: "interválico intensivo", en: "intensive interval", pt: "intervalado intensivo" },
  "intervalico-descendente": { es: "interválico intensivo con distancias descendentes", en: "intensive interval with descending distances", pt: "intervalado intensivo com distâncias descendentes" },
  "series-fc": { es: "series de frecuencia cardiaca", en: "heart rate sets", pt: "séries de frequência cardíaca" },
  "series-largas": { es: "series largas", en: "long sets", pt: "séries longas" },
  "series-cortas": { es: "series de distancias cortas", en: "short-distance sets", pt: "séries de distâncias curtas" },
  repeticiones: { es: "repeticiones", en: "repetitions", pt: "repetições" },
  "cambios-ritmo": { es: "cambios de ritmo", en: "pace changes", pt: "mudanças de ritmo" },
  escalera: { es: "escalera", en: "ladder", pt: "escada" },
  fartlek: { es: "fartlek", en: "fartlek", pt: "fartlek" },
  "fuerza-resistencia": { es: "fuerza-resistencia", en: "strength endurance", pt: "força-resistência" },
  combinada: { es: "todas las zonas", en: "all zones", pt: "todas as zonas" },
  test: { es: "test", en: "test", pt: "teste" }
};
const PHASE_LABELS = {
  introduccion: { es: "introducción", en: "introduction", pt: "introdução" },
  carga: { es: "carga", en: "load", pt: "carga" },
  pico: { es: "pico", en: "peak", pt: "pico" },
  descarga: { es: "descarga", en: "deload", pt: "descarga" }
};
const ZONE_LABELS = { MIXTA: { es: "MIXTA", en: "MIXED", pt: "MISTA" } };

function localizedTexts(row) {
  const s = row.session;
  const method = s.isTest ? "test" : s.method;
  const out = { title: {}, body: {} };
  for (const locale of ["es", "en", "pt"]) {
    const title = locale === "es" ? s.title : translatePlain(s.title, dictionaries[locale], locale);
    if (!title) throw new Error(`Sin traducción (${locale}) del título "${s.title}": node scripts/i18n-extract.mjs`);
    out.title[locale] = title;
    out.body[locale] = [
      SLOT_LABELS[row.slot][locale],
      ZONE_LABELS[s.zone]?.[locale] ?? s.zone,
      METHOD_LABELS[method]?.[locale] ?? method,
      PHASE_LABELS[phaseOf(row.week)][locale]
    ].join(" · ");
  }
  return out;
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
    console.log("\n" + "=".repeat(86));
    console.log("NIVEL " + level.toUpperCase() + "  ·  " + WEEKS + " semanas x 4 sesiones = " + rows.length + " slots");
    console.log("=".repeat(86));
    for (let w = 1; w <= WEEKS; w++) {
      const week = rows.filter((r) => r.week === w);
      const vol = week.reduce((n, r) => n + (r.session?.volumeM || 0), 0);
      const aei = week.filter((r) => r.session?.zone === "AEI" && !r.session.isTest).length;
      console.log(
        "\n  Semana " + String(w).padStart(2) + " · mesociclo " + mesocycleOf(w) + " · " +
          phaseOf(w).padEnd(12) + " · volumen " + (vol ? (vol / 1000).toFixed(1) + " km" : "-") + " · AEI " + aei
      );
      for (const r of week) {
        const s = r.session;
        const meta = s ? s.zone + "/" + (s.isTest ? "test" : s.method) + (s.volumeM ? " " + s.volumeM + "m" : "") : "SIN CANDIDATO";
        console.log("    D" + r.day + " " + SLOT_LABELS[r.slot].es.padEnd(38) + (s ? s.title : "-").slice(0, 50).padEnd(52) + meta);
      }
    }
    const distinct = new Set(rows.filter((r) => r.session).map((r) => r.session.id)).size;
    const filled = rows.filter((r) => r.session).length;
    const aeiTotal = rows.filter((r) => r.session?.zone === "AEI" && !r.session.isTest).length;
    console.log(
      "\n  -> " + distinct + " sesiones distintas · " + (rows.length - filled) + " huecos · " +
        (filled - distinct) + " repeticiones · " + aeiTotal + " sesiones AEI"
    );
  }

  if (!EMIT_SQL) {
    console.log("\n(sin --sql no se genera SQL)\n");
    return;
  }

  // `training_sessions` tiene un índice único sobre `source_key`, así que una sesión
  // repetida no produce una fila de más: revienta el INSERT completo. Mejor fallar aquí,
  // con el duplicado señalado, que descubrirlo cuando Postgres rechaza la carga entera.
  const seen = new Map();
  const problems = [];
  for (const level of LEVELS) {
    for (const r of plans[level]) {
      if (!r.session) {
        problems.push(`hueco: semana ${r.week}, día ${r.day}, nivel ${level}`);
        continue;
      }
      const key = r.session.id;
      if (seen.has(key)) problems.push(`repetida: ${key}  (sem ${seen.get(key)} y sem ${r.week}, nivel ${level})`);
      else seen.set(key, r.week);
    }
  }
  if (problems.length) {
    console.error(`\n✗ ${problems.length} problema(s); source_key es único en Supabase y el plan no debe tener huecos:`);
    for (const d of problems) console.error("   - " + d);
    console.error("\nAmplía el catálogo del slot afectado o reduce --weeks.\n");
    process.exit(1);
  }

  const values = [];
  const records = [];
  for (const level of LEVELS) {
    for (const r of plans[level]) {
      const week = START_WEEK + r.week - 1;
      const date = addDays(BASE_MONDAY, (week - 1) * 7 + (r.day - 1));
      const method = r.session.isTest ? "test" : r.session.method;
      const tags = [
        "plan-semanal", "plan-week-" + week, "plan-day-" + r.day, "slot-" + r.slot,
        "mesociclo-" + mesocycleOf(r.week), phaseOf(r.week), level, method, r.session.zone.toLowerCase()
      ];
      const { title, body } = localizedTexts(r);
      records.push({
        source_key: r.session.id, program_slug: "entrenamiento", session_date: date, difficulty: level,
        title, body, tags, access_scope: "group", published: true
      });
      values.push(
        "  (" + sq(r.session.id) + ", 'entrenamiento', " + sq(date) + "::date, " + sq(level) + ", " +
          sq(JSON.stringify(title)) + "::jsonb, " + sq(JSON.stringify(body)) + "::jsonb, " +
          "array[" + tags.map(sq).join(",") + "], 'group', true)"
      );
    }
  }

  const sql = [
    "-- Plan semanal automatizado Best Swim · 4 sesiones/semana · " + WEEKS + " semanas · es/en/pt",
    "-- Generado por scripts/build-weekly-plan.mjs - idempotente y reversible.",
    "-- Reversion:  delete from training_sessions where 'plan-semanal' = any(tags);",
    "begin;",
    "",
    "-- Las completadas cuelgan de training_sessions con ON DELETE CASCADE: regenerar el",
    "-- plan borraría el progreso de los clientes. Si ya hay alguna, se aborta.",
    "do $$",
    "begin",
    "  if exists (",
    "    select 1 from training_session_completions c",
    "      join training_sessions ts on ts.id = c.training_session_id",
    "     where 'plan-semanal' = any(ts.tags)",
    "  ) then",
    "    raise exception 'Hay sesiones del plan semanal completadas por clientes: no se regenera.';",
    "  end if;",
    "end $$;",
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
    "insert into training_session_groups (training_session_id, group_id)",
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
  if (EMIT_JSON) writeFileSync(join(ROOT, ".dev-logs", "plan-semanal.json"), JSON.stringify(records, null, 1) + "\n");
  console.log("\n✓ SQL escrito en " + out + " (" + values.length + " sesiones)\n");
}

main();
