-- Pieza 5 — Lead scoring pre-envío: prioridad de revisión y bandas (caliente / templado / frío).
-- El puntaje se calcula al insertar en project_submissions (submit), antes de contacto post-envío.

-- ---------------------------------------------------------------------------
-- Columnas en el envío
-- ---------------------------------------------------------------------------

alter table public.project_submissions
  add column if not exists pre_submit_score integer not null default 0,
  add column if not exists pre_submit_band text not null default 'frio',
  add column if not exists score_breakdown jsonb not null default '[]'::jsonb;

alter table public.project_submissions
  drop constraint if exists project_submissions_pre_submit_band_check;

alter table public.project_submissions
  add constraint project_submissions_pre_submit_band_check check (
    pre_submit_band in ('caliente', 'templado', 'frio')
  );

create index if not exists project_submissions_review_queue_idx
  on public.project_submissions (pre_submit_score desc, submitted_at asc);

comment on column public.project_submissions.pre_submit_score is
  'Pieza 5: puntaje v1 al enviar (formulario + telemetría de la sesión).';
comment on column public.project_submissions.pre_submit_band is
  'Pieza 5: caliente (≥55) | templado (30–54) | frío (<30).';
comment on column public.project_submissions.score_breakdown is
  'Pieza 5: array JSON [{criterion, points}, …] para el panel del revisor.';

-- ---------------------------------------------------------------------------
-- Overrides operativos (forzar call / subir prioridad)
-- ---------------------------------------------------------------------------

create table public.submission_review_flags (
  submission_id uuid primary key references public.project_submissions (id) on delete cascade,
  force_call boolean not null default false,
  priority_bump boolean not null default false,
  note text,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint submission_review_flags_note_len check (note is null or char_length(note) <= 2000)
);

comment on table public.submission_review_flags is
  'Pieza 5: decisiones del revisor que no recalculan el formulario (call forzada, subir en cola).';

alter table public.submission_review_flags enable row level security;

create policy "submission_review_flags_select_researcher"
  on public.submission_review_flags for select
  to authenticated
  using (public.is_researcher());

create policy "submission_review_flags_insert_researcher"
  on public.submission_review_flags for insert
  to authenticated
  with check (public.is_researcher());

create policy "submission_review_flags_update_researcher"
  on public.submission_review_flags for update
  to authenticated
  using (public.is_researcher())
  with check (public.is_researcher());

revoke all on table public.submission_review_flags from anon;

-- ---------------------------------------------------------------------------
-- Modelo de puntuación v1 (entregable pieza 5)
-- ---------------------------------------------------------------------------

