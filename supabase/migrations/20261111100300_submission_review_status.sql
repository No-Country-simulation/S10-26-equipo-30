-- Pieza 5 — Estado operativo de revisión + detalle para el panel del revisor.

alter table public.project_submissions
  add column if not exists review_status text not null default 'en_revision',
  add column if not exists review_status_note text,
  add column if not exists review_status_updated_at timestamptz,
  add column if not exists review_status_updated_by uuid references public.profiles (id) on delete set null;

alter table public.project_submissions
  drop constraint if exists project_submissions_review_status_check;

alter table public.project_submissions
  add constraint project_submissions_review_status_check check (
    review_status in (
      'en_revision',
      'brief_enriquecido',
      'necesita_ajustes',
      'aprobado',
      'rechazado'
    )
  );

alter table public.project_submissions
  drop constraint if exists project_submissions_review_status_note_len;

alter table public.project_submissions
  add constraint project_submissions_review_status_note_len check (
    review_status_note is null or char_length(review_status_note) <= 2000
  );

comment on column public.project_submissions.review_status is
  'Estado visible para el decisor y el equipo: en_revision | brief_enriquecido | necesita_ajustes | aprobado | rechazado.';
comment on column public.project_submissions.review_status_note is
  'Nota interna o mensaje breve al decisor asociado al último cambio de estado.';

-- ---------------------------------------------------------------------------
-- Detalle completo para el panel de revisión
-- ---------------------------------------------------------------------------

create or replace function public.submission_review_detail(p_submission_id uuid)
returns table (
  submission_id uuid,
  session_id uuid,
  submitted_at timestamptz,
  company jsonb,
  project jsonb,
  pre_submit_score integer,
  pre_submit_band text,
  score_breakdown jsonb,
  review_status text,
  review_status_note text,
  review_status_updated_at timestamptz,
  account_name text,
  account_email text,
  is_guest boolean,
  flow_variant text,
  session_started_at timestamptz,
  force_call boolean,
  priority_bump boolean,
  flags_note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_researcher() then
    return;
  end if;

  return query
  select
    sub.id,
    sub.session_id,
    sub.submitted_at,
    sub.company,
    sub.project,
    sub.pre_submit_score,
    sub.pre_submit_band,
    sub.score_breakdown,
    sub.review_status,
    sub.review_status_note,
    sub.review_status_updated_at,
    coalesce(nullif(btrim(p.full_name), ''), split_part(p.email, '@', 1)),
    nullif(btrim(p.email), ''),
    (
      btrim(coalesce(p.email, '')) = ''
      or coalesce(p.full_name, '') like 'Invitado %'
    ),
    s.flow_variant::text,
    s.started_at,
    coalesce(f.force_call, false),
    coalesce(f.priority_bump, false),
    f.note
  from public.project_submissions as sub
  join public.test_sessions as s on s.id = sub.session_id
  join public.profiles as p on p.id = s.user_id
  left join public.submission_review_flags as f on f.submission_id = sub.id
  where sub.id = p_submission_id;
end;
$$;

comment on function public.submission_review_detail(uuid) is
  'Pieza 5: ficha completa de un envío para el revisor (company + project JSON).';

revoke all on function public.submission_review_detail(uuid) from public, anon;
grant execute on function public.submission_review_detail(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Cambio de estado
-- ---------------------------------------------------------------------------

create or replace function public.set_submission_review_status(
  p_submission_id uuid,
  p_review_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_researcher() then
    raise exception 'not_allowed';
  end if;

  if p_review_status not in (
    'en_revision',
    'brief_enriquecido',
    'necesita_ajustes',
    'aprobado',
    'rechazado'
  ) then
    raise exception 'invalid_review_status';
  end if;

  update public.project_submissions
  set
    review_status = p_review_status,
    review_status_note = nullif(btrim(p_note), ''),
    review_status_updated_at = now(),
    review_status_updated_by = auth.uid()
  where id = p_submission_id;

  if not found then
    raise exception 'submission_not_found';
  end if;
end;
$$;

comment on function public.set_submission_review_status(uuid, text, text) is
  'Pieza 5: actualiza el estado de revisión de un envío.';

revoke all on function public.set_submission_review_status(uuid, text, text) from public, anon;
grant execute on function public.set_submission_review_status(uuid, text, text) to authenticated;

-- Cola: incluir estado de revisión (hay que dropear: cambia el OUT de returns table).
drop function if exists public.submission_review_queue();

create function public.submission_review_queue()
returns table (
  submission_id uuid,
  session_id uuid,
  submitted_at timestamptz,
  pre_submit_score integer,
  pre_submit_band text,
  score_breakdown jsonb,
  sort_score integer,
  account_name text,
  account_email text,
  is_guest boolean,
  flow_variant text,
  company_name text,
  organization_type text,
  country text,
  phone_dial_code text,
  phone_number text,
  project_title text,
  problem_excerpt text,
  review_status text,
  force_call boolean,
  priority_bump boolean,
  flags_note text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_researcher() then
    return;
  end if;

  return query
  select
    sub.id,
    sub.session_id,
    sub.submitted_at,
    sub.pre_submit_score,
    sub.pre_submit_band,
    sub.score_breakdown,
    sub.pre_submit_score + case when coalesce(f.priority_bump, false) then 1000 else 0 end,
    coalesce(nullif(btrim(p.full_name), ''), split_part(p.email, '@', 1)),
    nullif(btrim(p.email), ''),
    (
      btrim(coalesce(p.email, '')) = ''
      or coalesce(p.full_name, '') like 'Invitado %'
    ),
    s.flow_variant::text,
    nullif(btrim(sub.company ->> 'companyName'), ''),
    nullif(btrim(sub.company ->> 'organizationType'), ''),
    nullif(btrim(sub.company ->> 'country'), ''),
    nullif(btrim(sub.company ->> 'phoneDialCode'), ''),
    case
      when char_length(regexp_replace(coalesce(sub.company ->> 'phoneNumber', ''), '\D', '', 'g')) >= 6
      then nullif(btrim(sub.company ->> 'phoneNumber'), '')
    end,
    nullif(btrim(sub.project ->> 'title'), ''),
    left(nullif(btrim(sub.project ->> 'problem'), ''), 280),
    sub.review_status,
    coalesce(f.force_call, false),
    coalesce(f.priority_bump, false),
    f.note
  from public.project_submissions as sub
  join public.test_sessions as s on s.id = sub.session_id
  join public.profiles as p on p.id = s.user_id
  left join public.submission_review_flags as f on f.submission_id = sub.id
  order by
    sub.pre_submit_score + case when coalesce(f.priority_bump, false) then 1000 else 0 end desc,
    sub.submitted_at asc;
end;
$$;

comment on function public.submission_review_queue() is
  'Pieza 5: cola de proyectos enviados para el revisor, ordenada por score pre-envío.';

revoke all on function public.submission_review_queue() from public, anon;
grant execute on function public.submission_review_queue() to authenticated;
