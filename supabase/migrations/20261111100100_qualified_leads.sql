-- Pieza 4 — Recuperación de abandonos: toque humano +24 h, persona a persona.
--
-- El sistema NO envía nada a las 24 h. Arma la lista de leads calificados para que
-- alguien del equipo (rol marketing, researcher o admin) los contacte por el canal que
-- le parezca correcto, y registre el contacto para medir el piloto de 30 días.
--
-- Requiere 20261111100000_marketing_role.sql (agrega 'marketing' a app_role).
--
-- Quién está en la lista (public.qualified_leads):
--   · Formulario inicial sin enviar, con borrador guardado.
--   · Última actividad hace más de 24 h y menos de 7 días (mismo tope que el correo +1 h).
--   · No empezó otra carga después (misma regla skipped_superseded del correo).
--   · Cuenta identificada con correo (no invitado) y sin baja de recordatorios.
--   · Interés real: completó la organización (nombre + teléfono + tipo + tamaño, o
--     terminó la pantalla de organización del formulario clásico) o llegó al brief
--     (problema o descripción con 20+ caracteres, o 30+ s en la pregunta de problema o
--     descripción del formulario guiado).
--   · Dejó teléfono o tiene correo de cuenta.

-- ---------------------------------------------------------------------------
-- Quién puede ver leads y registrar contactos
-- ---------------------------------------------------------------------------

create or replace function public.can_contact_leads()
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
      and role::text in ('marketing', 'researcher', 'admin')
  );
$$;

comment on function public.can_contact_leads() is
  'Pieza 4: true para marketing, researcher y admin. Ven la lista de leads calificados y registran contactos.';

revoke all on function public.can_contact_leads() from public, anon;
grant execute on function public.can_contact_leads() to authenticated;

-- ---------------------------------------------------------------------------
-- Contactos persona a persona (seguimiento del piloto)
-- ---------------------------------------------------------------------------

create table public.lead_contacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions (id) on delete cascade,
  contacted_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  contacted_at timestamptz not null default now(),
  channel text not null,
  outcome text not null default 'sin_respuesta',
  note text,
  created_at timestamptz not null default now(),
  constraint lead_contacts_channel_len check (char_length(btrim(channel)) between 1 and 60),
  constraint lead_contacts_outcome_check check (
    outcome in ('sin_respuesta', 'respondio', 'va_a_retomar', 'no_le_interesa', 'otro')
  ),
  constraint lead_contacts_note_len check (note is null or char_length(note) <= 2000)
);

create index lead_contacts_session_id_idx on public.lead_contacts (session_id, contacted_at desc);
create index lead_contacts_contacted_at_idx on public.lead_contacts (contacted_at desc);

comment on table public.lead_contacts is
  'Pieza 4: contacto humano +24 h a un abandono calificado. Una fila por intento; el canal es texto libre.';
comment on column public.lead_contacts.channel is
  'Canal que eligió quien contactó (WhatsApp, correo personal, llamada, LinkedIn…). Texto libre.';
comment on column public.lead_contacts.outcome is
  'sin_respuesta | respondio | va_a_retomar | no_le_interesa | otro';

alter table public.lead_contacts enable row level security;

create policy "lead_contacts_select_staff"
  on public.lead_contacts for select
  to authenticated
  using (public.can_contact_leads());

create policy "lead_contacts_insert_staff"
  on public.lead_contacts for insert
  to authenticated
  with check (public.can_contact_leads() and contacted_by = auth.uid());

create policy "lead_contacts_update_own"
  on public.lead_contacts for update
  to authenticated
  using (public.can_contact_leads() and contacted_by = auth.uid())
  with check (public.can_contact_leads() and contacted_by = auth.uid());

create policy "lead_contacts_delete_own"
  on public.lead_contacts for delete
  to authenticated
  using (public.can_contact_leads() and contacted_by = auth.uid());

revoke all on table public.lead_contacts from anon;

-- ---------------------------------------------------------------------------
-- Lista de leads calificados
-- ---------------------------------------------------------------------------
-- security definer: lee sesiones, borradores y perfiles de todas las personas, pero
-- devuelve filas solo si quien llama es marketing, researcher o admin. Así marketing no
-- necesita permisos de lectura sobre las tablas de research.