create or replace function public.compute_pre_submit_score(
  p_session_id uuid,
  p_company jsonb,
  p_project jsonb,
  p_submitted_at timestamptz default now()
)
returns table (
  score integer,
  band text,
  breakdown jsonb
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_score integer := 0;
  v_breakdown jsonb := '[]'::jsonb;
  v_started_at timestamptz;
  v_total_seconds integer;
  v_brief_seconds integer;
  v_problem text;
  v_description text;
  v_title text;
  v_title_lower text;
  v_org text;
  v_vertical text;
  v_sectors_text text;
  v_has_email boolean;
  v_has_phone boolean;
  v_generic_title boolean;
  v_test_like boolean;
  v_high_mission_org boolean;
  v_high_complexity boolean;
  v_structured_brief boolean;
  v_matching_ok boolean;
  v_points integer;
begin
  select s.started_at into v_started_at
  from public.test_sessions as s
  where s.id = p_session_id;

  v_problem := btrim(coalesce(p_project ->> 'problem', ''));
  v_description := btrim(coalesce(p_project ->> 'challengeDescription', ''));
  v_title := btrim(coalesce(p_project ->> 'title', ''));
  v_title_lower := lower(v_title);
  v_org := btrim(coalesce(p_company ->> 'organizationType', ''));
  v_vertical := lower(btrim(coalesce(p_project ->> 'vertical', '')));

  select string_agg(lower(btrim(value)), ' ')
  into v_sectors_text
  from jsonb_array_elements_text(coalesce(p_project -> 'sectors', '[]'::jsonb)) as value;

  v_has_phone :=
    char_length(regexp_replace(coalesce(p_company ->> 'phoneNumber', ''), '\D', '', 'g')) >= 6;

  select
    btrim(coalesce(p.email, '')) like '%@%'
    and coalesce(p.full_name, '') not like 'Invitado %'
  into v_has_email
  from public.test_sessions as s
  join public.profiles as p on p.id = s.user_id
  where s.id = p_session_id;

  v_has_email := coalesce(v_has_email, false);

  v_generic_title := v_title = ''
    or char_length(v_title) < 4
    or v_title_lower in (
      'test', 'mi proyecto', 'proyecto', 'asdf', 'prueba', 'aaaa', 'xxx', '123', '1234'
    )
    or v_title_lower ~ '^(test|asdf|prueba)\b';

  v_test_like := v_title_lower ~ '(^|[\s_-])(test|asdf|prueba)([\s_-]|$)'
    or lower(v_problem) ~ '(^|[\s_-])(test|asdf)([\s_-]|$)'
    or char_length(v_problem) < 20;

  v_high_mission_org := v_org in ('ONG', 'Institucion educativa');

  v_high_complexity := v_vertical ~ '(iot|logística|logistica|salud|supply)'
    or coalesce(v_sectors_text, '') ~ '(iot|logística|logistica|salud|supply chain)';

  v_structured_brief :=
    char_length(v_description) >= 80
    or (
      jsonb_array_length(coalesce(p_project -> 'deliverables', '[]'::jsonb)) > 0
      and jsonb_array_length(coalesce(p_project -> 'sectors', '[]'::jsonb)) > 0
      and jsonb_array_length(coalesce(p_project -> 'roles', '[]'::jsonb)) > 0
      and btrim(coalesce(p_project ->> 'impact', '')) <> ''
      and btrim(coalesce(p_project ->> 'stage', '')) <> ''
    );

  v_matching_ok :=
    jsonb_array_length(coalesce(p_project -> 'deliverables', '[]'::jsonb)) > 0
    and jsonb_array_length(coalesce(p_project -> 'sectors', '[]'::jsonb)) > 0
    and jsonb_array_length(coalesce(p_project -> 'roles', '[]'::jsonb)) > 0;

  if char_length(v_problem) >= 120 then
    v_points := 15;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Problema con contexto (≥120 caracteres)',
      'points', v_points
    ));
  end if;

  if v_structured_brief then
    v_points := 15;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Descripción o brief estructurado completo',
      'points', v_points
    ));
  end if;

  if not v_generic_title and char_length(v_title) >= 8 then
    v_points := 10;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Título específico al dominio',
      'points', v_points
    ));
  end if;

  if v_high_mission_org then
    v_points := 10;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Organización de misión (ONG o institución educativa)',
      'points', v_points
    ));
  end if;

  if v_high_complexity then
    v_points := 10;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Sector o vertical de alta complejidad',
      'points', v_points
    ));
  end if;

  if v_started_at is not null then
    v_total_seconds := greatest(0, extract(epoch from (p_submitted_at - v_started_at))::integer);
    if v_total_seconds between 120 and 720 then
      v_points := 10;
      v_score := v_score + v_points;
      v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
        'criterion', 'Tiempo total de envío entre ~2 y ~12 min',
        'points', v_points
      ));
    elsif v_total_seconds < 60 then
      v_points := -20;
      v_score := v_score + v_points;
      v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
        'criterion', 'Envío muy rápido (<60 s)',
        'points', v_points
      ));
    end if;
  end if;

  with timed_events as (
    select
      e.event_type,
      e.step_id,
      e.created_at,
      lead(e.created_at) over (order by e.created_at, e.id) as next_at
    from public.session_events as e
    where e.session_id = p_session_id
  ),
  step_seconds as (
    select coalesce(sum(
      extract(epoch from (coalesce(t.next_at, p_submitted_at) - t.created_at))
    ), 0)::integer as seconds
    from timed_events as t
    where t.event_type = 'step_view'
      and t.step_id in ('problem', 'description', 'deliverables')
  ),
  classic_seconds as (
    select coalesce(sum(
      extract(epoch from (coalesce(t.next_at, p_submitted_at) - t.created_at))
    ), 0)::integer as seconds
    from timed_events as t
    where t.event_type = 'screen_view'
      and t.step_id = 'detalles'
  )
  select greatest(s1.seconds, s2.seconds)
  into v_brief_seconds
  from step_seconds as s1, classic_seconds as s2;

  v_brief_seconds := coalesce(v_brief_seconds, 0);

  if v_brief_seconds >= 60 then
    v_points := 10;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', '≥60 s en problema, descripción o entregables',
      'points', v_points
    ));
  end if;

  if v_has_phone then
    v_points := 5;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Teléfono válido cargado',
      'points', v_points
    ));
  end if;

  if v_has_email then
    v_points := 5;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Cuenta con correo identificable',
      'points', v_points
    ));
  end if;

  if v_matching_ok then
    v_points := 5;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Matching coherente (roles, sectores, entregables)',
      'points', v_points
    ));
  end if;

  if v_test_like then
    v_points := -30;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Título o problema de prueba',
      'points', v_points
    ));
  end if;

  if char_length(v_problem) > 0 and char_length(v_problem) < 40 then
    v_points := -15;
    v_score := v_score + v_points;
    v_breakdown := v_breakdown || jsonb_build_array(jsonb_build_object(
      'criterion', 'Problema muy corto (<40 caracteres)',
      'points', v_points
    ));
  end if;

  if v_score >= 55 then
  band := 'caliente';
  elsif v_score >= 30 then
  band := 'templado';
  else
  band := 'frio';
  end if;

  score := v_score;
  breakdown := v_breakdown;
  return next;
