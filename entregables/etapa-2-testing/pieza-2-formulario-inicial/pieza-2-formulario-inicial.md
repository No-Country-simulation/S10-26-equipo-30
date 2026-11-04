# Pieza 2 — Formulario inicial (formulario tradicional / preguntas guiadas)

> **Etapa 2 · UXFlow (equipo 30)**
> Estado: decisión de diseño **hipotética**, pendiente de validar con ≥5 usuarios reales sobre la versión mejorada.
>
> ¿Los campos son los correctos? ¿El decisor los completa sin fricción visible? ¿En qué campo abandona o duda? El equipo testa **formulario tradicional** (dos pantallas, campos visibles juntos) y **preguntas guiadas** (una pregunta por paso) para ver cuál genera descripciones de mayor calidad con menor fricción.

---

## Respuesta a las preguntas guía

### ¿Los campos son los correctos?

**Parcialmente.** La lógica de dos bloques (organización + desafío) es acertada y cubre lo que No Country necesita para matchear equipos, pero varios campos **no calzan con todos los decisores** ni capturan bien la calidad del brief:

| Bloque | ¿Sirve? | Problema observado |
|---|---|---|
| Nombre, tipo, tamaño, país | Sí | Copy centrada en **“compañía”**; tipo de organización no alcanza para ONG, escuela o autónomo sin sentirse fuera de lugar (Carlos). |
| Teléfono | Dudoso | Se completa, pero genera **desconfianza** (para qué, quién lo ve) — Carlos. |
| Título + problema | Sí | Invitado 27: **redundante** con “descripción del desafío”. |
| Descripción / desafío | Insuficiente | Una sola caja **no estructura** contexto, criterios de éxito ni restricciones (Ezequiel). |
| Entregables, etapa, impacto | Sí, con reservas | “Entregables” **mal interpretado** fuera de tech (Adriana); etapa (MVP/POC) opaca para no startup. |
| Vertical, sectores, roles, herramientas | Necesarios para matching | Listas **largas, duplicadas ES/EN**, verticales que no representan al negocio (Raquel → FoodTech / Social Media); roles sin filtrar por vertical (Invitado 15). |

**Conclusión:** hace falta **re-etiquetar, acotar listas y estructurar el brief**; no eliminar el matching técnico, pero volverlo opcional o guiado para perfiles no IT.

### ¿El decisor los completa sin fricción visible?

**No de forma consistente.** Quien entra al formulario **suele terminar** (11 envíos de 13 que empezaron ≈ **85 %**), pero la fricción es **visible** en datos y en feedback:

- **Experiencia declarada:** 10/14 **Neutra**, 2 Sencilla, 2 Frustrante — casi nadie describe el flujo como fácil o agradable.
- **Tiempo en pantalla** (`flujo_de_actividad.csv`): lectura prolongada en **problema** (mediana ~18 s), **sectores** (~13 s), **entregables** (~13 s), **descripción del desafío** (~12 s), **herramientas** (~10 s).
- **Correcciones:** 13 eventos de **“volvió atrás”** (p. ej. Alejandro B.: 5; Aracely en vertical/sectores).
- **Perfil importa:** perfiles no IT reportan jerga y listas; Aracely **Frustrante** en formulario tradicional por tecnologías; el CTO simulado completa **con poca fricción** en formulario tradicional.

Hay fricción **cognitiva y de confianza** (costo, “Publicar”, teléfono), no tanto de cantidad de clics una vez elegido el modo.

### ¿En qué campo abandona o duda?

**Abandonos registrados** (empezaron, no enviaron):

| Persona | Último paso observable | Lectura |
|---|---|---|
| **Invitado 20** | Nombre de la compañía (paso 1) — volvió a elegir tipo de formulario | Abandono **muy temprano**; posible duda al elegir **tradicional vs preguntas guiadas** o en el primer campo. |
| **Invitado 17** | Abrió “Detalles del proyecto” tras completar “Información de la compañía”; dudas en **teléfono/país** (volvió atrás) | Abandono al **pasar a la segunda pantalla** (formulario tradicional). |
| **Invitado 18** | Tras **~1 min** en “¿Qué problema quieres resolver?” avanzó a “¿Cómo describirías el desafío?” y **no siguió** | Abandono en **brief** (problema/descripción), no en datos de organización. |

