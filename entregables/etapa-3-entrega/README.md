# Etapa 3 — Entrega

Cierre del proyecto **UXFlow · equipo 30**: versión mejorada desplegada, síntesis de hallazgos y **copy final** materializado en el prototipo de producción (pantallas, emails y paneles operativos).

## Accesos principales

| Recurso | Descripción | Enlace |
|---------|-------------|--------|
| **Prototipo en producción** | Demo integrada (flujo decisor + paneles internos) | [https://s10-26-equipo-30.vercel.app/](https://s10-26-equipo-30.vercel.app/) |
| **Síntesis ejecutiva** | Los 3 hallazgos de mayor impacto | [los-tres-hallazgos-de-mayor-impacto](./los-tres-hallazgos-de-mayor-impacto.md) |
| **Video demo** | Recorrido grabado del flujo mejorado | **[EN PROCESO]** |

## Copy final por pieza (producción)

El copy acordado en Etapa 2 está implementado en el deploy. Usá estos enlaces para revisar el texto **tal como lo ve el usuario** y el código fuente cuando el canal es email.

**Base URL:** `https://s10-26-equipo-30.vercel.app`

| Pieza | Qué incluye el copy final | Ver en producción | Fuente en repo (referencia) |
|-------|---------------------------|-------------------|-----------------------------|
| **1 — Dashboard y propuesta de valor** | Hero, métricas, “cómo funciona”, testimonios, CTA a cargar desafío | [Inicio `/`](https://s10-26-equipo-30.vercel.app/) | [testimonios.md](../etapa-2-testing/pieza-1-dashboard/utils/testimonios.md) · [decisión pieza 1](../etapa-2-testing/pieza-1-dashboard/pieza-1-dashboard.md) |
| **2 — Formulario inicial** | Microcopy clásico + guiado: hints, “Enviar a revisión”, organización, brief | [Cargar proyecto](https://s10-26-equipo-30.vercel.app/cargar-proyecto) · [Modo](https://s10-26-equipo-30.vercel.app/cargar-proyecto/modo) | [decisión pieza 2](../etapa-2-testing/pieza-2-formulario-inicial/pieza-2-formulario-inicial.md) |
| **3 — Post-envío** | Pantalla de confirmación, timeline “En revisión”, email de acuse | [Post-envío](https://s10-26-equipo-30.vercel.app/post-envio) · [Mis proyectos](https://s10-26-equipo-30.vercel.app/mis-proyectos) | [`submission-confirmation.ts`](../../prototipo/src/lib/email/submission-confirmation.ts) · [decisión pieza 3](../etapa-2-testing/pieza-3-post-envio/pieza-3-post-envio.md) |
| **4 — Recuperación de abandonos** | Email +1 h, copy “enviar a revisión”, guiones para contacto en Leads | Panel (rol staff): [Leads](https://s10-26-equipo-30.vercel.app/panel/leads) *(requiere login)* | [`recovery-reminder.ts`](../../prototipo/src/lib/email/recovery-reminder.ts) · [`qualified-leads.ts`](../../prototipo/src/lib/qualified-leads.ts) · [decisión pieza 4](../etapa-2-testing/pieza-4-recuperacion-de-abandonos/pieza-4-recuperacion-de-abandonos.md) |
| **5 — Contexto adicional / revisión** | Cola de prioridad, bandas de score, guías post-envío en panel del revisor | [Cola de revisión](https://s10-26-equipo-30.vercel.app/panel/revision) *(researcher/admin)* | [decisión pieza 5](../etapa-2-testing/pieza-5-contexto-adicional/pieza-5-contexto-adicional.md) |
| **6 — Aprobación** | Email “Tu desafío fue aprobado”, estados en Mis Proyectos | Estados visibles tras aprobación en [Mis proyectos](https://s10-26-equipo-30.vercel.app/mis-proyectos) | [`approval-notification.ts`](../../prototipo/src/lib/email/approval-notification.ts) · [decisión pieza 6](../etapa-2-testing/pieza-6-aprobacion/pieza-6-aprobacion.md) |

### Paneles internos (demo operativa)

| Rol | Ruta en producción |
|-----|-------------------|
| Research / Admin | [/panel](https://s10-26-equipo-30.vercel.app/panel) · [/panel/revision](https://s10-26-equipo-30.vercel.app/panel/revision) |
| Marketing / Research / Admin | [/panel/leads](https://s10-26-equipo-30.vercel.app/panel/leads) |

> Los paneles requieren sesión y rol asignado en Supabase. Para la demo, preparar cuentas de prueba con rol `researcher`, `admin` o `marketing`.

## Documentación de respaldo

| Etapa | Índice |
|-------|--------|
| Descubrimiento | [etapa-1-descubrimiento](../etapa-1-descubrimiento/README.md) |
| Testing (decisiones e hipótesis) | [etapa-2-testing](../etapa-2-testing/README.md) |
| Entregables generales | [entregables/README.md](../README.md) |

## Notas de entrega

- El **video demo** se publicará en esta sección cuando esté listo (mismo orden de piezas que la tabla de copy).
- Emails transaccionales dependen de **Resend** en el entorno de Vercel; sin configuración, el flujo en pantalla igual se puede mostrar en el video.
- La vista activa post-aprobación con equipos (pieza 6 completa) sigue como **hipótesis**; el copy de email y estados en Mis Proyectos sí están en producción.
