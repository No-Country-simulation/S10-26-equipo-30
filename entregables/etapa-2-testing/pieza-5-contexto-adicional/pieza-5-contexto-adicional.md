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

**Decisión:** flujo **P2P en 2 instancias** solo para **leads calientes**, identificados con **scoring previo al post-envío** (al momento del envío). Ese score define **orden de revisión** y **intensidad del contacto** después — no al revés.

1. **Al enviar:** calcular **score v1** solo con datos del formulario y del recorrido (sin esperar respuestas a WhatsApp/email).
2. **Instancia 1 — Aterrizaje (24–48 h):** **prioritaria** para score alto (WhatsApp si hay teléfono; si no, email firmado). Score medio → email plantilla; score bajo → acuse automático pieza 3 sin cola humana dedicada.
3. **Instancia 2 — Call 15 min:** solo score alto (y/o override del revisor): contexto, criterios de éxito, brief enriquecido en backoffice / Mis Proyectos.

*(Pieza 3 cubre el acuse mínimo para todos; pieza 5 define **prioridad** y **escalado** según score **pre-envío**.)*

**Formulario complementario:** se envía **después** de la call solo a quien no llegó a umbral de call pero necesita ajustes, o como **checklist** que el revisor completa con el decisor en pantalla compartida.

---

## Lead scoring previo al post-envío

No Country no tiene capacidad de revisar ni contactar con **P2P** a todos los envíos. El **score se calcula en el submit** (o al cerrar el último campo obligatorio), **antes** de cualquier WhatsApp o email de aterrizaje. Con eso se define:

1. **Orden en la cola de revisión** (quién mira el revisor primero).
2. **Nivel de contacto post-envío** (instancia 1 humana vs solo acuse pieza 3; oferta de instancia 2 call).

> **Fuera del score v1:** si el lead **responde** después al aterrizaje, eso puede **repriorizar** la cola manualmente o en v2 — pero **no** entra en el puntaje inicial.

### Señales disponibles en el envío (formulario + flujo)

Todas observables **antes** del primer mensaje post-envío:

| Señal | Fuente | Interpretación |
|---|---|---|
| Longitud / calidad del “Problema” (y descripción si existe) | `proyectos_enviados.csv` | Sims 24–26 narrativos vs “test” / una línea |
| Título del proyecto | Mismo CSV | Genérico (“test”, “Mi proyecto”) → baja intención |
| Tipo de organización y sectores | Formulario | ONG, educación, salud, impacto social → más valor de brief rico (Ezequiel, Carlos) |
| Tiempo en pasos de brief | `flujo_de_actividad.csv` | Mediana alta en problema/descripción/entregables → esfuerzo al redactar |
| Tiempo total hasta enviar | `proyectos_enviados.csv` | Muy corto (< ~1 min) sugiere prueba; 2–10 min suele ser carga real |
| Teléfono completo | Formulario | No suma “interés” por sí solo; habilita **canal** WhatsApp si el score ya es alto |
| Cuenta con email vs invitado | `testers.csv` | Email identificable → seguimiento más confiable |
| Completitud de matching (roles, sectores, entregables) | Formulario + flujo | Selección mínima coherente vs campos vacíos o al azar |

### Modelo de puntuación pre-envío (hipótesis v1 — calibrar con operaciones)

| Criterio | Puntos |
|---|---|
| “Problema” ≥ 120 caracteres (contexto reconocible) | +15 |
| “Descripción del desafío” ≥ 80 caracteres o bloques de brief estructurado completos (v. pieza 2) | +15 |
| Título específico al dominio (no genérico) | +10 |
| Organización: fundación / ONG / institución educativa / salud | +10 |
| Sector o vertical de alta complejidad o misión (p. ej. logística crítica, IoT — Inv. 28) | +10 |
| Tiempo total de envío entre ~2 y ~12 min | +10 |
| Suma de tiempo en pantalla en problema + descripción + entregables ≥ 60 s (flujo) | +10 |
| Teléfono válido cargado | +5 |
| Usuario con email (no solo invitado anónimo) | +5 |
| Título o problema claramente de prueba (“test”, “asdf”, &lt; 20 caracteres en problema) | −30 |
| Tiempo total hasta enviar &lt; 60 s | −20 |
| Problema &lt; 40 caracteres | −15 |

**Umbrales sugeridos (salida al submit):**

| Score | Revisión | Post-envío (pieza 3 + 5) |
|---|---|---|
| **≥ 55 — Caliente** | Cola **prioritaria** | Instancia 1 **humana** (WhatsApp o email firmado) en 24 h + **oferta** call 15 min (instancia 2) |
| **30–54 — Templado** | Cola estándar | Email plantilla de aterrizaje; call solo si revisor lo pide |
| **&lt; 30 — Frío** | Cola **baja** / revisión async | Solo acuse automático (pieza 3); ajustes o rechazo por email sin call |

