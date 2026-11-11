# Etapa 2 — Testing e iteración

Decisiones de diseño del flujo **Cargar proyecto** (UXFlow · equipo 30), una **pieza por etapa del journey**: desde el dashboard público hasta la experiencia post-aprobación. Cada documento sigue la estructura (a) evidencia, (b) suficiencia, (c) decisión, (d) cambios propuestos, (e) hallazgos.

**Estado general:** hipótesis de diseño validadas en panel con simulaciones y evidencia cualitativa; pendiente de validación con ≥5 usuarios reales sobre la versión mejorada del prototipo.

## Índice de piezas

| # | Pieza | Pregunta guía (resumen) | Entregable |
|---|--------|-------------------------|------------|
| 1 | Dashboard público y propuesta de valor | ¿El inicio convierte en “cargar desafío”? | [Ver](https://github.com/No-Country-simulation/S10-26-equipo-30/blob/main/entregables/etapa-2-testing/pieza-1-dashboard/pieza-1-dashboard.md) |
| 2 | Formulario inicial (clásico / guiado) | ¿Qué variante da mejor brief con menos fricción? | [Ver](https://github.com/No-Country-simulation/S10-26-equipo-30/blob/main/entregables/etapa-2-testing/pieza-2-formulario-inicial/pieza-2-formulario-inicial.md) |
| 3 | Post-envío y comunicación | ¿Qué necesita ver el decisor para no perder interés? | [Ver](https://github.com/No-Country-simulation/S10-26-equipo-30/blob/main/entregables/etapa-2-testing/pieza-3-post-envio/pieza-3-post-envio.md) |
| 4 | Recuperación de abandonos | ¿Recuperamos cargas sin enviar con costo operativo bajo? | [Ver](https://github.com/No-Country-simulation/S10-26-equipo-30/blob/main/entregables/etapa-2-testing/pieza-4-recuperacion-de-abandonos/pieza-4-recuperacion-de-abandonos.md) |
| 5 | Contexto adicional (scoring / P2P) | ¿Qué formato da más contexto con menos fricción? | [Ver](https://github.com/No-Country-simulation/S10-26-equipo-30/blob/main/entregables/etapa-2-testing/pieza-5-contexto-adicional/pieza-5-contexto-adicional.md) |
| 6 | Aprobación y post-aprobación | ¿El email y el dashboard activo retienen al decisor? | [Ver](https://github.com/No-Country-simulation/S10-26-equipo-30/blob/main/entregables/etapa-2-testing/pieza-6-aprobacion/pieza-6-aprobacion.md) |

### Anexo pieza 1

| Recurso | Enlace |
|---------|--------|
| Copy de testimonios (utils) | [testimonios.md](./pieza-1-dashboard/utils/testimonios.md) |

## Prototipo demo (mapeo rápido)

Referencia para demos y revisión con el cliente: qué pieza toca cada parte del producto.

| Pieza | Rutas / módulos en [`prototipo/`](../../prototipo/) |
|-------|--------------------------------------------------------|
| 1 | `/` (dashboard), CTA a carga |
| 2 | `/cargar-proyecto/*` (clásico y guiado), telemetría en Supabase |
| 3 | `/post-envio`, email de confirmación (Resend), `/mis-proyectos` |
| 4 | Email +1 h (cron), `/panel/leads` (rol marketing/research) |
| 5 | Score al enviar, `/panel/revision`, estados de revisión |
| 6 | Email al marcar **Aprobado**, estado visible en Mis Proyectos *(vista activa con equipos: hipótesis, no implementada)* |

Setup base de datos: [`supabase/SETUP.md`](../../supabase/SETUP.md). Diseño de referencia: [`diseno/formulario-inicial/`](../../diseno/formulario-inicial/).

## Enlaces relacionados

- Etapa anterior: [Descubrimiento · mapa y Figma](../etapa-1-descubrimiento/README.md)
- Etapa siguiente: [Entrega · producción y copy final](../etapa-3-entrega/README.md)
- Índice en documentación: [`docs/02-testing`](../../docs/02-testing/README.md)
- Índice general de entregables: [`entregables/README.md`](../README.md)
