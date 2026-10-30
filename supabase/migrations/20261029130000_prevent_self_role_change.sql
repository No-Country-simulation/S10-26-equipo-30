-- Un usuario autenticado (Google o invitado) no puede cambiar su propio rol.
-- El SQL Editor y un researcher que edita a otra persona siguen pudiendo promover roles.

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and auth.uid() = old.id
  then
    raise exception 'No podés cambiar tu propio rol';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;

create trigger profiles_prevent_self_role_change
before update on public.profiles
for each row
execute function public.prevent_self_role_change();
