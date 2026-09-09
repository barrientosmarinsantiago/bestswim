# Colores de zonas de entrenamiento — lista de chequeo y validación

Referencia única para que **todas las sesiones** (Natación y subsecciones, Desafíos y el portal del
cliente, que comparten el mismo render) muestren los colores de intensidad de forma **consistente**.

- **Fuente única del mapeo:** [`src/content/zones.json`](../src/content/zones.json)
- **Helpers de render:** [`src/content/zones.ts`](../src/content/zones.ts) → usado por `src/components/content/rich-content.tsx`
- **Rutina de validación:** [`scripts/validate-sessions.mjs`](../scripts/validate-sessions.mjs) → `npm run validate:content`
- **Origen oficial de los colores:** `content-import/Natacion/Bases del entrenamiento/ZONAS DE ENTRENAMIENTO/ZONAS DE ENTRENAMIENTO.docx`

## Mapa de colores (oficial)

| Zona | Intensidad | Cómo se escribe en la sesión (todo se colorea) | Color | Texto |
|---|---|---|---|---|
| **Z1** | Aeróbico ligero | `AEL` · `Z1` · `ZONA 1` | `#0070C0` azul | blanco |
| **Z2** | Aeróbico medio | `AEM` · `Z2` · `ZONA 2` | `#92D050` verde | `#1F3D05` |
| **Z3** | Aeróbico intenso · pot. aeróbica · vel. crítica · VO2max | `AEI` · `PAE` · `CSS` · `VO2MAX` · `Z3` · `ZONA 3` | `#F79646` naranja | `#4A1B0C` |
| **Z4** | Anaeróbico láctico | `anaeróbico láctico` · `Z4` · `ZONA 4` | `#C00000` rojo oscuro | blanco |
| **Z5** | Anaeróbico aláctico (vel. máxima) | `velocidad máxima` · `máxima velocidad` · `anaeróbico aláctico` · `sprint` · `Z5` · `ZONA 5` | `#EE0000` rojo | blanco |

Tanto los **códigos** (AEL/AEM/AEI/PAE/CSS/VO2MAX), las **zonas numéricas** (Z1–Z5 y "ZONA 1"–"ZONA 5", mayúsc/minúsc indiferente) como las **frases anaeróbicas** se colorean automáticamente como etiquetas sólidas, en cualquier pantalla y tanto en el tema oscuro como en el modo lectura claro.

> **Nota de consistencia:** hay dos documentos de zonas. Se toma como base **`ZONAS DE ENTRENAMIENTO.docx`** (AEL=`#0070C0`, AEI=`#F79646`). El otro (`DEFINICIÓN ZONAS DE ENTRENAMIENTO.docx`) usa tonos distintos (AEL=`#00B0F0`, AEI=`#FFC000`); si en el futuro se prefiere ese, basta con cambiar los hex en `src/content/zones.json`.

## Reglas para escribir sesiones (para que se coloreen bien)

1. Usa los **códigos** para las zonas aeróbicas: `AEL`, `AEM`, `AEI`, `PAE`, `CSS`.
2. Para máxima intensidad usa **frases exactas**: `velocidad máxima`, `máxima velocidad`, `sprint`, `anaeróbico aláctico`, `anaeróbico láctico`.
3. **Evita** `velocidad` suelta: o es `velocidad máxima` (rojo), `velocidad crítica` → escribe `CSS` (naranja), o es ritmo suave (no se colorea).
4. **Evita** `VEL` abreviado: no se colorea. Usa la frase o el código.
5. ¿Nueva zona o sinónimo? Añádelo a `src/content/zones.json` (no toques el código): `phraseColors` para frases nuevas, `codeColors` para códigos nuevos. El render y la validación se actualizan solos.

## Rutina de validación (ejecutar ANTES de subir/actualizar sesiones)

```bash
npm run validate:content            # reporte (no bloquea)
npm run validate:content -- --strict   # falla si hay términos ambiguos (para CI / gate)
```

El reporte muestra:
- Cuántas veces aparece cada **código** y **frase** (y con qué color se pintará).
- **Términos ambiguos** a revisar (p. ej. `velocidad` sin tipo, `anaeróbico` sin tipo, `VEL`).

**Ambiguo ≠ error**: muchos son prosa legítima ("a velocidad cómoda"). Revisa la lista y, si un caso
es una zona de intensidad, renómbralo a la frase/código exacto para que se coloree.

## Checklist de publicación de contenido

- [ ] Importar/actualizar las sesiones (Word → `src/content/imported-content.json`, o filas en Supabase).
- [ ] Ejecutar `npm run validate:content` y revisar el bloque de **ambiguos**.
- [ ] Renombrar a frase/código exacto los casos que sí sean intensidad.
- [ ] Abrir una sesión en el sitio y confirmar que las etiquetas de zona se ven con su color.
- [ ] (Opcional) En CI, usar `--strict` una vez el contenido esté limpio para mantenerlo consistente.
