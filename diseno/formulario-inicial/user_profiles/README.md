# Perfiles de usuario — formulario inicial (testeo UX/UI)

Personas ficticias para **tests moderados** del flujo de carga de proyecto, con foco en la variante **preguntas guiadas** (`/cargar-proyecto/guiado` en el prototipo). Cada archivo describe contexto, nivel digital, escenario narrado y datos orientativos para simular una carga realista.

Esquema de campos del formulario: [docs/02-testing/esquema-del-formulario-inicial/](../../../docs/02-testing/esquema-del-formulario-inicial/).

## Perfiles

| Persona | Archivo | Rol clave en el test |
|---------|---------|----------------------|
| Raquel Vera | [RaquelVera.md](./RaquelVera.md) | Baja alfabetización IT; validar lenguaje, hints y pasos sin jerga |
| Adriana López | [AdrianaLopez.md](./AdrianaLopez.md) | PYME en crecimiento; validar claridad de costo/trial y “entregables” |
| Carlos Benitez | [CarlosBenitez.md](./CarlosBenitez.md) | Institución educativa; validar confianza y copy pedagógico |
| Martín Gómez | [MartinGomez.md](./MartinGomez.md) | Perfil técnico exigente; validar eficiencia, credibilidad y multiselect |
| Ezequiel Lo Cane | [EzequielLoCane.md](./EzequielLoCane.md) | Decisor recurrente (fundación/innovación); validar brief, post-envío y expectativas de seguimiento con equipos |

## Antes de la sesión

1. **Entorno:** preview de Vercel (logueado si el proyecto tiene Deployment Protection) o `npm run dev` en `prototipo/`.
2. **Dispositivo:** anotar desktop vs móvil; probar al menos Raquel y Adriana en móvil si el público objetivo incluye PYMEs.
3. **Estado limpio:** ventana de incógnito o borrar `sessionStorage` del sitio para no arrastrar borradores entre participantes.
4. **Rol del moderador:** no completar por la persona salvo que el test sea explícitamente “con ayuda”. Solo intervenir si se bloquea >2 minutos o pide definición de un término.

## Guion sugerido (30–45 min)

### Intro (5 min)

- Presentar el escenario del perfil (leer en voz alta el **problema que llevaría al formulario**, sin mostrar aún la tabla de datos orientativos).
- Pregunta inicial: *“¿Qué esperás lograr al publicar un desafío acá?”* (capturar expectativas en sus palabras).

### Tarea principal (20–30 min)

**Objetivo:** completar la carga de proyecto desde la landing o desde Free Trial → **Siguiente** hasta la pantalla de **proyecto enviado**.

Instrucción estándar:

> “Imaginá que tu organización es la del relato. Querés publicar este problema para que equipos trabajen en una solución. Usá la plataforma como lo harías en la vida real; pensá en voz alta.”

**Variantes opcionales (rotar entre sesiones):**

| Variante | Hipótesis |
|----------|-----------|
| Solo guiado | ¿El progreso (paso X/Y, tiempo restante) reduce abandono en perfiles no técnicos? |
| Comparación A/B | Misma persona en otro día: guiado vs formulario clásico (si sigue disponible en la rama) — solo si el protocolo lo permite |
| Con interrupción | Cerrar pestaña en paso 5–7 y volver: ¿recupera borrador y paso? |

### Cierre (5–10 min)

- Escala 1–5: claridad, confianza, esfuerzo percibido.
- *“¿En qué paso casi abandonás? ¿Por qué?”*
- *“¿Entendés qué pasa después de enviar?”*

## Qué anotar (métricas y observaciones)

Registrar por sesión en la plantilla que use el equipo (Notion, sheet, doc en `docs/02-testing/`):

| Métrica | Cómo medirla |
|---------|----------------|
| **Tiempo total** | Desde “Siguiente” en Free Trial hasta confirmación de envío |
| **Tiempo por paso** | Opcional; especialmente pasos con multiselect o textarea |
| **Pasos con fricción** | Número de paso + campo; duda verbal, error, cambio atrás |
| **Abandono** | Sí/No; paso exacto |
| **Completitud opcionales** | Roles/tools omitidos o rellenados al azar |
| **Comprensión post-envío** | ¿Resume correctamente revisión / aprobación / contacto? |
| **SUS o UMUX-lite** | Opcional si el protocolo de `02-testing` lo define |

**Señales cualitativas por persona:**

- **Raquel:** términos que no entiende; si los hints ayudan; elección aleatoria en vertical/tools.
- **Adriana:** menciones de dinero/plan; confusión “entregables” contables vs plataforma.
- **Carlos:** confianza en datos personales; encaje “institución educativa” vs copy comercial.
- **Martín:** comentarios sobre precisión de opciones, tiempo estimado vs real, credibilidad del producto.
- **Ezequiel:** si el formulario anticipa seguimiento e interacción con equipos; claridad al armar el brief; comparación con experiencia previa (visibilidad limitada, dependencia de intermediarios).

## Criterios de éxito del flujo (referencia)

No son KPI de negocio; son metas de usabilidad para esta pieza:

1. Perfiles **Raquel** y **Adriana** completan sin ayuda del moderador en &lt; tiempo estimado mostrado + 50%, o explican claramente por qué no.
2. Ningún participante cree que **debe pagar** al enviar en trial (salvo copy explícito futuro).
3. Al menos **3/4** entienden el siguiente paso post-envío (revisión No Country).
4. **Martín** no califica el flujo como “pérdida de tiempo” por pasos obligatorios redundantes (validar copy en opcionales “Omitir”).

## Ética y datos

- Los participantes **no son** Raquel/Carlos/etc.; son actores del rol. No usar datos personales reales en el prototipo.
- Los teléfonos y nombres de empresa pueden ser ficticios (ej. “Restó La Esquina”, “Estudio López & Asoc.”).
- Grabación de pantalla/audio: solo con consentimiento explícito.

## Enlaces útiles

- Prototipo local: `prototipo/` → `npm run dev` → `/cargar-proyecto`
- Flujo guiado: `/cargar-proyecto/guiado`
- Capturas de referencia UI: [../img/](../img/) y raíz `formulario-inicial`
