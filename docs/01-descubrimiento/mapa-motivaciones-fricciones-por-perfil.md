# Mapa de motivaciones y fricciones por perfil de decisor

**Proyecto:** UXFlow — carga de proyecto (No Country)  
**Etapa:** 01 — Descubrimiento  
**Versión:** borrador para validación  
**Fuente:** perfiles de testeo en [`diseno/formulario-inicial/user_profiles/`](../../diseno/formulario-inicial/user_profiles/) (Raquel, Adriana, Carlos, Martín, Ezequiel). Ezequiel incorpora además entrevista en profundidad en esta carpeta.

**Alcance del mapa:** motivaciones y fricciones al **publicar un desafío** (formulario inicial / flujo guiado), más expectativas de **claridad post-envío** cuando el perfil las expresa. No cubre la experiencia completa del ciclo salvo donde el decisor recurrente lo señala.

---

## Resumen ejecutivo

Los cinco perfiles comparten la intención de **resolver un problema real con equipos**, pero divergen en **alfabetización digital**, **tolerancia a la jerga** y **qué les genera confianza** antes de enviar. Las fricciones se agrupan en cuatro ejes: **lenguaje y campos técnicos**, **costo y confianza**, **esfuerzo del formulario** y **qué pasa después del envío**. El diseño del flujo debe permitir completar con poco conocimiento IT (Raquel, Carlos, Adriana) sin frustrar al perfil técnico (Martín) ni al decisor experto en el modelo que exige **brief sólido y visibilidad sobre equipos** (Ezequiel).

---

## Vista comparativa

| Perfil | Rol / rubro | Motivaciones principales | Fricciones principales (formulario y entorno) | Nivel digital |
|--------|-------------|--------------------------|-----------------------------------------------|---------------|
| **Raquel Vera** | Gerente, gastronomía | Vender más y ordenar operación (reservas, clientes) **sin IT propio** ni agencia cara | Jerga (MVP, API, vertical, tools/roles); multiselect confuso; fatiga en textos largos; necesita **progreso visible** y ejemplos de restaurante | Bajo |
| **Adriana López** | Socia, estudio contable | Estandarizar **onboarding y vencimientos** al crecer; probar opciones **accesibles** antes de consultoría | **Costo/trial** ambiguo; “entregables” vs entregables contables; campos tech; formulario largo en una pantalla | Medio (oficio) |
| **Carlos Benitez** | Prof. física, educación | Acercar física al **mundo real** y dar proyectos aplicables en clase | Miedo a **abandono** de equipos; flujo “muy comercial”; verticales ajenas al aula; **datos personales** sin explicación | Medio-bajo (aula) |
| **Martín Gómez** | Co-founder & CTO, IT | Publicar desafíos reales y **evaluar talento**; exigir eficiencia y credibilidad | Formulario **kilométrico** o guiado lento; estimador de tiempo impreciso; copy/opciones **imprecisas** | Alto |
| **Ezequiel Lo Cane** | Innovación, fundación/salud | Desafíos reales (Casa Justina), **MVPs alineados a misión**, feedback continuo con equipos | Brief sin **estructura**; quién publica (revisión vs live); **seguimiento e interacción** post-carga poco anticipados; dependencia de intermediarios en ediciones previas | Medio-alto (producto) |

---

## Mapa por perfil

### Raquel Vera — PYME gastronómica, baja alfabetización IT

**Motivaciones**

- Competir mejor en lo digital con **ideas concretas**, no con un departamento de sistemas.
- Ordenar reservas, pedidos y **fidelización** con ayuda de equipos externos.

**Fricciones**

- Campos y etiquetas técnicas (entregables, vertical, roles, tools) → bloqueo o **elección al azar**.
- Una sola pantalla larga sin guía → sensación de formulario infinito.
- Expectativa limitada: “digitalizar” = redes/delivery, no procesos.

**Señales de éxito (reduce fricción)**

- Copy en lenguaje de negocio; hints por paso; **omitir opcionales** sin penalización; progreso paso X/Y.

---

### Adriana López — PYME en crecimiento (servicios profesionales)

**Motivaciones**

- **Menos errores y retrabajo** al incorporar clientes y cumplir plazos.
- Orden interno (quién hace qué, avisos al cliente) con alternativas **antes de gastar fuerte**.

**Fricciones**

- **Incertidumbre de pago** tras el trial o el envío.
- Confusión semántica: “entregables” de la plataforma vs obligaciones contables.
- Verticales y tools poco familiares; ansiedad si no hay **tiempo estimado** en modo guiado.

