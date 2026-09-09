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
```

## Por qué por slots y no por orden de fichero

El entrenador numera las sesiones **dentro de su método**: todas las escaleras juntas,
todos los fartlek juntos. Servirlas en ese orden daría semanas enteras del mismo estímulo
— siete escaleras seguidas — que es justo lo contrario de lo que pide un plan.

Así que el día no lo elige el fichero: lo elige el **papel** que ese día cumple en la
semana. El slot fija el papel y el catálogo decide qué sesión lo cubre.

## Los cuatro slots de la semana

| Día | Slot | Papel | Métodos elegibles | Criterio de selección |
|---|---|---|---|---|
| **Lunes** | `tecnica` | Técnica y base aeróbica | continuo-extensivo · fraccionamiento-largo · técnica-snorkel | Zona **AEL** primero; a igualdad, mayor carga técnica; a igualdad, menor volumen |
| **Miércoles** | `calidad` | Calidad / umbral | interválico-intensivo · interválico-extensivo · cambios-ritmo | Mayor intensidad; a igualdad, menor volumen |
| **Viernes** | `acondicionamiento` | Fuerza-resistencia | fuerza-resistencia · escalera | Más material (palas/pull/tabla); a igualdad, menor volumen |
| **Sábado** | `volumen` | Volumen / ritmo de competición | fartlek · continuo-intensivo · escalera | Mayor volumen |

**El lunes es AEL a propósito.** Tras el descanso del fin de semana la técnica se
reconstruye con carga baja; un continuo extensivo en AEM ya es carga y no cumple ese papel.

**El viernes prioriza material** porque palas, pull y tabla son el estímulo de
fuerza-resistencia: sin ellos una escalera es solo volumen fraccionado.

## Mesociclo 3:1

Cada bloque de cuatro semanas es tres de carga creciente más una de descarga:

| Semana | Fase | Carga | Qué cambia |
|---|---|---|---|
| 1 | `introduccion` | ↑ | El menor volumen de los tres candidatos del slot |
| 2 | `carga` | ↑↑ | El intermedio |
| 3 | `pico` | ↑↑↑ | El mayor |
| 4 | `descarga` | ↓↓ | Volumen mínimo de cada slot, y **el miércoles se sustituye por un TEST** |

Las tres sesiones de carga de cada slot **se eligen de golpe y se reparten de menor a
mayor volumen**. Si se eligiera "la mejor" cada semana por separado, el volumen subiría y
bajaría al azar y el 3:1 no significaría nada: una semana de carga podría salir más suave
que la de introducción.

La descarga termina en test porque cierra el mesociclo **midiendo en vez de acumulando**,
que es lo que hace comparables los bloques entre sí. Los tests rotan entre los cuatro
disponibles (100 m, cadencia con tempo trainer, velocidad crítica 200 m, velocidad crítica
400 + 200 m), coherente con la recomendación del propio material de repetir cada 6-8
semanas.

## Volumen resultante (horizonte de 8 semanas)

| Semana | Fase | Principiante | Intermedio | Avanzado |
|---|---|---|---|---|
| 1 | introducción | 5,0 km | 11,3 km | 15,8 km |
| 2 | carga | 6,5 km | 11,4 km | 18,8 km |
| 3 | pico | 7,0 km | 13,1 km | 20,8 km |
| 4 | **descarga + test** | 2,6 km | 5,5 km | 7,6 km |
| 5 | introducción | 6,1 km | 12,6 km | 18,9 km |
| 6 | carga | 6,6 km | 13,4 km | 19,8 km |
| 7 | pico | 7,2 km | 15,1 km | 20,2 km |
| 8 | **descarga + test** | 2,6 km | 5,5 km | 7,6 km |

27 sesiones distintas por nivel, **0 huecos**, 5 repeticiones (todas en semanas de
descarga, donde repetir una sesión ligera y conocida es lo correcto).

## Material disponible por slot

Es lo que fija el horizonte antes de que el plan tenga que reciclar:

| Slot | Principiante | Intermedio | Avanzado |
|---|---|---|---|
| tecnica | 9 | 26 | 9 |
| calidad | 7 | 14 | 14 |
| acondicionamiento | 11 | 21 | 16 |
| volumen | 21 | 29 | 26 |
| *tests* | *6* | *6* | *6* |

`escalera` cuenta en `acondicionamiento` y en `volumen`: es el método más versátil del
catálogo y sirve a los dos papeles según lleve o no material.

El slot más escaso marca cuántas **semanas de carga** se sostienen sin repetir. Como la
4.ª semana de cada mesociclo cambia el día de calidad por un test, ese slot solo se
consume tres veces cada cuatro semanas:

| Nivel | Slot limitante | Semanas de carga | Equivale a |
|---|---|---|---|
| Principiante | calidad (7) | 7 | ~9 semanas de calendario |
| Intermedio | calidad (14) | 14 | ~18 semanas |
| Avanzado | tecnica (9) | 9 | 12 semanas |

Con el horizonte de 8 semanas ninguno recicla por agotamiento del slot; las 5
repeticiones que reporta el generador son las de las semanas de descarga.

**Si se quiere ampliar el horizonte**, lo que más rinde es añadir sesiones de *calidad*
(interválico) en principiante y de *técnica* (continuo extensivo en AEL) en avanzado —
que son los dos cuellos de botella reales.

## Reciclado

Agotado un slot, se recicla **solo ese slot**, no el catálogo entero: vaciar el histórico
completo castigaría a los slots que aún tenían material sin usar. Repetir un bloque con
más carga es, además, lo que hace la periodización clásica.

## Reversibilidad

```sql
-- Deshacer la carga completa del plan
delete from training_session_groups
 where training_session_id in (select id from training_sessions where 'plan-semanal' = any(tags));
delete from training_sessions where 'plan-semanal' = any(tags);
```

Cada sesión cargada lleva las etiquetas `plan-semanal`, `plan-week-N`, `plan-day-M`,
`slot-<slot>`, `mesociclo-N`, la fase, el nivel, el método y la zona, así que el portal
puede filtrar por cualquiera de esos ejes sin volver a leer el `.docx`.

## Regenerar

```bash
node scripts/import-sessions.mjs          # .docx -> imported-content.json
node scripts/analyze-sessions.mjs --json  # -> session-catalog.json
node scripts/build-weekly-plan.mjs        # revisar el plan por consola
node scripts/build-weekly-plan.mjs --sql  # -> .dev-logs/plan-semanal.sql
```

Para un horizonte distinto: `node scripts/build-weekly-plan.mjs --weeks 12 --sql`.
