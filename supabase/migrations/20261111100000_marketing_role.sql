-- Pieza 4 — Rol para quien contacta a mano los abandonos calificados (+24 h).
-- Va en una migración aparte porque Postgres no deja usar un valor nuevo de un enum
-- en la misma transacción en la que se agrega.
--
-- marketing ve solo la lista de leads calificados (/panel/leads) y registra contactos.
-- No es investigador: no entra al panel de pruebas ni lee las tablas completas.

alter type public.app_role add value if not exists 'marketing';
