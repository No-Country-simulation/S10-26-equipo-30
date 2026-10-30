-- Opinión después de publicar el proyecto.
-- No es un paso del formulario: no genera session_events y no entra en el análisis del recorrido.
-- Queda ligada a la sesión, y por esa sesión al flujo (classic | guided).

create type public.experience_rating as enum ('sencilla', 'neutra', 'frustrante');

create table public.session_experience_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.test_sessions (id) on delete cascade,
  rating public.experience_rating not null,
  comment text,
  created_at timestamptz not null default now(),
  constraint session_experience_feedback_comment_len check (
    comment is null or char_length(comment) <= 2000
  )
);

comment on table public.session_experience_feedback is
  'Feedback de experiencia al terminar de publicar. Una fila por sesión de formulario. Fuera del análisis de pasos.';

alter table public.session_experience_feedback enable row level security;

create policy "session_experience_feedback_insert_own"
  on public.session_experience_feedback for insert
  with check (
    exists (
      select 1
      from public.test_sessions as session
      where session.id = session_id
        and session.user_id = auth.uid()
        and session.status = 'submitted'
        and session.flow_piece = 'formulario_inicial'
    )
  );

create policy "session_experience_feedback_select_own_or_researcher"
  on public.session_experience_feedback for select
  using (
    public.is_researcher()
    or exists (
      select 1
      from public.test_sessions as session
      where session.id = session_id
        and session.user_id = auth.uid()
    )
  );
