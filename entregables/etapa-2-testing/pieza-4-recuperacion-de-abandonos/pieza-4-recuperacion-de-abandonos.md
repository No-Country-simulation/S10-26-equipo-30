# Pieza 4 — Recuperación de abandonos

> **Etapa 2 · UXFlow (equipo 30)**
> Estado: decisión de diseño **hipotética**, pendiente de validar con ≥5 usuarios reales sobre la versión mejorada.
>
> ¿Un email automático a quien empezó el formulario pero no lo completó genera retorno?  
> ¿Qué copy y qué timing funcionan mejor? Esta pieza puede no implementarse si el volumen de abandonos detectados en el testing es bajo — el equipo decide con datos.

---

## Respuesta a las preguntas guía

### ¿Un email automático genera retorno?

**Hipótesis: sí, pero solo con bajo volumen y señales de intención — no como campaña masiva genérica.**

En el panel de testing (`docs/02-testing/`):

| Métrica | Valor | Lectura |
|---|---|---|
| Abrieron tablero de simulación | **16** | Interés inicial |
| Empezaron el formulario | **13** | Intención más fuerte |
| Enviaron proyecto | **11** | Conversión **~85 %** de quien empezó |
| Abandonaron tras empezar | **3** (Inv. 17, 18, 20) | **~23 %** de quienes iniciaron |
| Abrieron tablero pero **no** empezaron | **8** | Fricción previa al formulario (puente con pieza 1) |

**Volumen absoluto bajo** (3 abandonos claros en fase formulario + 8 que no eligieron modo). No justifica aún un sistema complejo de nurturing multicanal, pero **sí** justifica:

- **Guardado de borrador** + un **recordatorio acotado** para quien llegó al menos al bloque de organización o al brief. ( Estrategia de guardado del borrado para que el usuario no tenga que volver a iniciar de 0 - Revisar politicas de privacidad )
- Priorizar **contacto humano** en abandonos de **alta intención** (mucho tiempo en “problema/descripción”, teléfono cargado) sobre emails a quien solo abrió el tablero.

No tenemos datos de retorno real de emails (no se enviaron en el test); la respuesta es **hipótesis de diseño** condicionada a piloto.

### ¿Qué copy y qué timing?

Propuesta alineada a fricciones de pieza 2 y a la pieza 3 (trato humano):

| Momento | Canal | Copy (idea) | A quién |
|---|---|---|---|
| **+1 h** | Email automático | *“Guardamos tu avance en [organización / título]. Te falta ~X min. Retomar borrador”* | Empezó y tiene snapshot de borrador |
| **+24 h** | Email o WhatsApp **corto firmado** | *“Vi que empezaste a cargar [título]. ¿Te trabó alguna pregunta (sectores, brief)? Respondeme acá”* | Llegó a paso ≥ 6 (brief) o > 3 min en un paso |
| **+72 h** | Email cierre suave | *“El enlace sigue activo 7 días. Si ya no te interesa, no hace falta responder”* | Mismo cohorte; opt-out claro |

**Evitar:** “Completá tu publicación” (refuerza miedo a publicar sin revisión — Adriana, Inv. 27). Preferir **“Terminar de enviar tu desafío a revisión”**.

**Timing:** no enviar a quien **nunca pasó de elegir tipo de formulario** salvo campaña aparte de pieza 1 (dashboard → formulario).

---

## (a) Evidencia disponible

| Fuente | Qué aporta |
|---|---|
| `flujo_de_actividad.csv` | 3 abandonos post-inicio; pasos finales Inv. 17 (detalles proyecto), Inv. 18 (problema/desafío ~1 min), Inv. 20 (nombre + vuelve atrás a elegir modo). 13 eventos “volvió atrás” en completadores (fricción reversible, no abandono). |
| `testers.csv` | 28 registrados vs 11 envíos → fugas en varias etapas del embudo. |
| `feedback.csv` | No hay feedback de Inv. 17/18/20; sí fricciones que explican abandono (jerga, sectores, miedo a “Publicar”). |
| **Pieza 2** | Recomendación **guardar borrador**; campos de mayor duda (vertical, brief, teléfono). |
| **Pieza 3** | Contacto humano post-envío; misma lógica aplicable a **abandonos calificados** (WhatsApp 24 h). |

