# Pieza 3 — Post-envío y comunicación

> **Etapa 2 · UXFlow (equipo 30)**
> Estado: decisión de diseño **hipotética**, pendiente de validar con ≥5 usuarios reales sobre la versión mejorada.
>
> ¿Qué necesita ver el decisor entre que envía y que recibe respuesta para no perder el interés?  
> ¿Un email inmediato es suficiente?  
> ¿Necesita ver su desafío en el dashboard público para sentir que existe?  
> ¿Una estimación de tiempo de respuesta cambia el comportamiento?  
> El equipo testa distintas respuestas inmediatas y mide cuál genera más engagement en el paso siguiente.

---

## Respuesta a las preguntas guía

### 1. ¿Qué necesita ver el decisor para no perder el interés?

**Necesita sentir que el desafío entró en un proceso con humanos, plazos y un lugar donde mirar el estado — no un silo silencioso.**

#### Evidencia prioritaria: Ezequiel Lo Cane (entrevista en profundidad)

Ezequiel es el **decisor recurrente** más valioso: participó varias veces en No Country, calificó el **camino** del proceso en **4/10** pero el **resultado final** como excelente (MVP con equipos finalistas). Su patrón explica qué falta entre el envío y la respuesta:

| Necesidad | Qué dijo / hizo | Implicación para post-envío |
|---|---|---|
| **Brief serio antes de equipos** | Arma un *assessment* para que los equipos entiendan contexto, criterios y alcance; le molesta el brief como caja genérica | Tras enviar, el decisor debe ver que **No Country revisa y puede pedir ajustes al brief** — no “desaparece” hasta la simulación. |
| **No depender de un intermediario** | En ediciones previas pasaba info por **Leandro**; el seguimiento en plataforma era *intuitivo pero insuficiente* — volvía a Leandro para entender avance | La confirmación no alcanza: hace falta **contacto nombrado** (persona o rol) y canal, no solo copy genérica. |
| **Visibilidad del avance (con equipos)** | Veía poco más que “leyeron / desarrollando”; **no podía contactar equipos** ni resolver dudas asincronicamente; las preguntas y respuestas eran 1–2 videollamadas | Entre envío y matching, mostrar **qué va a poder ver después** (estado, hitos, cómo responder dudas) aunque aún no haya equipos. |
| **Interacción continua** | Comparó con desarrollo de software: sin feedback temprano, el equipo construye “la casa equivocada” | Comunicar que **habrá instancias de alineación** (no solo entrega final). |
| **Confianza en el modelo** | Repetiría cargar desafíos; ama la idea de No Country | El riesgo no es el concepto, es el **vacío operativo** post-envío. |

La simulación alineada a Ezequiel (**Invitado 28**) refuerza lo mismo en el formulario: *“No queda claro si publico o pasa por revisión, ni cómo hago seguimiento de los equipos ni cómo respondo sus dudas de forma asincrónica.”*

#### Otros decisores (testing + pieza 2)

- **Martín (Inv. 27):** no ve **qué valida No Country ni plazos de revisión**; botón “Publicar” vs mensaje de correo — desalineación.
- **Adriana, Raquel, Carlos (simulaciones):** *“¿Qué pasa después?”*, costo, revisión vs publicación.
- **Contexto operativo real (equipo UXFlow):** dos cargas en la **plataforma oficial** → solo pantalla de éxito (`diseno/formulario-inicial/img/form-05.png`) + toast *“Proyecto creado correctamente”*; **sin email ni contacto externo**; a las **3 semanas** el proyecto sigue **“Pendiente de revisión”** sin novedad.

#### Qué debe ver (checklist de diseño)

1. **Acuse inmediato** en pantalla + fuera de pantalla (email mínimo) con **ID de envío**, fecha y estado inicial: *En revisión*.
2. **SLA explícito:** p. ej. *“Te respondemos en un máximo de X días hábiles”* y qué pasa si se demora (canal de escalado).
3. **Timeline** coherente con `form-05`: Revisión → Aprobación / Ajustes / Rechazo — con **fechas objetivo**, no solo íconos.
4. **“Mis Proyectos”** como hogar del estado (detalle, historial de mensajes, solicitud de cambios al brief).
5. **Anticipación del rol del decisor** cuando haya equipos (cómo responden dudas, async vs sync) — alineado a la expectativa de Ezequiel.
6. **Próximo paso concreto** para el lead: *“Mientras tanto, podés…”* (completar brief adjunto, agendar 15 min con el programa, revisar FAQ).

---

### 2. ¿Un email inmediato es suficiente?

**No.** Es **necesario pero insuficiente** para generar confianza y trato humano.