**Dudas y fricción sin abandono** (comentarios + flujo):

1. **Vertical / sectores de negocio** — listas, idioma, rubro inexistente (Raquel, Inv. 27, Aracely vuelve atrás aquí).
2. **Qué esperan que entreguen los equipos** — significado de “entregables” (Adriana); ~28 s máx. en un caso (Inv. 24).
3. **Roles y herramientas** — Aracely, Sylvia; herramientas con tiempos altos (Inv. 15: >1 min).
4. **Problema vs descripción del desafío** — redundancia y tiempo alto (Inv. 14, 15, 18; Alejandro vuelve atrás entre título/descripción).
5. **Teléfono** — Inv. 17 oscila país/teléfono; Carlos pregunta uso y visibilidad.
6. **CTA / expectativa** — duda global costo y revisión (Adriana, Raquel, Inv. 27), no un campo único pero frena al **enviar**.

## (a) Evidencia disponible

**Panel de testing** (`docs/02-testing/`): 28 participantes registrados, **17 envíos** de proyecto y **14 respuestas** de feedback (11 personas distintas).

| Fuente | Qué aporta |
|---|---|
| `proyectos_enviados.csv` | **10** envíos con **formulario tradicional** (en el panel: «Formulario clásico», 2 pantallas) y **7** con **preguntas guiadas** (~16 pasos). Tiempo hasta enviar: tradicional ~2–12 min (mediana ~4 min); preguntas guiadas ~2–6 min (mediana ~3 min). **5 envíos** son simulaciones de perfiles de descubrimiento (`SIM-CURSOR-*`). |
| `feedback.csv` | Experiencia declarada: **10 Neutra**, **2 Sencilla**, **2 Frustrante** (ambas frustrantes en formulario tradicional, por tecnologías). Comentarios extensos en simulaciones (Raquel, Adriana, Carlos, Martín, Ezequiel) y en usuarios reales (Aracely, Sylvia, Invitado 15, etc.). |
| `flujo_de_actividad.csv` | **13** eligieron tipo de formulario y empezaron; **11 completaron envío** (~85 %). **13** eventos de “volvió atrás” (Alejandro B.: 5; Aracely, Invitado 14/17: 2 c/u). Pasos con más tiempo de lectura: **problema a resolver**, **sectores**, **entregables**, **descripción del desafío**, **herramientas/roles**. |
| `testers.csv` | Mezcla invitados anónimos y usuarios con correo; varios abrieron el tablero pero no llegaron a enviar (p. ej. Invitado 17, 18, 20). |
| `esquema-del-formulario-inicial/` | Contrato actual: bloque **información de la organización** y bloque **detalles del proyecto**, incluyendo listas largas de verticales, sectores, roles y herramientas. |

**Comparación formulario tradicional vs preguntas guiadas (síntesis cualitativa)**

- **Formulario tradicional:** preferido por el perfil técnico simulado (CTO): *“menos clics, veo todo junto”*; también las únicas experiencias **“Sencilla”** y las **“Frustrante”** (elección de tecnologías). Invitado 15 pide **filtrar roles según la vertical** (ej. UX → diseño/marketing).
- **Preguntas guiadas:** valoran **progreso y una pregunta por vez** (Raquel, Adriana); todos marcaron **Neutra** — completan, pero no enamora. Más pasos y mismo vocabulario difícil en la mitad del flujo.

---

## (b) Suficiencia de evidencia

**Nivel: Media – Alta**

