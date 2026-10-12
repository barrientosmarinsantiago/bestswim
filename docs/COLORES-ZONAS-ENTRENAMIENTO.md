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
| **Z1** | Aeróbico ligero | `AEL` · `Z1` · `ZONA 1` · `ZONA1` | `#0070C0` azul | blanco |
| **Z2** | Aeróbico medio | `AEM` · `Z2` · `ZONA 2` | `#92D050` verde | `#1F3D05` |
| **Z3** | Aeróbico intenso · pot. aeróbica · vel. crítica · VO2max | `AEI` · `PAE` · `CSS` · `VO2MAX` · `VO2 Max` · `Z3` · `ZONA 3` | `#F79646` naranja | `#4A1B0C` |
| **Z4** | Anaeróbico láctico | `anaeróbico láctico` · `Z4` · `ZONA 4` | `#C00000` rojo oscuro | blanco |
| **Z5** | Anaeróbico aláctico (vel. máxima) | `velocidad máxima` · `máxima velocidad` · `anaeróbico aláctico` · `sprint` · `Z5` · `ZONA 5` | `#EE0000` rojo | blanco |

Tanto los **códigos** (AEL/AEM/AEI/PAE/CSS/VO2MAX), las **zonas numéricas** (Z1–Z5 y "ZONA 1"–"ZONA 5", con o sin espacio, mayúsc/minúsc indiferente) como las **frases anaeróbicas** se colorean automáticamente como etiquetas sólidas, en cualquier pantalla y tanto en el tema oscuro como en el modo lectura claro.

> **Nota de consistencia:** los Word no usan siempre el mismo tono para la misma zona. Se toma
> como base **`ZONAS DE ENTRENAMIENTO.docx`**. Variantes encontradas en el material:
>
> | Zona | Oficial | Variantes en los Word |
> |---|---|---|
> | AEL | `#0070C0` | `#00B0F0` (tandas 1-3, `DEFINICIÓN ZONAS DE ENTRENAMIENTO.docx`) |
> | AEM | `#92D050` | `#00B050` (tandas 1-3) |
> | AEI/PAE | `#F79646` | `#FFC000` (`DEFINICIÓN…`, test velocidad crítica) · `#E97132` (tandas 4-5, naranja de Office 2023) |
>
> La web pinta siempre el oficial: las etiquetas de zona se colorean desde `zones.json`, y donde
> el contenido conserva el color del Word, `colorAliases` lleva la variante al oficial. Para
> cambiar la paleta, basta con los hex de `src/content/zones.json`.

## Normalización automática del contenido

[`scripts/lib/normalize-content.mjs`](../scripts/lib/normalize-content.mjs) corrige al importar
(lo llaman `import-sessions.mjs` e `import-challenges.mjs`) cuatro defectos de los Word.
`npm run content:normalize` lo aplica a todo el JSON.

1. **Cabeceras en tabla.** Una tabla de **una fila** con, como mucho, una celda con texto es una
   cabecera maquetada como tabla: pasa a ser una caja con solo el texto. Corrige las cabeceras con
   una segunda celda vacía, que en la web salían con una caja vacía al lado. Las tablas de varias
   filas no se tocan aunque tengan celdas vacías: son plantillas que rellena el nadador (test de
   cadencia con Tempo Trainer).
2. **Cabeceras de fase en un solo estilo.** `WARM UP`, `MAIN SET`, `COOL DOWN`, `PRE SET`,
   `TÉCNICA`, `CALENTAMIENTO`… seguidas de `:`, `(`, guion, cifra o nada van siempre en caja, se
   hayan maquetado en tabla, como párrafo o como título. Una frase que solo **empieza** por esa
   palabra ("Calentamiento basado en…") es texto. `Drill:` tampoco es fase: describe un ejercicio.
3. **Códigos de zona partidos.** Word corta el texto por formato, a veces en mitad de un código
   (`AE` + `L`, `V` + `O` + `2max`), y así salía sin color. Se recompone entero.
4. **Tonos fuera de paleta** (ver nota de consistencia).

## Reglas para escribir sesiones (para que se coloreen bien)

1. Usa los **códigos** para las zonas aeróbicas: `AEL`, `AEM`, `AEI`, `PAE`, `CSS`.
2. Para máxima intensidad usa **frases exactas**: `velocidad máxima`, `máxima velocidad`, `sprint`, `anaeróbico aláctico`, `anaeróbico láctico`.
3. **Evita** `velocidad` suelta: o es `velocidad máxima` (rojo), `velocidad crítica` → escribe `CSS` (naranja), o es ritmo suave (no se colorea).
4. **Evita** `VEL` abreviado: no se colorea. Usa la frase o el código.
5. ¿Nueva zona o sinónimo? Añádelo a `src/content/zones.json` (no toques el código): `phraseColors` para frases nuevas, `codeColors` para códigos nuevos. El render y la validación se actualizan solos.

## Rutina de validación (ejecutar ANTES de subir/actualizar sesiones)

```bash
npm run validate:content            # reporte (no bloquea)
npm run validate:content -- --strict   # falla si hay términos ambiguos o contenido sin normalizar
```

El reporte muestra:
- Cuántas veces aparece cada **código** y **frase** (y con qué color se pintará).
- **Términos ambiguos** a revisar (p. ej. `velocidad` sin tipo, `anaeróbico` sin tipo, `VEL`).
- **Normalización pendiente**: si queda algo de lo que corrige `content:normalize`.

**Ambiguo ≠ error**: muchos son prosa legítima ("a velocidad cómoda"). Revisa la lista y, si un caso
es una zona de intensidad, renómbralo a la frase/código exacto para que se coloree.

## Checklist de publicación de contenido

- [ ] Importar/actualizar las sesiones (Word → `src/content/imported-content.json`, o filas en Supabase).
- [ ] Ejecutar `npm run validate:content`: **0 pendientes de normalizar** y revisar el bloque de **ambiguos**.
- [ ] Renombrar a frase/código exacto los casos que sí sean intensidad.
- [ ] Abrir una sesión en el sitio y confirmar que las etiquetas de zona se ven con su color.
- [ ] (Opcional) En CI, usar `--strict` una vez el contenido esté limpio para mantenerlo consistente.
