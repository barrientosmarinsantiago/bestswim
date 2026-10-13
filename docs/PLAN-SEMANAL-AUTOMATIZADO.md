# Plan semanal automatizado — 4 sesiones/semana

Cómo el portal decide, sin intervención manual, qué cuatro sesiones ve cada cliente cada
semana. Generado por `scripts/build-weekly-plan.mjs` a partir de `session-catalog.json`,
que a su vez produce `scripts/analyze-sessions.mjs` leyendo el contenido importado.

```
.docx  ──import-sessions──▶  imported-content.json
                                   │
                        analyze-sessions ──▶  session-catalog.json   (nivel, zona, método,
                                   │                                  volumen, carga técnica)
                        build-weekly-plan ──▶  .dev-logs/plan-semanal.sql  ──▶ Supabase
                                   ▲
                 src/content/i18n/{en,pt}.json  (títulos del plan en inglés y portugués)
```

Horizonte: **12 semanas** (3 mesociclos) por nivel, 144 sesiones en total, sin huecos ni
repeticiones. Las sesiones AEI de las tandas 4 y 5 entran en el plan desde la primera
semana.

## Por qué por slots y no por orden de fichero

El entrenador numera las sesiones AEL y AEM **dentro de su método**: todas las escaleras
juntas, todos los fartlek juntos. Servirlas en ese orden daría semanas enteras del mismo
estímulo. Así que el día no lo elige el fichero: lo elige el **papel** que ese día cumple
en la semana. El slot fija el papel y el catálogo decide qué sesión lo cubre.

**La excepción son las sesiones AEI** (tandas 4 y 5): sus 32 sesiones por nivel sí son una
progresión del entrenador — series de FC (1-3) → interválico intensivo de distancias
cortas (4-6) y medias (7-10) → series largas (11-17) → repeticiones (18-20) → series
cortas (21-24) → distancias descendentes (25-30) → todas las zonas (32). El plan respeta
ese orden: dentro de cada método se sirve la sesión de menor número libre.

## Los cuatro slots de la semana

| Día | Slot | Papel | Métodos elegibles | Criterio |
|---|---|---|---|---|
| **Lunes** | `tecnica` | Técnica y base aeróbica | continuo-extensivo · fraccionamiento-largo · técnica-snorkel · interválico-extensivo (respaldo) | Nunca AEI. Zona **AEL** primero; a igualdad, mayor carga técnica; a igualdad, menor volumen |
| **Miércoles** | `calidad` | Calidad · aeróbico intensivo | un método AEI por semana según el mesociclo (tabla siguiente) | AEI antes que AEM; orden del entrenador |
| **Viernes** | `acondicionamiento` | Fuerza-resistencia | fuerza-resistencia · escalera · cambios de ritmo | Nunca AEI. Más material (palas/pull/tabla) |
| **Sábado** | `volumen` | Volumen / ritmo de prueba | según la fase (ver abajo) | Orden del entrenador |

**El lunes es AEL a propósito.** Tras el descanso del fin de semana la técnica se
reconstruye con carga baja. El interválico extensivo solo entra cuando se acaban los
continuos y fraccionados AEL, y por eso el viernes no lo usa: el principiante no tiene de
sobra.

### Miércoles: progresión AEI por mesociclo

| Mesociclo | Semana 1 | Semana 2 | Semana 3 | Qué busca |
|---|---|---|---|---|
| 1 | series de FC | interválico intensivo | interválico intensivo | Entrar en AEI guiado por pulsaciones, distancias cortas |
| 2 | interválico intensivo | repeticiones | series cortas | Subir a distancias medias y repeticiones largas |
| 3 | series cortas | distancias descendentes | distancias descendentes | Lo más exigente del bloque AEI |

### Sábado: volumen según la fase

| Fase | Principiante | Intermedio y avanzado |
|---|---|---|
| Introducción | fartlek / continuo intensivo (AEM) | fartlek / continuo intensivo (AEM) |
| Carga | fartlek / continuo intensivo (AEM) | **series largas AEI** |
| Pico | **series largas AEI** | **series largas AEI** |
| Último pico del plan | **todas las zonas** (sesión 32) | **todas las zonas** (sesión 32) |
| Descarga | la más corta de fartlek / continuo intensivo | ídem |

Así el principiante hace **un** día AEI por semana y dos solo en el pico; intermedio y
avanzado hacen dos días AEI en carga y pico. Total del plan: 11 sesiones AEI en
principiante, 14 en intermedio y avanzado (más los tests).

## Mesociclo 3:1

| Semana | Fase | Qué cambia |
|---|---|---|
| 1 | `introduccion` | Técnica y acondicionamiento: el menor volumen de los tres elegidos |
| 2 | `carga` | El intermedio |
| 3 | `pico` | El mayor |
| 4 | `descarga` | La sesión más corta libre de cada slot, y **el miércoles se sustituye por un TEST** |