| Solo email automático | Por qué falla en nuestro contexto |
|---|---|
| Confirmación genérica | En producción real **no llegó** ningún email tras el envío (experiencia del equipo). |
| Sin plazo | Refuerza sensación de *“quedó en el limbo”* (3 semanas pendiente). |
| Sin rostro | Ezequiel operó años con **contacto humano** (Leandro); el lead no técnico también pide claridad sobre teléfono y quién ve los datos (Carlos). |

**Estrategia recomendada: email inmediato + 1–2 contactos humanos escalonados**

1. **Email inmediato (< 5 min):** resumen del desafío, estado *En revisión*, **SLA**, enlace a Mis Proyectos, FAQ (costo cero, propiedad, qué es revisión).
2. **Contacto humano 1 — reconocimiento (24–48 h):** mensaje **personalizado** (no plantilla larga) por **WhatsApp o email firmado** por alguien del programa (*“Hola [nombre], recibimos [título], soy [nombre], reviso tu brief”*). Usa el teléfono ya pedido en el formulario, con opt-out claro.
3. **Contacto humano 2 — solo si aplica (día 3–5 o al cerrar SLA):** **micro-llamada o slot de 15 min** (*“Afinamos el brief antes de asignar equipos”*) para perfiles como Ezequiel o envíos complejos (ONG, salud, educación); opcional para pymes simples.

El widget de WhatsApp en `form-05` puede ser **reactivo**; la propuesta es **contacto proactivo outbound** tras envío, no esperar a que el lead escriba.

---

### 3. ¿Necesita ver su desafío en el dashboard público?

**No — no como requisito inmediato post-envío.**

- El desafío **debe pasar por revisión y enriquecimiento del brief** antes de exponerse a equipos o al público.
- Mostrarlo en el dashboard público al instante **confundiría** “enviado” con “publicado” (ya es ambiguo con el botón “Publicar” — Inv. 27, Adriana).
- Lo que el decisor necesita es **existencia verificable en su espacio privado**: Mis Proyectos con estado, timeline y mensajes — no visibilidad pública.

**Decisión:** responder **no** al dashboard público inmediato; invertir en **estado privado + comunicación** para que el lead sienta que el proyecto *existe y avanza*.

---

### 4. ¿Una estimación de tiempo de respuesta cambia el comportamiento?

**Sí, de forma relevante** (hipótesis fuerte, apoyada por fricción observada).

- Sin plazo, **3 semanas en “Pendiente de revisión”** destruye la promesa de la pantalla de éxito y alimenta miedo a estafa/costo (continuidad pieza 1 y 2).
- Inv. 27 y el mapa de perfiles señalan **SLA de revisión** como expectativa explícita del perfil técnico; para Ezequiel, el plazo es parte de poder **planificar** interacción con equipos.
- Mostrar SLA en **confirmación + email + Mis Proyectos** da **seguridad de que no quedará perdido** entre otros proyectos.

En la versión mejorada: comprometer un rango realista acordado con operaciones (p. ej. **5 días hábiles** primera respuesta) y **actualizar el estado** si se excede (mensaje automático + contacto humano).

---

## (a) Evidencia disponible

| Fuente | Qué aporta |
|---|---|
| **Entrevista Ezequiel Lo Cane** (`docs/01-descubrimiento/`) | Decisor recurrente; vacío de seguimiento e interacción; dependencia de intermediario; brief estructurado; camino 4/10 vs outcome excelente. |
| **Mapa motivaciones** | Eje **“Vacío post-envío”** (Ezequiel, Martín, Adriana); recomendación de confirmación con revisión, plazos y qué podrá ver/hacer. |
| **`feedback.csv`** | Inv. 28 (sim Ezequiel): revisión vs publicación, seguimiento equipos, async. Inv. 27: plazos y validación No Country. Sims 24–26: “qué pasa después”. |
| **`flujo_de_actividad.csv`** | **11** usuarios vieron **confirmación de envío** (coherente con envíos completados). |
| **Captura `form-05.png`** | UI actual: pasos Revisión / Aprobación / Ajustes / rechazo; CTA Mis Proyectos; toast de éxito; **sin SLA ni canal de contacto explícito**. |
| **Experiencia plataforma oficial (equipo)** | Tras 2 envíos reales: **0 emails**; estado **Pendiente de revisión** sin cambios **≥ 3 semanas**. |

---

## (b) Suficiencia de evidencia

**Nivel: Media – Alta** para diseñar comunicación post-envío; **Baja** para cuantificar qué variante de mensaje gana engagement (aún no se testearon respuestas alternativas en producto).

- **Alta** en diagnóstico del vacío: entrevista real + sim alineada + evidencia operativa (sin email, SLA roto).
- **Media** en priorización de canales: WhatsApp/llamada son **hipótesis de diseño** apoyadas en Ezequiel y criterio del equipo.
- **Dashboard público:** consenso analítico (**no** inmediato) — no requiere más test para decidir.

