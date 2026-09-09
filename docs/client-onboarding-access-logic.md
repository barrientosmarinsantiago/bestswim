# Logica de onboarding y acceso de clientes

Fecha de configuracion: 2026-06-08

## Alcance aplicado

- El selector publico del portal cliente queda limitado a `Free 15 dias`, `Premium mensual` y `Premium anual`.
- Body Factory deja de ser una opcion elegible por el cliente. El permiso sigue siendo administrable en Supabase mediante `profiles.body_factory_student`.
- En el primer acceso autenticado, el portal muestra un cuestionario obligatorio de una sola respuesta por pregunta. Si el objetivo es competitivo, aparece una tercera pregunta condicional.
- La asignacion automatica guarda las respuestas en `profiles` y activa membresias en `profile_content_groups`.
- Si el cliente edita el cuestionario desde el portal, la API recalibra el plan: activa los nuevos grupos y marca como `revoked` los grupos automaticos de onboarding que ya no correspondan.
- Las semanas se calculan de lunes a domingo. Las sesiones de onboarding usan plantillas de semana 1 y semana 2, y el portal recalcula sus fechas desde `profiles.onboarding_completed_at`.
- En el plan semanal del portal solo se muestran hasta 3 sesiones de la semana activa. El filtro usa el rango lunes-domingo actual y no muestra fechas individuales por sesion, solo el rango de semana.
- Los retos se muestran fuera del plan semanal, bajo `Desafios`, y permanecen visibles hasta que el cliente marque todas sus sesiones como completadas.
- El dashboard ya usa `training_session_completions` cuando existen, por lo que el conteo semanal, mensual, anual y de retos completados queda preparado para reporting interactivo.
- La landing usa `/api/public/best-swimmers` para mostrar el contador `Best Swimmers`, calculado con Free activo y Premium activo/trialing sin exponer datos personales.
- El portal incluye dashboards privados de rendimiento para `Ritmo /100m`, `Test 200m` y `Test 400m`. Las mediciones viven en `client_performance_metrics`, con RLS para que cada cliente solo consulte y modifique sus propias filas.

## Cuestionario inicial

Pregunta 1: `Cual es tu nivel de natacion?`

- No se nadar
- Principiante
- Intermedio
- Intermedio-Avanzado
- Avanzado

Pregunta 2: `Que objetivo tienes planteado?`

- Aprendizaje y salud
- Preparacion competitiva

Pregunta 3, solo si la respuesta anterior es `Preparacion competitiva`: `Que prueba tienes como objetivo?`

- Triatlon sprint u olimpico
- Ironman o Ironman 70.3
- Oceanman 5K o Oceanman 10K

## Matriz configurada

| Nivel | Objetivo | Grupo asignado | Reto asignado |
| --- | --- | --- | --- |
| No se nadar | Aprendizaje y salud | Principiante | Desafio 7K |
| No se nadar | Preparacion competitiva + Triatlon/Ironman | Premium_Triatlon | Desafio 14K Estrecho |
| No se nadar | Preparacion competitiva + Oceanman | Premium_Oceanman5k + oceanman-5k | Desafio 14K Estrecho |
| Principiante | Aprendizaje y salud | Principiante | Desafio 7K |
| Principiante | Preparacion competitiva + Triatlon/Ironman | Premium_Triatlon | Desafio 14K Estrecho |
| Principiante | Preparacion competitiva + Oceanman | Premium_Oceanman5k + oceanman-5k | Desafio 14K Estrecho |
| Intermedio | Aprendizaje y salud | Intermedio | Desafio 14K Estrecho |
| Intermedio | Preparacion competitiva + Triatlon/Ironman | Premium_Triatlon | Desafio 14K Estrecho |
| Intermedio | Preparacion competitiva + Oceanman | Premium_Oceanman5k + oceanman-5k | Desafio 14K Estrecho |
| Intermedio-Avanzado | Aprendizaje y salud | Intermedio-Avanzado | Desafio 14K Estrecho |
| Intermedio-Avanzado | Preparacion competitiva + Triatlon/Ironman | Premium_Triatlon | Desafio 14K Estrecho |
| Intermedio-Avanzado | Preparacion competitiva + Oceanman | Premium_Oceanman5k + oceanman-5k | Desafio 14K Estrecho |
| Avanzado | Aprendizaje y salud | Avanzado | Desafio 21K |
| Avanzado | Preparacion competitiva + Triatlon/Ironman | Premium_Triatlon | Desafio 14K Estrecho |
| Avanzado | Preparacion competitiva + Oceanman | Premium_Oceanman10k + oceanman-5k | Desafio 14K Estrecho |

## Sesiones iniciales por grupo

Principiante:

- Semana 1: tres sesiones placeholder de Tecnica y Aprendizaje.
- Semana 2: siguientes tres sesiones placeholder de Tecnica y Aprendizaje.
- Reto persistente: Desafio 7K.

Intermedio:

- Semana 1: dos sesiones placeholder de Tecnica y Aprendizaje y una de Entrenamiento Intermedio.
- Semana 2: siguientes dos sesiones placeholder de Tecnica y Aprendizaje y una de Entrenamiento Intermedio.
- Reto persistente: Desafio 14K Estrecho.

Intermedio-Avanzado:

- Semana 1: tres sesiones placeholder de Entrenamiento Intermedio-Avanzado.
- Semana 2: siguientes tres sesiones placeholder de Entrenamiento Intermedio-Avanzado.
- Reto persistente: Desafio 14K Estrecho.

Avanzado:

- Semana 1: tres sesiones placeholder de Entrenamiento Avanzado.
- Semana 2: siguientes tres sesiones placeholder de Entrenamiento Avanzado.
- Reto persistente: Desafio 21K.

Oceanman 5K:

- Semana 1: tres sesiones placeholder competitivas Oceanman 5K.
- Semana 2: siguientes tres sesiones placeholder competitivas Oceanman 5K.
- Reto persistente: Desafio 14K Estrecho como asignacion temporal.

Triatlon / Ironman:

- Usa el grupo existente `Premium_Triatlon`, que ya contiene sesiones vinculadas.
- Reto persistente: Desafio 14K Estrecho.

Oceanman 10K:

- Se asigna `Premium_Oceanman10k` para segmentacion futura y tambien `oceanman-5k` para no dejar sin sesiones mientras se cargan sesiones especificas 10K.
- Reto persistente: Desafio 14K Estrecho.

## Drills multimedia

- El portal muestra tres drills en la columna derecha del dashboard, debajo de los indicadores.
- La rotacion usa bloques de tres drills por semana desde el onboarding del cliente.
- Ahora mismo la seccion multimedia solo tiene tres entradas, por lo que la rotacion repetira el mismo bloque hasta que se agreguen mas drills.

## Gaps identificados

- `No se nadar` no estaba mapeado en la matriz original. Se configuro provisionalmente como Principiante + Desafio 7K.
- Ironman / Ironman 70.3 usa por ahora el grupo `Premium_Triatlon`; queda pendiente separar un plan especifico si quieres cargas distintas.
- `Premium_Oceanman10k` existe, pero todavia no tiene sesiones vinculadas. Se asigna tambien `oceanman-5k` como plan provisional.
- Las sesiones reales de Tecnica, Entrenamiento Intermedio, Intermedio-Avanzado y Avanzado aun deben reemplazar placeholders cuando el contenido este listo.
- Si en el futuro quieres editar calendarios por usuario, convendra crear una tabla explicita de asignaciones por usuario. La version actual usa plantillas por grupo y recalculo de fechas en el portal.
