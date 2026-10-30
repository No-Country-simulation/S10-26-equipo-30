-- Ejecutar en SQL Editor tras aplicar la migración.

select typname as enum_type
from pg_type
where typnamespace = 'public'::regnamespace
  and typtype = 'e'
order by typname;

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('is_researcher', 'handle_new_user');