create or replace function public.qualified_leads()
returns table (
  session_id uuid,
  user_id uuid,
  account_name text,
  account_email text,
  flow_variant text,
  last_step_id text,
  started_at timestamptz,
  last_activity_at timestamptz,
  recovery_email_status text,
  recovery_email_at timestamptz,
  resumed_draft boolean,
  company_name text,
  organization_type text,
  organization_size text,
  country text,
  phone_dial_code text,
  phone_number text,
  project_title text,
  company_complete boolean,
  brief_written boolean,
  brief_seconds integer,
  interest_score integer,
  contacts_count integer,
  last_contact_at timestamptz,
  last_contact_by text,
  last_contact_channel text,
  last_contact_outcome text,
  last_contact_note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_contact_leads() then
    return;
  end if;

  return query
  with candidates as (
    select s.*
    from public.test_sessions as s
    join public.profiles as p on p.id = s.user_id
    where s.flow_piece = 'formulario_inicial'
      and s.status <> 'submitted'
      and s.last_activity_at <= now() - interval '24 hours'
      and s.last_activity_at >= now() - interval '7 days'
      and btrim(coalesce(p.email, '')) <> ''
      and not p.email_reminders_opt_out
      and not exists (
        select 1 from public.project_submissions as sub where sub.session_id = s.id
      )
      and not exists (
        select 1
        from public.test_sessions as later
        where later.user_id = s.user_id
          and later.flow_piece = 'formulario_inicial'
          and later.started_at > s.started_at
      )
  ),
  latest as (
    select distinct on (d.session_id)
      d.session_id, d.company, d.project, d.step_id
    from public.form_draft_snapshots as d
    where d.session_id in (select c.id from candidates as c)
    order by d.session_id, d.captured_at desc
  ),
  timed_events as (
    select
      e.session_id,
      e.event_type,
      e.step_id,
      e.created_at,
      lead(e.created_at) over (partition by e.session_id order by e.created_at, e.id) as next_at
    from public.session_events as e
    where e.session_id in (select c.id from candidates as c)
  ),
  brief_time as (
    select
      t.session_id,
      max(extract(epoch from (coalesce(t.next_at, c.last_activity_at) - t.created_at)))::integer as seconds
    from timed_events as t
    join candidates as c on c.id = t.session_id
    where t.event_type = 'step_view'
      and t.step_id in ('problem', 'description')
    group by t.session_id
  ),
  signals as (
    select
      c.id,
      c.user_id,
      c.flow_variant::text as flow_variant,
      coalesce(nullif(c.current_step_id, ''), l.step_id) as last_step_id,
      c.started_at,
      c.last_activity_at,
      c.recovery_email_status,
      c.recovery_email_at,
      btrim(coalesce(l.company ->> 'companyName', '')) as company_name,
      btrim(coalesce(l.company ->> 'organizationType', '')) as organization_type,
      btrim(coalesce(l.company ->> 'organizationSize', '')) as organization_size,
      btrim(coalesce(l.company ->> 'country', '')) as country,
      btrim(coalesce(l.company ->> 'phoneDialCode', '')) as phone_dial_code,
      btrim(coalesce(l.company ->> 'phoneNumber', '')) as phone_number,
      btrim(coalesce(l.project ->> 'title', '')) as project_title,
      char_length(regexp_replace(coalesce(l.company ->> 'phoneNumber', ''), '\D', '', 'g')) >= 6 as has_phone,
      (
        char_length(btrim(coalesce(l.project ->> 'problem', ''))) >= 20
        or char_length(btrim(coalesce(l.project ->> 'challengeDescription', ''))) >= 20
      ) as brief_written,
      coalesce(bt.seconds, 0) as brief_seconds,
      exists (
        select 1 from public.session_events as e
        where e.session_id = c.id
          and e.event_type = 'screen_complete'
          and e.step_id = 'compania'
      ) as company_screen_done,
      exists (
        select 1 from public.session_events as e
        where e.session_id = c.id and e.event_type = 'draft_resumed'
      ) as resumed_draft
    from candidates as c
    join latest as l on l.session_id = c.id
    left join brief_time as bt on bt.session_id = c.id
  ),
  scored as (
    select
      sg.*,
      (
        sg.company_screen_done
        or (
          sg.company_name <> ''
          and sg.has_phone
          and sg.organization_type <> ''
          and sg.organization_size <> ''
        )
      ) as company_complete,
      (sg.brief_written or sg.brief_seconds >= 30) as reached_brief
    from signals as sg
  )
  select
    sc.id,
    sc.user_id,
    coalesce(nullif(btrim(p.full_name), ''), split_part(p.email, '@', 1)),
    p.email,
    sc.flow_variant,
    sc.last_step_id,
    sc.started_at,
    sc.last_activity_at,
    sc.recovery_email_status,
    sc.recovery_email_at,
    sc.resumed_draft,
    nullif(sc.company_name, ''),
    nullif(sc.organization_type, ''),
    nullif(sc.organization_size, ''),
    nullif(sc.country, ''),
    nullif(sc.phone_dial_code, ''),
    case when sc.has_phone then sc.phone_number end,
    nullif(sc.project_title, ''),
    sc.company_complete,
    sc.brief_written,
    sc.brief_seconds,
    (
      sc.company_complete::int
      + sc.brief_written::int
      + (sc.brief_seconds >= 30)::int
      + sc.has_phone::int
      + sc.resumed_draft::int
    ),
    coalesce(lc.contacts_count, 0)::integer,
    lc.contacted_at,
    lc.contacted_by_name,
    lc.channel,
    lc.outcome,
    lc.note
  from scored as sc
  join public.profiles as p on p.id = sc.user_id
  left join lateral (
    select
      x.contacted_at,
      coalesce(nullif(btrim(author.full_name), ''), author.email) as contacted_by_name,
      x.channel,
      x.outcome,
      x.note,
      count(*) over () as contacts_count
    from public.lead_contacts as x
    join public.profiles as author on author.id = x.contacted_by
    where x.session_id = sc.id
    order by x.contacted_at desc
    limit 1
  ) as lc on true
  where (sc.company_complete or sc.reached_brief)
    and (sc.has_phone or btrim(coalesce(p.email, '')) <> '')
  order by
    (lc.contacted_at is not null),
    6 - (
      sc.company_complete::int
      + sc.brief_written::int
      + (sc.brief_seconds >= 30)::int
      + sc.has_phone::int
      + sc.resumed_draft::int
    ),
    sc.last_activity_at desc;
end;
$$;

comment on function public.qualified_leads() is
  'Pieza 4: abandonos calificados para contacto humano +24 h. Solo devuelve filas a marketing, researcher o admin.';

revoke all on function public.qualified_leads() from public, anon;
grant execute on function public.qualified_leads() to authenticated;

-- ---------------------------------------------------------------------------
-- Métricas del piloto (30 días)
-- ---------------------------------------------------------------------------
-- Cuenta los contactos y cuántas de esas personas después retomaron el borrador o
-- enviaron un proyecto (en esa sesión o en una nueva).

create or replace function public.lead_contact_summary(days integer default 30)
returns table (
  contacts integer,
  leads_contacted integer,
  resumed_after_contact integer,
  submitted_after_contact integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.can_contact_leads() then
    return;
  end if;

  return query
  with first_contact as (
    select lc.session_id, min(lc.contacted_at) as contacted_at, count(*) as attempts
    from public.lead_contacts as lc
    where lc.contacted_at >= now() - make_interval(days => greatest(days, 1))
    group by lc.session_id
  ),
  outcome as (
    select
      fc.session_id,
      fc.attempts,
      exists (
        select 1 from public.session_events as e
        where e.session_id = fc.session_id
          and e.event_type = 'draft_resumed'
          and e.created_at > fc.contacted_at
      ) as resumed,
      exists (
        select 1
        from public.test_sessions as s
        join public.test_sessions as mine on mine.id = fc.session_id
        join public.project_submissions as sub on sub.session_id = s.id
        where s.user_id = mine.user_id
          and s.flow_piece = 'formulario_inicial'
          and sub.submitted_at > fc.contacted_at
      ) as submitted
    from first_contact as fc
  )
  select
    coalesce(sum(o.attempts), 0)::integer,
    count(*)::integer,
    count(*) filter (where o.resumed)::integer,
    count(*) filter (where o.submitted)::integer
  from outcome as o;
end;
$$;

comment on function public.lead_contact_summary(integer) is
  'Pieza 4: contactos humanos de los últimos N días y cuántos retomaron o enviaron después. Solo para marketing, researcher o admin.';

revoke all on function public.lead_contact_summary(integer) from public, anon;
grant execute on function public.lead_contact_summary(integer) to authenticated;
