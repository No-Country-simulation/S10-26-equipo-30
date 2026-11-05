# Pieza 5 — Contexto adicional

> **Etapa 2 · UXFlow (equipo 30)**
> Estado: decisión de diseño **hipotética**, pendiente de validar con ≥5 usuarios reales sobre la versión mejorada.
>
> Esta parte del flujo es una hipótesis abierta. El brief original plantea testear **formulario complementario**, **respuesta por email** o **llamada corta (~10 min)** para ver qué genera más contexto con menos fricción.  
> Con la evidencia acumulada (piezas 2–3 + Ezequiel), el equipo **prioriza contacto P2P en dos instancias + lead scoring** en lugar de aplicar un formato único al 100 % de los envíos.

---

## Respuesta a la pregunta guía

### ¿Qué formato genera más contexto de calidad con menor fricción?

**Hipótesis de diseño (criterio del equipo + evidencia cualitativa):**

| Formato (brief original) | Veredicto | Motivo |
|---|---|---|
| Formulario complementario solo | **Complemento**, no canal principal | Útil para **bajar** lo capturado en la call a campos (post-15 min), pero Inv. 28 / Ezequiel piden **criterios de éxito y contexto** que un segundo formulario frío no extrae bien si el brief inicial fue pobre. |
| Email async | **Instancia 1** (aterrizaje) | Escala bien; sirve para **filtrar interés** y abrir conversación. Insuficiente solo para desafíos complejos (salud, ONG, IoT). |
| Llamada 10–15 min | **Instancia 2** (contexto rico) | Alineado a Ezequiel (assessment armado en diálogo; antes vía Leandro). **Alta calidad**, **bajo volumen** — no escala al 100 %. |

**Decisión:** flujo **P2P en 2 instancias** para **leads calientes** (scoring), no para todos los proyectos:

1. **Instancia 1 — Aterrizaje (24–48 h post-envío):** WhatsApp si hay teléfono; si no, **email firmado**. Objetivo: confirmar interés, una pregunta sobre el desafío, invitar a call solo si el score lo amerita. *(Continuidad operativa con pieza 3; pieza 5 define **cuándo** escalar a instancia 2.)*
2. **Instancia 2 — Call 15 min:** obtener contexto, criterios de éxito, restricciones, stakeholders; operador completa **brief enriquecido** en backoffice / Mis Proyectos.

**Formulario complementario:** se envía **después** de la call solo a quien no llegó a umbral de call pero necesita ajustes, o como **checklist** que el revisor completa con el decisor en pantalla compartida.

---

## Lead scoring — a quién sí contactar con instancia 2

No Country no tiene capacidad de **15 min × N envíos**. El scoring ordena la cola de revisión y **concentra P2P** en quien demuestra que **quiere que el proyecto avance**.

### Señales disponibles hoy (formulario + panel de testing)

| Señal | Fuente | Interpretación |
|---|---|---|
| Longitud / calidad del “Problema” | `proyectos_enviados.csv` | Sims 24–26 ~100+ caracteres narrativos vs envíos “test” / muy breves |
| Tipo de organización y vertical | Formulario | ONG, educación, salud (Ezequiel, Carlos) → mayor costo de un brief malo |
| Tiempo en pasos de brief | `flujo_de_actividad.csv` | Mucho tiempo en problema/descripción → esfuerzo real (Inv. 18 abandonó aquí; quien completa = interés) |
| Respondió instancia 1 (WhatsApp/email) | Operación pieza 3 | **Fuerte** indicador de lead caliente |
| Abrió / volvió a Mis Proyectos | Producto (futuro) | Interés post-envío |
| Agendó call desde CTA | Producto (futuro) | Máxima intención |
| Teléfono cargado | Formulario | Habilita WhatsApp (Carlos preguntó para qué — usar solo con transparencia) |

### Modelo de puntuación (hipótesis v1 — calibrar con operaciones)

Puntos orientativos; umbral inicial sugerido: **≥ 45 → ofrecer call**; **≥ 65 → call recomendada antes de aprobar**.

| Criterio | Puntos |
|---|---|
| Respondió al mensaje de aterrizaje en ≤ 48 h | +25 |
| Texto “Problema” ≥ 120 caracteres o completó bloques de brief estructurado (v. mejorada pieza 2) | +15 |
| Organización: fundación / ONG / institución educativa / salud | +10 |
| Vertical de alto impacto o complejidad (p. ej. IoT, logística crítica — Inv. 28) | +10 |
| Reapertura de Mis Proyectos o click en “Agendar 15 min” | +15 / +30 |
| Teléfono válido + opt-in WhatsApp | +5 |
| Título o problema genérico (“test”, una línea) | −30 |
| Sin respuesta a instancia 1 en 7 días | −15 (no descartar; revisión async mínima) |

**Cola operativa:** revisar **primero** score alto; score bajo → revisión ligera + email de ajustes o rechazo motivado; **no** call obligatoria.

---

## (a) Evidencia disponible