En técnica y acondicionamiento las tres sesiones de carga **se eligen de golpe y se
reparten de menor a mayor volumen**, así la progresión del bloque está garantizada por
construcción. La descarga se elige **antes** que las semanas de carga, para que no se quede
con lo que sobra.

### Tests (uno por descarga)

`training_sessions.source_key` es único en toda la tabla, así que cada test genérico solo
puede servirlo un nivel:

| Nivel | Semana 4 | Semana 8 | Semana 12 |
|---|---|---|---|
| Principiante | Velocidad crítica 200 m | 8x50 m | Rendimiento VO2max |
| Intermedio | Velocidad crítica 400 + 200 m | 10x50 m | Rendimiento VO2max |
| Avanzado | 100 m crol | 20x50 + 14x50 m | Rendimiento VO2max |

Velocidad crítica en principiante e intermedio porque de ahí salen los ritmos AEI de sus
sesiones ("ritmo obtenido en tu test de 400 m"); el avanzado ya los mide con su test
VO2max y gana más con la referencia de velocidad del 100 m.

## Volumen resultante (km por semana)

Aproximado: algunas sesiones del catálogo no declaran volumen y cuentan como 0.

| Semana | Fase | Principiante | Intermedio | Avanzado |
|---|---|---|---|---|
| 1 | introducción | 6,0 | 11,2 | 18,6 |
| 2 | carga | 6,5 | 12,3 | 19,6 |
| 3 | pico | 6,8 | 13,2 | 21,1 |
| 4 | **descarga + test** | 2,6 | 5,5 | 7,6 |
| 5 | introducción | 6,5 | 13,7 | 19,7 |
| 6 | carga | 6,6 | 14,7 | 19,5 |
| 7 | pico | 6,6 | 14,5 | 20,9 |
| 8 | **descarga + test** | 4,1 | 9,6 | 13,4 |
| 9 | introducción | 6,5 | 12,9 | 19,7 |
| 10 | carga | 5,4 | 12,8 | 18,4 |
| 11 | pico | 6,8 | 13,9 | 21,1 |
| 12 | **descarga + test** | 5,7 | 9,2 | 12,2 |

48 sesiones distintas por nivel, **0 huecos, 0 repeticiones**. El generador aborta con el
`--sql` si aparece cualquiera de las dos cosas.

## En el portal

Las fechas de `training_sessions` del plan son solo de referencia (semana ancla
2026-01-05). El portal (`resolveOnboardingSessionDate` en
`src/components/portal/portal-utils.ts`) las recoloca sobre la semana de alta de cada
cliente: semanas 1-2 de onboarding, el plan desde la 3 (`plan-week-3`). Acabadas las 12
semanas el plan vuelve a empezar, para que nunca falten sesiones. Se muestran las cuatro
de la semana.

Títulos y descripción van en `title`/`body` (jsonb `es`/`en`/`pt`); el contenido completo de
cada sesión se traduce al vuelo con los diccionarios de `src/content/i18n/`.

## Reversibilidad

```sql
-- Deshacer la carga completa del plan
delete from training_session_groups
 where training_session_id in (select id from training_sessions where 'plan-semanal' = any(tags));
delete from training_sessions where 'plan-semanal' = any(tags);
```

El SQL generado aborta si algún cliente ya ha completado sesiones del plan: las
completadas cuelgan con `ON DELETE CASCADE` y regenerar borraría su progreso.

Cada sesión lleva las etiquetas `plan-semanal`, `plan-week-N`, `plan-day-M`,
`slot-<slot>`, `mesociclo-N`, la fase, el nivel, el método y la zona.

## Regenerar

```bash
node scripts/import-sessions.mjs          # .docx -> imported-content.json
node scripts/analyze-sessions.mjs --json  # -> session-catalog.json
node scripts/i18n-extract.mjs             # textos sin traducir (deben ser 0)
node scripts/build-weekly-plan.mjs        # revisar el plan por consola
node scripts/build-weekly-plan.mjs --sql  # -> .dev-logs/plan-semanal.sql
```

`--weeks N` cambia el horizonte; `--json` además deja las filas en
`.dev-logs/plan-semanal.json`. El SQL se aplica con el SQL Editor de Supabase: el rol
`service_role` no tiene permisos de escritura en estas tablas a propósito.

## Traducciones del contenido

`src/content/content-i18n.mjs` traduce por diccionario conservando negritas y colores, y
escribe las cifras a la manera de cada idioma ("4.500m" → "4,500m" en inglés). Con
contenido nuevo:

```bash
node scripts/i18n-extract.mjs --chunks 120   # .dev-logs/i18n/pending-NNN.json
# traducir a .dev-logs/i18n/en-NNN.json y pt-NNN.json (mismo orden, mismas marcas ⟨n⟩ ⟦n⟧)
node scripts/i18n-merge.mjs                   # valida y fusiona en src/content/i18n/
```

Un texto sin traducción se muestra en español.
