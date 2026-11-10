-- Pieza 4 — Programa el correo de recuperación cada 15 minutos con pg_cron + pg_net.
-- Correr una sola vez en el SQL Editor del proyecto, después de aplicar
-- migrations/20261110120000_recovery_emails.sql.
--
-- 1) Guardá la URL de la app y el secreto en Vault (reemplazá los valores):
--
--    select vault.create_secret('https://TU-APP.vercel.app/api/cron/recovery-emails', 'recovery_cron_url');
--    select vault.create_secret('EL_MISMO_VALOR_QUE_CRON_SECRET_EN_VERCEL', 'recovery_cron_secret');
--
-- 2) Programá la tarea:

select cron.schedule(
  'recovery-emails',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'recovery_cron_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'recovery_cron_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Para ver las ejecuciones:  select * from cron.job_run_details order by start_time desc limit 20;
-- Para pausarla:            select cron.unschedule('recovery-emails');
