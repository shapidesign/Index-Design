-- One SELECT policy on whats_new, and an explicit deny on the allowlist.

drop policy whats_new_admin_write on public.whats_new;

create policy whats_new_admin_insert on public.whats_new
  for insert to authenticated
  with check ((select private.is_admin()));

create policy whats_new_admin_update on public.whats_new
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy admin_allowlist_deny on public.admin_allowlist
  for all to anon, authenticated
  using (false)
  with check (false);

create or replace function private.touch_whats_new()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.touch_whats_new() from public;
grant execute on function private.touch_whats_new() to authenticated;

drop trigger if exists touch_whats_new on public.whats_new;
create trigger touch_whats_new
  before update on public.whats_new
  for each row execute function private.touch_whats_new();