Conclusión: **suficiente para decidir hipótesis de producto y operación**; la versión mejorada debe **medir** apertura de Mis Proyectos, respuesta a WhatsApp humano y NPS ( encuesta breve de satisfacción ) a los 7 días post-envío.

---

## (c) Decisión de diseño recomendada

1. **Confirmación en pantalla mejorada** (`form-05`): SLA visible, ID de envío, mismo timeline pero con **fechas/compromiso** y enlace a FAQ post-envío.
2. **Email transaccional inmediato** (obligatorio en backend): no depender solo del cartel en UI.
3. **Paquete de contacto humano:** reconocimiento 24–48 h (WhatsApp o email firmado) + oferta de call de brief cuando corresponda.
4. **Mis Proyectos como fuente de verdad:** estados, historial, solicitudes de ajuste; **no** publicación en dashboard público hasta aprobación.
5. **Operación alineada al SLA:** si no hay capacidad de revisar en X días, **no prometer X** en UI; mejor SLA honesto + actualizaciones automáticas.
6. **Puente a pieza 6:** post-aprobación, anticipar visibilidad para equipos y canal async de dudas (expectativa Ezequiel).

---

## (d) Cambios para la versión mejorada

### 1. Pantalla de éxito (inmediato)
- Texto principal: *“Recibimos tu desafío · En revisión”* (evitar “creado/publicado”).
- Bloque destacado: **“Primera respuesta antes del [fecha]”** (calculada con SLA).
- Lista “Qué sigue” con **responsable** (*“Equipo de programas No Country”*) y **qué puede pasar** (aprobación, pedido de cambios, rechazo con motivo).
- CTA primario: **Ver estado en Mis Proyectos**; secundario: **Agendar 15 min para afinar el brief** (Calendly o similar).

### 2. Email inmediato (< 5 min)
- Asunto: *“Recibimos [título] — respuesta antes del [fecha]”*.
- Cuerpo: resumen, enlace Mis Proyectos, SLA, contacto reply-to humano, costo cero.

### 3. Contacto humano (24–48 h)
- Template corto personalizado (título del proyecto + organización).
- WhatsApp solo si dio teléfono; si no, email firmado.
- Objetivo: **una pregunta abierta** (*“¿Hay algo del brief que quieras aclarar antes de que lo revisemos?”*).

### 4. Mis Proyectos
- Estados: *En revisión · Necesita ajustes · Aprobado · En simulación · Rechazado*.
- Línea de tiempo con fechas reales; notificaciones in-app cuando cambie el estado.
- Sección **“Cómo vas a trabajar con los equipos”** (preview, aunque equipos aún no estén asignados).

### 5. Lo que no hacemos
- **No** mostrar el desafío en dashboard público hasta **aprobación + brief listo**.
- **No** prometer email si la infraestructura no lo envía (bloqueante detectado en plataforma oficial).

---

## (e) Hallazgos

| # | Hallazgo | Fuente | Evidencia | Decisión que lo resuelve |
|---|---|---|---|---|
| H1 | Tras enviar en producción no hay email ni señal externa | Real (equipo) | 2 envíos oficiales; 3 semanas sin cambio de estado | 2. Email obligatorio · 5. SLA operativo |
| H2 | La UI de éxito explica pasos pero **sin plazos ni contacto** | Heurística · `form-05` | Timeline genérico; toast “creado correctamente” | 1. Pantalla con SLA · 3. Contacto humano |
| H3 | El decisor experto necesita brief revisable y visibilidad futura sobre equipos | Entrevista Ezequiel | Seguimiento básico; sin async; intermediario | 4. Mis Proyectos · 6. Preview interacción |
| H4 | Ambigüedad publicar vs revisar erosiona confianza | Sim · feedback | Inv. 28, 27, 25; botón “Publicar” | 1. Copy “En revisión” · 5. No dashboard público |
| H5 | SLA explícito es expectativa del perfil técnico y del mapa | Sim · docs descubrimiento | Inv. 27; mapa “Vacío post-envío” | 1–2. SLA en UI y email |
| H6 | Email solo no replica la confianza del contacto humano previo | Entrevista · criterio equipo | Relación vía Leandro; Carlos y teléfono | 3. WhatsApp/email firmado 24–48 h |
| H7 | “Pendiente de revisión” indefinido = proyecto perdido | Real (equipo) | ≥ 3 semanas sin update | 2–5. SLA + actualización automática si se demora |
| H8 | El decisor no necesita visibilidad pública inmediata | Analítico · operación | Brief debe madurar antes de matching | 5. No dashboard público hasta aprobación |
