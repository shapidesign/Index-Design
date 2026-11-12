-- Admin-editable "מה חדש", allowlisted logins, and first-party analytics events.
-- Heatmap coordinates live here because GA4 has no heatmap report.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, supabase_auth_admin;

create table public.admin_allowlist (
  email text primary key check (email = lower(email) and char_length(email) between 3 and 200)
);

alter table public.admin_allowlist enable row level security;
revoke all on public.admin_allowlist from anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function private.restrict_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or not exists (
    select 1 from public.admin_allowlist where email = lower(new.email)
  ) then
    raise exception 'signup closed' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.restrict_signup() from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.restrict_signup() to supabase_auth_admin;

drop trigger if exists restrict_signup on auth.users;
create trigger restrict_signup
  before insert on auth.users
  for each row execute function private.restrict_signup();

-- Boolean the client can ask. Invoker only; the privileged read stays in private.
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.am_i_admin() from public;
grant execute on function public.am_i_admin() to authenticated;

create or replace function private.whats_new_items_ok(items jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) <= 30
    and not exists (
      select 1
      from jsonb_array_elements(items) as el(value)
      where jsonb_typeof(el.value) <> 'string'
        or char_length(el.value #>> '{}') = 0
        or char_length(el.value #>> '{}') > 400
    );
$$;

revoke all on function private.whats_new_items_ok(jsonb) from public;
grant execute on function private.whats_new_items_ok(jsonb) to authenticated;

create table public.whats_new (
  id integer primary key default 1 check (id = 1),
  version text not null check (char_length(version) between 1 and 32),
  title text not null check (char_length(title) between 1 and 80),
  items jsonb not null check (private.whats_new_items_ok(items)),
  enabled boolean not null default true,
  updated_at timestamptz not null default pg_catalog.now()
);

alter table public.whats_new enable row level security;
revoke all on public.whats_new from anon, authenticated;
grant select on public.whats_new to anon, authenticated;
grant insert, update on public.whats_new to authenticated;

create policy whats_new_public_read on public.whats_new
  for select to anon, authenticated
  using (true);

create policy whats_new_admin_write on public.whats_new
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

insert into public.whats_new (id, version, title, items, enabled)
values (
  1,
  'v6',
  'מה חדש אצלנו?',
  jsonb_build_array(
    'הוספנו מקלדת: קיצורי מקלדת לתוכנות עיצוב, הדגשה חיה של המקשים, תרגול וחידון.',
    'הוספנו 8 כלים חדשים: 2 בטיפוגרפיה, 2 ב-UX, ועוד כלים לצילום, לצבע, לעיבוד תמונה ולקיצורי מקלדת.',
    'הוספנו ממשק לספרייה של HIT בצורה נוחה למשתמש.',
    'נוספו פונטים חדשים למילון, בהם עזר דיאלוג, אקסיומה, רקיע, שפגאט ומשפחת ריזינגר.',
    'נוספו פונטים מבית Nomad: קלדנית, ספרא, מידל איסט, יפה נפש, דולומיט, Kilo Text, Kilo Display, Dear AI, The Bizarre, Werd, Romanisch Spitz ו־Sugar.'
  ),
  true
);

-- ponytail: anon inserts are uncapped per IP. Add a rate-limit trigger if this table gets noisy.
create table public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default pg_catalog.now(),
  kind text not null check (kind in ('click', 'hover', 'share', 'forward')),
  path text not null check (char_length(path) between 1 and 200),
  section text check (section is null or char_length(section) between 1 and 40),
  label text check (label is null or char_length(label) between 1 and 80),
  x smallint check (x is null or x between 0 and 100),
  y smallint check (y is null or y between 0 and 100)
);

create index analytics_events_created_at_idx on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

create policy analytics_events_insert on public.analytics_events
  for insert to anon, authenticated
  with check (true);

create policy analytics_events_admin_read on public.analytics_events
  for select to authenticated
  using ((select private.is_admin()));