- Hay **≥5 perfiles con feedback rico** (5 simulaciones alineadas a entrevistas + varios testers reales con texto útil).
- El **embudo dentro del formulario** es sano (alta finalización quien entra), pero la **experiencia percibida es mayormente neutra** y hay fricción repetida en lenguaje, listas y expectativas post-envío.
- **No hay muestra balanceada** ni comparación controlada entre modos; dos usuarios (Aracely, Sylvia) probaron **formulario tradicional y preguntas guiadas** con tiempos distintos según el caso.
- Falta feedback de quien **abandonó** en el paso 1 (Invitado 17, 18, 20) más allá del evento en flujo.

Conclusión: las **preguntas guía del brief** (campos, fricción, abandono, calidad del brief según modo de formulario) quedan **respondidas con evidencia del panel**.

---

## (c) Decisión de diseño recomendada

1. **Tomar el formulario tradicional (2 pantallas) como experiencia principal**, con barra de progreso, estimación de tiempo (~5 min) y ayudas contextuales — sin perder la visión global que pidió el perfil técnico.
2. **Mantener las preguntas guiadas como opción explícita** (“prefiero ir paso a paso”) para perfiles con baja familiaridad tech, reutilizando los mismos textos mejorados en ambos modos.
3. **Lenguaje inclusivo y en español claro:** “organización” / “institución”, glosario breve inline para *vertical*, *MVP*, *POC*, *entregables*; sectores y verticales curadas (sin duplicados ES/EN).
4. **Dejar claro costo cero, revisión y próximos pasos** antes y durante el formulario; el CTA de cierre no debe decir “Publicar” si el flujo es revisión + email.
5. **Brief del desafío estructurado** (contexto, qué necesitás, criterios de éxito, restricciones) — no una sola caja genérica; unificar o diferenciar bien “problema” vs “descripción”.
6. **Confianza y datos:** para qué se pide teléfono, quién lo ve; opciones explícitas para **ONG / fundaciones / educación** y verticales fuera de startup (p. ej. hospitalidad, IoT/robótica).
7. **Listas inteligentes:** roles sugeridos según vertical/sector; herramientas opcionales o “no sé / que lo proponga el equipo” para reducir abandono (Aracely).

---

## (d) Cambios para la versión mejorada

### 1. Dos modos, mismo contenido
- Pantallas **Información de la organización** + **Detalles del desafío** como **formulario tradicional** (default), con **progreso 1/2 – 2/2** y texto fijo: *“100 % gratis · revisamos tu desafío antes de asignar equipos · ~5 min”*.
- En la elección inicial: **“Formulario tradicional (recomendado)”** vs **“Preguntas guiadas (paso a paso)”**, con una línea que explique cuándo conviene cada uno.
- **Guardar borrador** (local o cuenta) y enlace “continuar después”.

### 2. Copy inclusiva y comprensible
- Reemplazar “compañía” por **“nombre de la organización”**; tipos: empresa, startup, **institución educativa**, **ONG / fundación**, autónomo.
- Tooltips de 1 línea en campos técnicos; ejemplos rotativos por perfil (restó, estudio contable, escuela técnica, hospital/trasplantes).
- “Entregables” → **“¿Qué te gustaría recibir del equipo?”** con opciones en castellano (evitar confusión con balances/DDJJ — Adriana).

### 3. Contenido del brief
- Sustituir o complementar la caja única por bloques: **Contexto · Problema · Qué sería un buen resultado · Qué NO hace falta**.
- Si se mantienen “problema” y “descripción”, definir en placeholder la diferencia en una frase.

### 4. Taxonomías y calidad de datos
- Depurar **sectores** (duplicados EdTech/EDTech, HealthTech/Healthtech, Construction/Construcción); tildes (Documentación, Validación).
- Ampliar **verticales** relevantes (p. ej. hospitalidad/restauración, robótica/IoT) o permitir “Otro” con texto.
- **Roles:** precargar subset según vertical elegida (feedback Invitado 15); permitir “Abierto a sugerencias del equipo”.

### 5. Confianza y post-envío (continuidad con pieza 3)
- Banner persistente **sin costo**; microcopy bajo el botón: *“Enviás a revisión; te escribimos por email en X días”*.
- Botón final: **“Enviar desafío a revisión”** (no “Publicar proyecto”).
- Línea sobre **seguimiento**, **cómo responder dudas del equipo** y **propiedad del trabajo** (enlace a FAQ corta).

