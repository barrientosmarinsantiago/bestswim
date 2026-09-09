# Propuestas de color para secciones de landing

Fecha: 2026-06-08
Estado: aplicado tras aprobacion.

## Referencia revisada

La landing de referencia usa un navy intenso combinado con bloques claros tipo crema/blanco, acentos turquesa y amarillo. En su CSS aparecen variables cercanas a:

- Navy principal: `hsl(213 70% 14%)`, aproximado `#0B203D`
- Navy footer: `hsl(213 71% 9%)`, aproximado `#071426`
- Crema claro: `hsl(38 38% 92%)`, aproximado `#F0EAE1`
- Turquesa Caribe: `hsl(181 62% 53%)`, aproximado `#42CBCD`
- Amarillo acento: `hsl(48 100% 62%)`, aproximado `#FFD93D`

Fuente visual revisada: https://dominicanrepublicwfc.mocha.app/

## Base actual Best Swim

El sistema actual ya tiene:

- `swim.navy`: `#020A18`
- `swim.ink`: `#061327`
- `swim.cobalt`: `#0D4BFF`
- `swim.cyan`: `#18D8FF`
- `swim.aqua`: `#7EF3FF`
- `swim.white`: `#F7FBFF`
- `swim.steel`: `#8CA4C5`

## Opcion recomendada

Alternancia sobria sin perder identidad:

| Uso | Color | Motivo |
| --- | --- | --- |
| Hero / secciones premium | `#020A18` | Mantiene la identidad navy actual. |
| Bandas profundas | `#061327` | Da contraste sin salir del mundo Best Swim. |
| Bandas claras | `#F7FBFF` | Limpia lectura y funciona con texto navy. |
| Bandas aqua suave | `#EAF8FB` | Se siente acuatico sin dominar en cian. |
| Acento puntual | `#18D8FF` | CTA, iconos y detalles. |
| Acento calido limitado | `#F4EFE7` | Alternativa tipo arena, solo para una banda o partners. |

Ejemplo de secuencia propuesta:

1. Hero: `#020A18`
2. Ticker / stats: `#061327`
3. Programas: `#F7FBFF` con texto `#061327`
4. Desafios: `#020A18`
5. Membresia: `#EAF8FB` con tarjetas navy
6. Portal preview: `#061327`
7. Historias: `#F7FBFF`
8. Swim camps / coach: `#020A18`
9. Partners: `#F4EFE7` o `#F7FBFF`

## Ejemplo CSS/Tailwind pendiente de aplicar

```tsx
<section className="bg-swim-navy text-swim-white">...</section>
<section className="bg-[#061327] text-swim-white">...</section>
<section className="bg-[#F7FBFF] text-swim-ink">...</section>
<section className="bg-[#EAF8FB] text-swim-ink">...</section>
<section className="bg-[#020A18] text-swim-white">...</section>
<section className="bg-[#F4EFE7] text-swim-ink">...</section>
```

## Recomendacion

Aplicaria la opcion recomendada con bandas claras solo en Programas, Membresia, Historias y Partners. Evitaria convertir toda la landing a crema/beige porque Best Swim perderia la sensacion premium/acuatico que ya tiene el navy.

Cambio aplicado:

- Programas: `#F7FBFF`
- Membresia: `#EAF8FB`
- Historias: `#F7FBFF`
- Partners: `#F4EFE7`

Las secciones Hero, Desafios, Portal preview, Tienda, Swim Camps, Entrenador y Footer mantienen el navy actual.
