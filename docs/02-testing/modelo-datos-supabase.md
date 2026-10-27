# Modelo de datos Supabase (testing UXFlow)

Documento de referencia para el equipo. La migración ejecutable está en [`supabase/migrations/`](../../supabase/migrations/).

## Objetivo

Una sola base Postgres (Supabase) que soporte **todas las piezas** del flujo en etapa 2, empezando por formulario A/B y creciendo hacia post-envío, abandonos y post-aprobación, sin rediseñar el esquema cada sprint.

## Entidades

### `profiles`

Extiende `auth.users` (Google u otro provider). Campo `role`:

- `tester` — participante por defecto
- `researcher` — lee todas las sesiones, escribe notas
- `admin` — igual que researcher (reservado)

### `test_sessions`

Una **corrida** de test. Campos clave:

| Campo | Uso |
|-------|-----|
| `flow_piece` | Cuál de las 6 piezas se evalúa |
| `flow_variant` | `classic` \| `guided` (obligatorio si `flow_piece = formulario_inicial`) |
| `status` | `in_progress` → `submitted` o `abandoned` |
| `prototype_version` | Commit Git o ID de deploy Vercel |
| `persona_label` | Persona del protocolo (opcional) |
| `moderator_id` | Researcher que modera (opcional) |
| `current_step_id` | Último paso guiado conocido |

### `project_submissions`

Un registro por sesión que **completó** el envío del formulario. JSON alineado al prototipo.

### `form_draft_snapshots`

Copias intermedias para **recuperación de abandonos** y análisis de “dónde quedó”. `capture_reason` distingue checkpoint automático vs abandono.

### `session_events`

Telemetría flexible; evita crear una tabla por cada micro-interacción del dashboard o emails futuros.

### `moderation_notes`

Paralelo a `research/tests-usabilidad/`: observaciones ligadas a `session_id`.

### `tester_invites`

Allowlist opcional para fase cerrada de tests.

## Consultas útiles (research)

**Envíos por variante (formulario):**

```sql
select flow_variant, count(*) as envios
from public.test_sessions s
join public.project_submissions p on p.session_id = s.id
where s.flow_piece = 'formulario_inicial'
group by flow_variant;
```

**Último paso antes de abandonar (guiado):**

```sql
select s.id, s.current_step_id, max(e.created_at) as last_event
from public.test_sessions s
left join public.session_events e on e.session_id = s.id
where s.status = 'abandoned'
group by s.id, s.current_step_id;
```

**Sesiones de un tester:**

```sql
select s.*, p.submitted_at
from public.test_sessions s
left join public.project_submissions p on p.session_id = s.id
join public.profiles pr on pr.id = s.user_id
where pr.email = 'participante@example.com'
order by s.started_at desc;
```

## Crear el ambiente

Guía operativa: [`supabase/SETUP.md`](../../supabase/SETUP.md).

## Próximo paso técnico (fuera de este doc)

1. Aplicar migración en proyecto Supabase del equipo (ver SETUP.md).
2. Promover emails del equipo a `researcher`.
3. Integrar en `prototipo/` (auth + crear sesión + eventos + submit) — iteración siguiente.