**Cola operativa:** el revisor ve **score + motivos** (desglose) y puede **override** (forzar call o subir prioridad) sin recalcular el formulario.

---

## (a) Evidencia disponible

| Fuente | Qué aporta |
|---|---|
| **Ezequiel Lo Cane** | Brief tipo *assessment* es condición para buen outcome; en ediciones previas el contexto rico pasaba por **persona** (Leandro), no solo por formulario. |
| **Invitado 28 (sim Ezequiel)** | Brief genérico; pide secciones (contexto, criterios, validaciones); seguimiento e interacción posteriores. |
| **Pieza 2** | Calidad del texto varía; guiado alarga “Problema” pero no sustituye contexto de negocio. |
| **Pieza 3** | Acuse y SLA para todos; pieza 5 **acota quién** recibe instancia 1 humana y call según **score pre-envío**. |
| **`proyectos_enviados.csv`** | Mezcla envíos sim narrativos y pruebas mínimas → necesidad de **priorización**, no trato igual. |
| **Brief original (3 formatos)** | No se testearon en A/B en el panel; decisión por **síntesis** + criterio operativo del equipo. |

---

## (b) Suficiencia de evidencia

**Nivel: Media – Baja** para el scoring numérico; **Media – Alta** para “call + humano en leads calientes”.

- **Alta** en el **problema**: hace falta más contexto del que da el formulario (Ezequiel, Inv. 28, pieza 2).
- **Alta** en **no escalar call al 100 %** (capacidad operativa + envíos de prueba en panel).
- **Baja** en pesos exactos del score: **hipótesis** hasta 30–60 días de piloto con cola real.
- **Baja** en comparación formal formulario complementario vs email vs call.

Conclusión: **suficiente para implementar piloto P2P + scoring pre-envío v1**; calibrar umbrales con datos de cola (tiempo hasta primera revisión, tasa de aprobación por banda de score).

---

## (c) Decisión de diseño recomendada

1. **Score pre-envío obligatorio** en backend al submit; visible en panel revisor antes de cualquier contacto.
2. **Instancia 1 humana** solo para banda **Caliente** (y excepciones override); resto: acuse pieza 3 + plantillas según banda.
3. **Instancia 2 (call 15 min)** para **Caliente** o override; no como default del 100 %.
4. **Salida de la call:** brief enriquecido documentado (notas + checklist contexto / éxito / fuera de alcance / riesgos) visible en Mis Proyectos para el decisor y para equipos.
5. **Formulario complementario** como **anexo** post-call o para “Necesita ajustes” sin call, no como primer paso para todos.
6. **Rechazo / ajustes** en banda **Fría** sin call (ahorro operativo).
7. **Transparencia:** la prioridad se explica por **calidad del envío**, no por “favoritismo”; call por cupos en proyectos score alto.

---

## (d) Cambios para la versión mejorada

### 1. Producto al submit
- Job que calcula score + banda (Caliente / Templado / Frío) y **desglose de puntos**.
- Cola de revisión ordenada por score desc + fecha (empate).

### 2. Operación P2P (según banda ya calculada)
- **Caliente:** script instancia 1 personalizado + link agendar call 15 min en el primer contacto.
- **Templado / Frío:** scripts acotados; sin call salvo override.
- Script call 15 min: plantilla Notion/CRM — contexto, usuarios afectados, criterios de éxito, qué no hacer, calendario de la org.

### 3. Panel interno revisor
- Vista: **score pre-envío**, banda, desglose, botón “Forzar call” / “Subir prioridad” / “Solo email de ajustes”.
- Estado **“Brief enriquecido”** entre “En revisión” y “Aprobado”.

### 4. Formulario complementario (acotado)
- Enviar link **solo** post-call (“Confirmá estos puntos”) o cuando revisión pida ajustes sin agendar.

### 5. Métricas del piloto
- Tiempo hasta **primera revisión humana** por banda de score.
- % **Caliente** que llega a instancia 2 (call).
- Tasa de aprobación por banda; calidad del brief (rubrica 1–5).
- Falsos negativos: score bajo pero proyecto valioso (ajustar pesos).

### 6. Relación con otras piezas
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
| H6 | El interés se infiere del **envío**, no del silencio post-envío | Panel · flujo | Texto narrativo vs “test”; tiempos en brief | Score **pre-envío** |
| H7 | No se testearon 3 formatos en paralelo | Panel | Sin experimento A/B formatos | Piloto scoring + call |
