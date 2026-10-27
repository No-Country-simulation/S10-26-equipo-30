-- UXFlow (No Country) — esquema research / testing
-- Alineado a docs/02-testing y tipos en prototipo/src/lib/form-storage.ts

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('tester', 'researcher', 'admin');

create type public.ux_flow_piece as enum (
  'dashboard_publico',
  'formulario_inicial',
  'post_envio',
  'recuperacion_abandonos',
  'contexto_adicional',
  'aprobacion_post_aprobacion'
);

create type public.form_flow_variant as enum ('classic', 'guided');

create type public.test_session_status as enum (
  'in_progress',
  'submitted',
  'abandoned'
);

-- ---------------------------------------------------------------------------
-- Perfiles (Google Auth → auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'tester',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index profiles_role_idx on public.profiles (role);

comment on table public.profiles is
  'Usuario identificado (p. ej. Google). Rol researcher/admin para panel interno.';

-- Invitaciones opcionales: emails autorizados a registrarse en fase research
create table public.tester_invites (
  email text primary key,
  invited_by uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.tester_invites is
  'Allowlist opcional; la app o un hook puede rechazar signup si el email no está listado.';

-- ---------------------------------------------------------------------------
-- Sesiones de test (una corrida por pieza del flujo)
-- ---------------------------------------------------------------------------

create table public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  flow_piece public.ux_flow_piece not null,
  flow_variant public.form_flow_variant,
  status public.test_session_status not null default 'in_progress',
  prototype_version text,
  preview_url text,
  persona_label text,
  moderator_id uuid references public.profiles (id) on delete set null,
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  current_step_id text,
  client_meta jsonb not null default '{}'::jsonb,
  constraint test_sessions_flow_variant_check check (
    flow_piece <> 'formulario_inicial'
    or flow_variant is not null
  )
);

create index test_sessions_user_id_idx on public.test_sessions (user_id);
create index test_sessions_flow_piece_idx on public.test_sessions (flow_piece);
create index test_sessions_status_idx on public.test_sessions (status);
create index test_sessions_started_at_idx on public.test_sessions (started_at desc);

comment on table public.test_sessions is
  'Un intento de testear una pieza UXFlow. formulario_inicial exige flow_variant classic|guided.';
comment on column public.test_sessions.persona_label is
  'Persona ficticia del protocolo (p. ej. Raquel Vera) si aplica.';
comment on column public.test_sessions.client_meta is
  'userAgent, viewport, locale, etc.';

-- ---------------------------------------------------------------------------
-- Envío final del formulario (esquema A + B)
-- ---------------------------------------------------------------------------

create table public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.test_sessions (id) on delete cascade,
  company jsonb not null,
  project jsonb not null,
  submitted_at timestamptz not null default now(),
  constraint project_submissions_company_object check (jsonb_typeof(company) = 'object'),
  constraint project_submissions_project_object check (jsonb_typeof(project) = 'object')
);

create index project_submissions_submitted_at_idx
  on public.project_submissions (submitted_at desc);

comment on table public.project_submissions is
  'Snapshot al enviar. company/project siguen CompanyFormData y ProjectFormData del prototipo.';

-- ---------------------------------------------------------------------------
-- Borradores (abandonos, recuperación, checkpoints)
-- ---------------------------------------------------------------------------

create table public.form_draft_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions (id) on delete cascade,
  company jsonb not null,
  project jsonb not null,
  step_id text,
  capture_reason text not null default 'checkpoint',
  captured_at timestamptz not null default now(),
  constraint form_draft_snapshots_company_object check (jsonb_typeof(company) = 'object'),
  constraint form_draft_snapshots_project_object check (jsonb_typeof(project) = 'object')
);

create index form_draft_snapshots_session_id_idx
  on public.form_draft_snapshots (session_id, captured_at desc);

comment on column public.form_draft_snapshots.capture_reason is
  'checkpoint | step_complete | abandon | visibility_hidden | manual';

-- ---------------------------------------------------------------------------
-- Eventos (telemetría por pieza: pasos, clics, errores, post-envío, emails…)
-- ---------------------------------------------------------------------------

create table public.session_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.test_sessions (id) on delete cascade,
  event_type text not null,
  step_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index session_events_session_id_created_at_idx
  on public.session_events (session_id, created_at);
create index session_events_event_type_idx on public.session_events (event_type);

comment on table public.session_events is
  'Eventos genéricos. Ej.: mode_selected, step_view, step_complete, validation_error, submit, post_envio_view.';

-- ---------------------------------------------------------------------------
-- Notas del moderador (research/tests-usabilidad)
-- ---------------------------------------------------------------------------

create table public.moderation_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  note text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index moderation_notes_session_id_idx on public.moderation_notes (session_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_researcher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('researcher', 'admin')
  );
$$;

create or replace function public.touch_test_session_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.test_sessions
  set last_activity_at = now()
  where id = new.session_id;
  return new;
end;
$$;

create trigger session_events_touch_session
after insert on public.session_events
for each row
execute function public.touch_test_session_activity();

create trigger form_draft_snapshots_touch_session
after insert on public.form_draft_snapshots
for each row
execute function public.touch_test_session_activity();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tester_invites enable row level security;
alter table public.test_sessions enable row level security;
alter table public.project_submissions enable row level security;
alter table public.form_draft_snapshots enable row level security;
alter table public.session_events enable row level security;
alter table public.moderation_notes enable row level security;

-- profiles
create policy "profiles_select_own_or_researcher"
  on public.profiles for select
  using (id = auth.uid() or public.is_researcher());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- tester_invites: solo researchers
create policy "tester_invites_researcher_all"
  on public.tester_invites for all
  using (public.is_researcher())
  with check (public.is_researcher());

-- test_sessions
create policy "test_sessions_insert_own"
  on public.test_sessions for insert
  with check (user_id = auth.uid());

create policy "test_sessions_select_own_or_researcher"
  on public.test_sessions for select
  using (user_id = auth.uid() or public.is_researcher());

create policy "test_sessions_update_own"
  on public.test_sessions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- project_submissions
create policy "project_submissions_insert_own_session"
  on public.project_submissions for insert
  with check (
    exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "project_submissions_select_own_or_researcher"
  on public.project_submissions for select
  using (
    public.is_researcher()
    or exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- form_draft_snapshots
create policy "form_draft_snapshots_insert_own_session"
  on public.form_draft_snapshots for insert
  with check (
    exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "form_draft_snapshots_select_own_or_researcher"
  on public.form_draft_snapshots for select
  using (
    public.is_researcher()
    or exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- session_events
create policy "session_events_insert_own_session"
  on public.session_events for insert
  with check (
    exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "session_events_select_own_or_researcher"
  on public.session_events for select
  using (
    public.is_researcher()
    or exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- moderation_notes
create policy "moderation_notes_insert_researcher"
  on public.moderation_notes for insert
  with check (public.is_researcher() and author_id = auth.uid());

create policy "moderation_notes_select_researcher"
  on public.moderation_notes for select
  using (public.is_researcher());