| Fuente | Qué aporta |
|---|---|
| **Ezequiel Lo Cane** | Brief tipo *assessment* es condición para buen outcome; en ediciones previas el contexto rico pasaba por **persona** (Leandro), no solo por formulario. |
| **Invitado 28 (sim Ezequiel)** | Brief genérico; pide secciones (contexto, criterios, validaciones); seguimiento e interacción posteriores. |
| **Pieza 2** | Calidad del texto varía; guiado alarga “Problema” pero no sustituye contexto de negocio. |
| **Pieza 3** | Instancia 1 (WhatsApp/email) ya definida; CTA “Agendar 15 min” en pantalla de éxito — pieza 5 **acota quién** recibe call. |
| **`proyectos_enviados.csv`** | Mezcla envíos sim narrativos y pruebas mínimas → necesidad de **priorización**, no trato igual. |
| **Brief original (3 formatos)** | No se testearon en A/B en el panel; decisión por **síntesis** + criterio operativo del equipo. |

---

## (b) Suficiencia de evidencia

**Nivel: Media – Baja** para el scoring numérico; **Media – Alta** para “call + humano en leads calientes”.

- **Alta** en el **problema**: hace falta más contexto del que da el formulario (Ezequiel, Inv. 28, pieza 2).
- **Alta** en **no escalar call al 100 %** (capacidad operativa + envíos de prueba en panel).
- **Baja** en pesos exactos del score: **hipótesis** hasta 30–60 días de piloto con cola real.
- **Baja** en comparación formal formulario complementario vs email vs call.

Conclusión: **suficiente para implementar piloto P2P + scoring v1**; calibrar umbrales con datos de conversión (respuesta instancia 1 → call agendada → brief aprobado).

---

## (c) Decisión de diseño recomendada

1. **Instancia 1 universal (ligera):** WhatsApp o email post-envío (pieza 3) — no es pieza 5 exclusiva, pero alimenta el score.
2. **Instancia 2 selectiva:** call **15 min** solo si **score ≥ umbral** o el revisor lo marca manualmente (override).
3. **Salida de la call:** brief enriquecido documentado (notas + checklist contexto / éxito / fuera de alcance / riesgos) visible en Mis Proyectos para el decisor y para equipos.
4. **Formulario complementario** como **anexo** post-call o para “Necesita ajustes” sin call, no como primer paso para todos.
5. **Rechazo / ajustes** con feedback concreto en leads bajos sin invertir call (ahorro operativo).
6. **Transparencia:** en instancia 1 explicar que la call es **opcional y por cupos**, priorizada a proyectos alineados a la misión y con interés confirmado.

---

## (d) Cambios para la versión mejorada

### 1. Operación P2P
- Script instancia 1 (WhatsApp/email): 3 líneas + pregunta abierta + link agendar **solo si score ≥ 45**.
- Script call 15 min: plantilla Notion/CRM — contexto, usuarios afectados, criterios de éxito, qué no hacer, calendario de la org.
- Asignar owner (rol “programas”) por proyecto score alto.

### 2. Producto / panel interno
- Vista revisor: **score**, historial de contactos, botón “Forzar call” / “Solo email de ajustes”.
- Estado **“Brief enriquecido”** entre “En revisión” y “Aprobado”.

### 3. Formulario complementario (acotado)
- Enviar link **solo** post-call (“Confirmá estos puntos”) o cuando revisión pida ajustes sin agendar.

### 4. Métricas del piloto
- % envíos que llegan a instancia 2.
- Tiempo revisión score alto vs bajo.
- Tasa de aprobación y calidad percibida del brief (rubrica interna 1–5).
- Correlación: respondió instancia 1 → aprobado.

### 5. Relación con otras piezas
- **Pieza 3:** acuse, SLA, instancia 1 — **no duplicar**; pieza 5 = **reglas de escalado** a call y brief rico.
- **Pieza 6:** brief enriquecido alimenta expectativas de seguimiento con equipos post-aprobación.

---

## (e) Hallazgos

| # | Hallazgo | Fuente | Evidencia | Decisión que lo resuelve |
|---|---|---|---|---|
| H1 | El formulario solo no alcanza para brief tipo assessment | Ezequiel · Inv. 28 · pieza 2 | Caja genérica; sim Ezequiel explícito | Instancia 2 call + notas |
| H2 | El contexto rico históricamente fue **humano**, no self-service | Entrevista Ezequiel | Intermediario Leandro | P2P 2 instancias |
| H3 | Tratar todos los envíos igual desgasta operación | Panel · equipo | Envíos “test” vs sims narrativos | Lead scoring |
| H4 | Email async sirve de filtro; call concentra calidad | Criterio equipo · pieza 3 | Aterrizaje 24–48 h | Instancia 1 → 2 |
| H5 | Segundo formulario sin relación fría aporta poco en casos complejos | Sim · mapa perfiles | Fricción jerga (pieza 2) | Form complementario post-call |
| H6 | Interés demostrado predice worth de 15 min | Heurística · pieza 4 | Recuperación / respuesta contacto | Puntos por respuesta y agendado |
| H7 | No se testearon 3 formatos en paralelo | Panel | Sin experimento A/B formatos | Piloto scoring + call |