### 6. Campos sensibles
- Teléfono: **opcional** o con texto *“solo para contacto sobre este desafío”* (Carlos).

---

## (e) Hallazgos

| # | Hallazgo | Fuente | Evidencia | Decisión que lo resuelve |
|---|---|---|---|---|
| H1 | El formulario suena a “empresa startup”, no a escuela, ONG ni pyme local | Simulación · Real | Carlos (docente): *“compañía”, “MVP”, “vertical”*; Raquel (restó) sin ejemplos de su rubro | 2. Copy inclusiva |
| H2 | Jerga en inglés y términos opacos frenan respuestas correctas | Simulación · Real | Raquel, Adriana, Sylvia, Lucas; listas largas de sectores | 2. Glosario y ejemplos |
| H3 | No queda claro si hay costo, revisión o publicación inmediata | Simulación · Real | Adriana, Raquel, Inv. 27: botón “Publicar” vs mensaje de correo | 4–5. Sin costo + CTA “revisión” |
| H4 | “Problema” y “descripción del desafío” se sienten redundantes | Simulación | Invitado 27 (CTO) | 3. Brief estructurado / definición clara |
| H5 | Sectores y verticales generan errores y tiempo extra | Simulación · Flujo | Duplicados y mezcla idiomas (Inv. 27); mediana ~13 s en sectores; Raquel eligió FoodTech/Social Media por falta de opciones | 4. Taxonomías curadas |
| H6 | Roles y herramientas abruman a perfiles no IT | Real · Flujo | Aracely: *“No sabía qué tecnologías usar”* (Frustrante); ~10 s mediana en herramientas | 4. Roles filtrados · herramientas opcionales |
| H7 | Perfil técnico prefiere ver todo el formulario junto | Simulación | Inv. 27: formulario tradicional *“menos clics, veo todo junto”* | 1. Formulario tradicional como default |
| H8 | Perfiles menos técnicos valoran progreso paso a paso | Simulación | Raquel/Adriana: gustó paso y cuánto falta; todos preguntas guiadas = Neutra | 1. Preguntas guiadas como alternativa |
| H9 | El brief debería guiar contexto, éxito y validaciones | Simulación | Ezequiel: caja genérica sin secciones; pide seguimiento y dudas async | 3. Brief estructurado · 5. FAQ/seguimiento |
| H10 | “Entregables” se interpreta mal fuera de tech | Simulación | Adriana lo asocia a documentación contable | 2. Renombrar y ejemplos por sector |
| H11 | Alta completitud una vez dentro, pero experiencia poco positiva | Real (panel) | 11/13 envían; 10/14 feedback “Neutra” | 1–5. Mejoras transversales en ambos modos |
| H12 | Usuarios avanzados piden roles acordes al tipo de proyecto | Real | Invitado 15: filtrar roles si el proyecto es UX | 4. Roles según vertical |
| H13 | Uso del teléfono genera desconfianza | Simulación | Carlos: no claro para qué ni quién lo ve | 6. Transparencia / opcional |
| H14 | Quienes completan igual dudan del después (equipos, propiedad, abandono) | Simulación | Carlos, Ezequiel, Raquel | 5. Expectativas post-envío (puente a pieza 3) |
| H15 | Abandonos se concentran en paso 1, segunda pantalla o brief (problema/descripción) | Real (flujo) | Inv. 20 (nombre); Inv. 17 (detalles del proyecto); Inv. 18 (~1 min en problema) | 3. Brief · 1. Elección tradicional vs guiadas clara |
| H16 | Preguntas guiadas tienden a textos más largos; formulario tradicional a menos fricción para perfil técnico | Real + Sim · `proyectos_enviados` | ~114 vs ~51 caracteres en “Problema”; Inv. 27 vs sims 24–26 | 1. Tradicional + brief estructurado · preguntas guiadas opcional |