end;
$$;

comment on function public.compute_pre_submit_score(uuid, jsonb, jsonb, timestamptz) is
  'Pieza 5: calcula puntaje, banda y desglose para un envío (v1 hipotética).';

revoke all on function public.compute_pre_submit_score(uuid, jsonb, jsonb, timestamptz) from public, anon;
grant execute on function public.compute_pre_submit_score(uuid, jsonb, jsonb, timestamptz) to authenticated;

create or replace function public.project_submissions_set_pre_submit_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
begin
  select * into v_row
  from public.compute_pre_submit_score(
    new.session_id,
    new.company,
    new.project,
    coalesce(new.submitted_at, now())
  );

  new.pre_submit_score := v_row.score;
  new.pre_submit_band := v_row.band;
  new.score_breakdown := v_row.breakdown;
  return new;
end;
$$;

drop trigger if exists project_submissions_pre_submit_score on public.project_submissions;

create trigger project_submissions_pre_submit_score
  before insert on public.project_submissions
  for each row
  execute function public.project_submissions_set_pre_submit_score();

-- Rellenar envíos ya existentes (panel de research / pruebas previas).
update public.project_submissions as ps
set
  pre_submit_score = scored.score,
  pre_submit_band = scored.band,
  score_breakdown = scored.breakdown
from (
  select
    sub.id,
    c.score,
    c.band,
    c.breakdown
  from public.project_submissions as sub
  cross join lateral public.compute_pre_submit_score(
    sub.session_id,
    sub.company,
    sub.project,
    sub.submitted_at
  ) as c
) as scored
where ps.id = scored.id;

-- ---------------------------------------------------------------------------
-- Cola de revisión (orden: score + bump, luego fecha)
-- ---------------------------------------------------------------------------

create or replace function public.submission_review_queue()
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

create or replace function public.set_submission_review_flags(
  p_submission_id uuid,
  p_force_call boolean,
  p_priority_bump boolean,
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

  if not exists (select 1 from public.project_submissions where id = p_submission_id) then
    raise exception 'submission_not_found';
  end if;

  insert into public.submission_review_flags (
    submission_id,
    force_call,
    priority_bump,
    note,
    updated_by,
    updated_at
  )
  values (
    p_submission_id,
    p_force_call,
    p_priority_bump,
    nullif(btrim(p_note), ''),
    auth.uid(),
    now()
  )
  on conflict (submission_id) do update
  set
    force_call = excluded.force_call,
    priority_bump = excluded.priority_bump,
    note = excluded.note,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;
end;
$$;

comment on function public.set_submission_review_flags(uuid, boolean, boolean, text) is
  'Pieza 5: override del revisor (call forzada, subir prioridad en cola).';

revoke all on function public.set_submission_review_flags(uuid, boolean, boolean, text) from public, anon;
grant execute on function public.set_submission_review_flags(uuid, boolean, boolean, text) to authenticated;
