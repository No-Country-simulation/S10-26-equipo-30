# Pieza 6 — Aprobación y experiencia post-aprobación

> **Etapa 2 · UXFlow (equipo 30)**
> Estado: decisión de diseño **hipotética**, pendiente de validar con ≥5 usuarios reales sobre la versión mejorada.
>
> ¿El email convierte al decisor en usuario activo?  
> ¿Qué quiere ver el decisor en el dashboard una vez que su desafío está activo — progreso del equipo, actividad, entregables parciales?  
> ¿Qué experiencia post-aprobación hace que el decisor vuelva a cargar en el próximo ciclo?

---

## Respuesta a las preguntas guía

### 1. ¿El email convierte al decisor en usuario activo?

**Solo si el email es el inicio de un loop, no un aviso suelto.**

En el panel UXFlow **no hay** desafíos que hayan pasado a “En simulación”; en producción oficial el equipo vio **“Pendiente de revisión”** semanas sin email (pieza 3). Por tanto, la conversión **email → usuario activo** no está medida en test.

**Hipótesis** apoyada en **Ezequiel** (decisor que **sí** volvería a cargar):

- Un email del tipo *“Tu desafío fue aprobado · Equipos asignados”* **no alcanza** si después en producto no hay **dónde actuar**.
- Debe incluir: **enlace directo** a Mis Proyectos (vista activa), **qué se espera del decisor** esta semana (p. ej. responder dudas en 48 h), **fecha** de primera checkpoint sync, contacto nombrado.
- Quienes pasaron por **pieza 5** (call + brief enriquecido) llegan más preparados para ser activos; el email de aprobación puede **resumir** acuerdos de la call.

**Decisión:** email de aprobación + **notificación in-app** + opcional WhatsApp para score alto — siempre con **una acción concreta** (ver equipo, confirmar brief, agendar Q&A).

---

### 2. ¿Qué quiere ver en el dashboard con el desafío activo?

**Evidencia principal: Ezequiel** (única fuente profunda del ciclo **con equipos**). Lo que tuvo y lo que echó de menos:

| Hoy (histórico) | Necesidad del decisor |
|---|---|
| Lista de equipos con estados muy simples (“leyeron”, “desarrollando”) | **Indicadores claros** por equipo: etapa, última actividad, riesgo (sin movimiento X días) |
| Sin contacto async con estudiantes | **Canal de dudas** (mensajes o formulario) sin esperar solo a la videollamada |
| Dependencia de Leandro para entender avance | **Dashboard autoservicio** con detalle suficiente para no intermediario |
| 1–2 videollamadas | **Calendario** de hitos sync + resumen post-sesión |

**No confundir con pieza 1:** el dashboard **público** captura leads; aquí hablamos de **Mis Proyectos → desafío activo** (privado).

**Contenido mínimo recomendado (vista activa):**

1. **Resumen del brief aprobado** (incl. enriquecido en pieza 5).
2. **Por cada equipo:** estado, miembros, última entrega / commit / entregable parcial (según lo que la plataforma pueda mostrar).
3. **Actividad reciente** (timeline).
4. **Bandeja de preguntas** del equipo al decisor (async).
5. **Próximos eventos** (office hours, demo intermedia, final).
6. **Entregables parciales** descargables o preview cuando existan.

Inv. 28 (sim Ezequiel) anticipó esto en el formulario: seguimiento de equipos y dudas async — pieza 6 es donde **se cumple** esa promesa post-aprobación.

---

### 3. ¿Qué experiencia hace volver a cargar en el próximo ciclo?

De Ezequiel: **camino ~4/10, outcome excelente, volvería igual**. Retención no requiere perfección en cada videollamada, pero sí:

| Factor | Implicación |
|---|---|
| **Resultado tangible** (MVP usable) | Comunicar wins en cierre de ciclo (“Tu desafío generó X”) — email + Mis Proyectos. |
| **Sentirse escuchado** en el camino | Piezas 3–5 + async en pieza 6 reducen la sensación de “construyeron otra cosa”. |
| **Esfuerzo del decisor acotado** | Reglas claras: *“~30 min/semana para dudas”* vs disponibilidad ilimitada. |
| **Confianza en el modelo** | Repite porque ama No Country; la UX debe **bajar fricción** del 4 al 7+, no solo celebrar el MVP final. |

**Señales de éxito** (mapa descubrimiento): checklist de brief, expectativas Q&A sync/async, **dashboard por equipo** en flujo o confirmación — pieza 6 materializa el tercer punto **después** de aprobar.

---

## (a) Evidencia disponible

