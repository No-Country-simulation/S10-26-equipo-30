-- Cada invitado anónimo recibe un nombre estable: Invitado 1, Invitado 2, ...
-- El número no se reutiliza ni cambia si más adelante se borra una cuenta.

create sequence if not exists public.guest_display_seq;

create or replace function public.next_guest_label()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  return 'Invitado ' || nextval('public.guest_display_seq')::text;
end;
$$;

revoke all on function public.next_guest_label() from public;
revoke all on function public.next_guest_label() from anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_guest boolean;
  display_name text;
begin
  is_guest := coalesce(new.email, '') = ''
    or coalesce(new.raw_user_meta_data ->> 'guest', '') = 'true';

  if is_guest then
    display_name := public.next_guest_label();
  else
    display_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name');
  end if;

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    display_name,
    new.raw_user_meta_data ->> 'avatar_url'
  );

  if is_guest then
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('full_name', display_name, 'guest', true)
    where id = new.id;
  end if;

  return new;
end;
$$;

-- Invitados que ya entraron (email vacío y nombre genérico) pasan a Invitado N.
-- El número sigue después del más alto que ya exista.
with bounds as (
  select coalesce(
    max((regexp_match(full_name, '^Invitado ([0-9]+)$'))[1]::int),
    0
  ) as start_n
  from public.profiles
),
numbered as (
  select
    profile.id,
    bounds.start_n + row_number() over (order by profile.created_at, profile.id) as n
  from public.profiles as profile
  cross join bounds
  where coalesce(profile.email, '') = ''
    and (
      profile.full_name is null
      or btrim(profile.full_name) = ''
      or btrim(profile.full_name) = 'Invitado'
    )
)
update public.profiles as profile
set full_name = 'Invitado ' || numbered.n
from numbered
where profile.id = numbered.id;

update auth.users as account
set raw_user_meta_data = coalesce(account.raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('full_name', profile.full_name, 'guest', true)
from public.profiles as profile
where profile.id = account.id
  and coalesce(profile.email, '') = ''
  and profile.full_name ~ '^Invitado [0-9]+$';

select setval(
  'public.guest_display_seq',
  greatest(
    1,
    coalesce(
      (
        select max((regexp_match(full_name, '^Invitado ([0-9]+)$'))[1]::bigint)
        from public.profiles
      ),
      1
    )
  ),
  exists (
    select 1
    from public.profiles
    where full_name ~ '^Invitado [0-9]+$'
  )
);