**Señales de éxito**

- Claridad early sobre trial, revisión y **sin pago inmediato**; ejemplos de estudios/procesos repetitivos.

---

### Carlos Benitez — Institución educativa

**Motivaciones**

- Proyectos **usables en clase** (experimentación, mediciones, recurso didáctico).
- Conectar currícula con demandas tecnológicas regionales **sin ser experto en software**.

**Fricciones**

- Desconfianza: equipos que **abandonan** y exponen a la institución.
- Tipo de organización y tono **startup/comercial** → pierde confianza.
- Verticales (IA, Web3, etc.) sin puente pedagógico; reticencia a teléfono/datos.

**Señales de éxito**

- Copy docente (alumnos, calendario escolar, entregables acotados); opción **institución educativa** visible.

---

### Martín Gómez — Decisor técnico (consultora / startup IT)

**Motivaciones**

- **Brief técnico-comercial** preciso; desafíos reales + **filtro de talento** en contexto.
- Confirmar **masa crítica** (equipos activos) antes de invertir tiempo.

**Fricciones**

- Pasos redundantes o guiado que no deja **avanzar rápido**.
- Estimador de tiempo vs velocidad real → caída de confianza.
- Inconsistencias en listas (sectores, tools) → percepción de producto poco serio.

**Señales de éxito**

- Opcionales claros, guardado, multiselect usable; post-envío con **SLA de revisión** y próximos pasos.

---

### Ezequiel Lo Cane — Decisor recurrente, innovación social (evidencia entrevista + perfil)

**Motivaciones**

- Modelo No Country **valorado**; repetiría cargar desafíos.
- **MVPs de alto impacto** (p. ej. IA operativa) con alineación temprana decisor–equipo.
- Brief / assessment para que equipos **entiendan el problema** antes de construir.

**Fricciones**

- Proceso histórico ~4–5/10: poca **visibilidad de avance** (leyeron / desarrollando), sin **contacto asíncrono** con equipos.
- Formulario que no guíe **contexto, criterios de éxito y preview del brief**.
- Ambigüedad **enviado → revisión → publicado → matching**; rol de intermediarios.

**Señales de éxito**

- Checklist de brief, expectativas de **Q&A** (sync/async) y dashboard por equipo mencionadas en el flujo o confirmación final.

---

## Patrones transversales

| Patrón | Perfiles más afectados | Dirección de diseño |
|--------|------------------------|---------------------|
| **Jerga y multiselect técnico** | Raquel, Carlos, Adriana | Microcopy, ejemplos por rubro, “omitir” explícito en roles/tools |
| **Confianza económica y legal** | Adriana, Carlos | Trial, revisión, uso de datos, sin sorpresa de pago |
| **Encaje identidad organizacional** | Carlos, Ezequiel | Tipos de org. (educativa, ONG/fundación) y ejemplos de desafíos afines |
| **Eficiencia vs hand-holding** | Martín vs Raquel/Adriana | Guiado con progreso para unos; atajos y opcionales para otros |
| **Vacío post-envío** | Ezequiel, Martín, Adriana | Confirmación: revisión, plazos, qué podrá ver/hacer con equipos después |

---

## Implicaciones prioritarias para el formulario inicial

1. **Unificar lenguaje de “entregables”** con una línea en lenguaje llano (propuesta, prototipo usable, documentación) y, para educación, “para usar en clase”.
2. **Bloque de confianza early** (trial, sin pago al enviar, revisión No Country) — crítico para Adriana y útil para Carlos.
3. **Estructurar el problema/brief** (contexto, qué se espera, qué no es el alcance) — crítico para Ezequiel; beneficia a Martín.
4. **Paso final explícito** sobre próximos pasos y, si aplica en producto futuro, **seguimiento e interacción con equipos** — alinea expectativa del decisor recurrente.
5. **Validar en test moderado** cada perfil según [`user_profiles/README.md`](../../diseno/formulario-inicial/user_profiles/README.md) (métricas: abandono, paso de fricción, comprensión post-envío).

---

## Próximo paso

Validar este mapa con el equipo y, una vez acordado, copiar la versión final a `docs/01-descubrimiento/entregables/` (máx. 2 páginas en formato de presentación si el curso lo exige).

**Documentos relacionados:** [README descubrimiento](./README.md) · [Perfiles UX](../../diseno/formulario-inicial/user_profiles/) · [Contexto del proyecto](../00-contexto/README.md)
