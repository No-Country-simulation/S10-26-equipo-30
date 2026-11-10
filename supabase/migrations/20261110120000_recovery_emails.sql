-- Pieza 4 — Recuperación de abandonos: correo automático +1 h con enlace para retomar el borrador.
-- La programación con pg_cron vive en supabase/cron/recovery-emails.sql (necesita secretos en Vault).

alter table public.test_sessions
  add column if not exists recovery_email_status text,
  add column if not exists recovery_email_at timestamptz;

alter table public.test_sessions
  drop constraint if exists test_sessions_recovery_email_status_check;

alter table public.test_sessions
  add constraint test_sessions_recovery_email_status_check check (
    recovery_email_status is null
    or recovery_email_status in (
      'sent',
      'skipped_no_email',
      'skipped_opt_out',
      'skipped_superseded',
      'skipped_no_draft'
    )
  );

comment on column public.test_sessions.recovery_email_status is
  'Resultado de la tarea de recuperación (pieza 4). null = todavía no se evaluó. Se evalúa una sola vez.';
comment on column public.test_sessions.recovery_email_at is
  'Cuándo se envió el correo de recuperación o se decidió no enviarlo.';

create index if not exists test_sessions_recovery_candidates_idx
  on public.test_sessions (last_activity_at)
  where flow_piece = 'formulario_inicial'
    and status <> 'submitted'
    and recovery_email_status is null;

alter table public.profiles
  add column if not exists email_reminders_opt_out boolean not null default false;

comment on column public.profiles.email_reminders_opt_out is
  'La persona pidió no recibir recordatorios por correo (enlace de baja del correo de recuperación).';

create extension if not exists pg_cron;
create extension if not exists pg_net;