---

## (b) Suficiencia de evidencia

**Nivel: Baja – Media**

- **Baja** para afirmar que email automático **recupera** conversión (no se pilotó).
- **Media** para decidir **si implementar**: volumen de abandono en formulario es **pequeño pero costoso** (cada lead ya filtró dashboard + eligió modo); recuperar 1 decisor/mes puede valer el esfuerzo operativo ligero.
- **Alta** para descartar **solo** email masivo sin borrador ni personalización.

**Decisión del equipo con datos:** implementar **MVP de recuperación** (borrador + 1 email + regla WhatsApp manual para casos calientes) y medir 30 días; si abandonos < umbral operativo, mantener solo borrador + email +1 h.

---

## (c) Decisión de diseño recomendada

1. **Implementar guardado de borrador** antes que la cadena de emails (sin borrador, el recordatorio no funciona).
2. **Email automático +1 h** con enlace profundo al paso abandonado (prerrequisito técnico).
3. **Un toque humano +24 h** solo para cohorte **alta intención** (reglas abajo), reutilizando playbook pieza 3 — no escalar a todos los invitados anónimos del tablero.
4. **No** implementar secuencias largas (> 3 toques) hasta tener volumen que lo justifique.
5. Tratar abandonos **antes** de empezar formulario como **pieza 1** (CTA dashboard), no como pieza 4.

**Reglas de alta intención (piloto humano):**

- Completó organización **o** ≥ 30 s en “problema” / “descripción”.
- Dejó teléfono **o** email de cuenta.
- No marcó “solo probando” (si se agrega checkbox opcional en test).

---

## (d) Cambios para la versión mejorada

### 1. Producto
- Autoguardado cada N segundos + banner *“Borrador guardado — te enviamos el enlace por email”*.
- Deep link al paso exacto (Inv. 18: brief; Inv. 17: pantalla 2 tradicional).
- Exit intent suave al cerrar pestaña: *“¿Querés que te mandemos el link para continuar?”*

### 2. Email +1 h (automático)
- Asunto: *“Tu desafío para [organización] — te faltan ~X min”*.
- Un CTA: **Continuar formulario**.
- Mencionar **revisión gratuita**, no “publicar”.

### 3. WhatsApp / email firmado +24 h (operación ligera)
- Lista diaria de abandonos calificados para volunteer del programa.
- Script: ofrecer ayuda con **una** pregunta concreta según último paso (sectores vs brief).

### 4. Métricas (30 días piloto)
- Tasa retorno borrador (click → envío).
- Abandonos/semana vs recuperados.
- Si recuperación < 10 % y volumen < 5/semana → pausar +24 h humano y mantener solo +1 h.

### 5. Lo que no hacemos en v1
- Secuencia de 5 emails tipo marketing.
- Remarketing a quien solo abrió el tablero sin empezar (bajo ROI; pieza 1).

---

## (e) Hallazgos

| # | Hallazgo | Fuente | Evidencia | Decisión que lo resuelve |
|---|---|---|---|---|
| H1 | Quien empieza el formulario suele terminar; el abandono es minoría pero no cero | Flujo | 11/13 envían; 3 abandonos | MVP recuperación, no suite enterprise |
| H2 | Abandonos se agrupan en **paso 1**, **pantalla 2** o **brief** | Flujo | Inv. 20, 17, 18 | Deep link + copy por paso |
| H3 | Volumen total de abandonos en test es **bajo** | Panel | 3 explícitos + 8 tablero sin inicio | Piloto medido; reglas de alta intención |
| H4 | Copy “publicar” puede frenar retorno | Sim · pieza 2 | Adriana, Inv. 27 | “Enviar a revisión” en emails |
| H5 | Sin borrador, recuperación es casi imposible | Heurística · pieza 2 | No hay snapshot en producto actual | 1. Autoguardado primero |
| H6 | Contacto humano coherente con post-envío (pieza 3) | Diseño | Ezequiel / Leandro; WhatsApp en UI | 3. Toque humano 24 h calificado |
| H7 | Mucha fuga ocurre **antes** de empezar formulario | Flujo | 8 con tablero sin “Empezó la prueba” | Pieza 1, no pieza 4 |