| Fuente | Qué aporta |
|---|---|
| **Entrevista Ezequiel Lo Cane** | UX durante simulación: visibilidad limitada, sin async, Q&A en calls, outcome vs camino; **retención** a pesar del 4/10. |
| **Invitado 28** | Expectativa explícita de seguimiento e interacción con equipos. |
| **Pieza 3** | Preview “Cómo vas a trabajar con los equipos”; estados hasta “En simulación”. |
| **Pieza 5** | Brief enriquecido como base del panel activo. |
| **`form-05.png`** | Paso **Aprobación** → inclusión en simulación; puente narrativo hacia pieza 6. |
| **Panel `02-testing`** | **Sin** usuarios en fase post-aprobación simulada → pieza 6 es **diseño desde descubrimiento**, no desde métricas de panel. |
| **Experiencia producción (equipo)** | Proyecto atascado en revisión → **no** hay evidencia de dashboard activo real en UXFlow. |

---

## (b) Suficiencia de evidencia

**Nivel: Media** para **qué debe mostrar** el dashboard activo; **Baja** para emails y retención medidos.

- **Media:** Ezequiel + Inv. 28 + mapa (vacío post-envío extendido al ciclo con equipos).
- **Baja:** conversión email → login activo; comparación de layouts de dashboard; NPS fin de simulación.

Conclusión: **suficiente para diseñar hipótesis de producto** alineadas al decisor recurrente; **insuficiente** para cerrar sin piloto con ≥1 desafío aprobado en versión mejorada.

---

## (c) Decisión de diseño recomendada

1. **Email (y push) de aprobación** con CTA único: **“Ver equipos y brief”** en Mis Proyectos activo.
2. **Vista activa** con equipos, timeline, preguntas async y entregables parciales — prioridad sobre nuevas métricas en dashboard público.
3. **Canal async decisor ↔ equipos** (aunque sea MVP: formulario + email digest al decisor) — gap #1 de Ezequiel.
4. **Hitos sync** calendarizados con expectativas de preparación y asistencia.
5. **Cierre de ciclo** documentado: entregables finales, agradecimiento, **invitación explícita** a cargar el próximo desafío (CTA + link formulario).
6. **Continuidad pieza 5:** proyectos con brief enriquecido entran a simulación con **menos sorpresa** para equipos y decisor.
7. **Lead scoring (pieza 5):** decisores que respondieron P2P reciben **mismo owner** en simulación si es posible — trato humano continuo.

---

## (d) Cambios para la versión mejorada

### 1. Transición aprobación → activo
- Estado **“En simulación”** dispara email + in-app; resumen: equipos asignados, fechas clave, link async.
- Actualizar timeline en Mis Proyectos (pieza 3) con fechas reales.

### 2. Dashboard activo (Mis Proyectos)
- Pestañas: **Brief · Equipos · Actividad · Preguntas · Entregables**.
- Por equipo: semáforo de actividad (últimos 7 días).
- Subida o enlace a **entregables parciales** (o integración futura con repos).

### 3. Participación del decisor
- Copy: *“Te sugerimos responder dudas en ≤ 48 h”*; contador de preguntas pendientes.
- Botón **“Proponer office hour 30 min”** (Calendly) para score alto / desafíos complejos.

### 4. Email que activa (plantilla)
- Asunto: *“[Título] ya tiene equipos — tenés 2 preguntas pendientes”* (dinámico).
- Cuerpo: 1 párrafo, 1 CTA, contacto humano.

### 5. Retención próximo ciclo
- Al cierre: email *“Resultado de tu desafío”* + botón **“Cargar otro desafío”**.
- Opcional: recordatorio 3 meses post-cierre para orgs con score histórico alto.

### 6. Fuera de alcance v1
- Exponer el desafío en dashboard **público** durante simulación (pieza 3: solo post-aprobación operativa interna; público opcional y posterior).
- Prometer videollamadas ilimitadas sin guía de uso.

---

## (e) Hallazgos

| # | Hallazgo | Fuente | Evidencia | Decisión que lo resuelve |
|---|---|---|---|---|
| H1 | Sin visibilidad detallada, el decisor depende de terceros | Ezequiel | Recurrió a Leandro; estados “muy básicos” | 2. Dashboard activo |
| H2 | Falta contacto async equipo–decisor | Ezequiel · Inv. 28 | *“Nadie me mandó nada”*; sim pide async | 3. Bandeja preguntas |
| H3 | El outcome puede salvar la relación, pero no escala la confianza | Ezequiel | 4/10 camino, MVP excelente, vuelve | 4–5. Hitos + cierre + CTA recarga |
| H4 | Email solo no crea usuario activo sin producto detrás | Pieza 3 · panel | Sin emails en prod; sin fase sim en test | 1. Email con CTA accionable |
| H5 | Expectativa de seguimiento nace antes de aprobar | Inv. 28 · pieza 3 preview | Feedback formulario | 2–3. Mis Proyectos activo |
| H6 | Brief rico (pieza 5) reduce desalineación en simulación | Ezequiel · pieza 5 | Analogía “casa equivocada” | 6. Brief visible en vista activa |
| H7 | No hay evidencia cuantitativa de retención en el panel | `02-testing` | 0 proyectos en simulación medida | Piloto post-implementación |
