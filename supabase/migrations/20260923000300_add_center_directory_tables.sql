-- Center directory ("Find help nearby"): local CSC / agent listings.
--
-- Read these four notes before you read the SQL. They explain why the schema
-- looks the way it does.
--
-- 1. There is ALREADY a public.services table in this project (see
--    20260922000300_create_service_tables.sql). It stores the government
--    service catalogue (id, state_id, slug, status, ...) and the readable
--    name lives in public.service_translations. So this migration does NOT
--    create a second services table with name/slug columns: that would collide
--    with the existing table and leave the project with two competing
--    catalogues. center_services and contact_clicks point at
--    public.services(id) instead. One catalogue, one source of truth.
--
-- 2. A visitor may only ever read centers where verified = true. A center
--    registered from /register-agent is written with verified = false, so it
--    is invisible until an admin reviews it. "Do not auto-publish" is enforced
--    in the database (RLS), not only in the UI.
--
-- 3. Anonymous visitors cannot INSERT into centers or center_services at all.
--    Registration goes through public.register_center(...) below, which is
--    SECURITY DEFINER and writes both tables in a single transaction.
--    Why a function instead of two plain inserts from the browser?
--      * To write center_services rows you need the new center id, and reading
--        that row back is blocked by rule 2 - an unverified center is not
--        readable by the public.
--      * Two separate round trips are not atomic. A failure in between would
--        leave a center with no services and no way for the visitor to retry.
--
-- 4. Everything here is append-only from the public side: inserts only. There
--    is no public UPDATE or DELETE policy, so nobody can flip verified to true
--    or edit somebody else's listing through the API.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.centers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 2 and 160),
  address text not null check (length(btrim(address)) between 5 and 400),
  city text not null check (length(btrim(city)) between 2 and 80),
  -- Indian PIN codes are six digits and never start with zero.
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  -- Stored as digits only (no spaces, plus sign, or dashes). 10 digits is a
  -- local number, 11-13 digits includes a country code. Keeping the column
  -- clean means building tel: and wa.me links in the UI is trivial.
  phone text not null check (phone ~ '^[0-9]{10,13}$'),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  -- Not in the original spec, but every other table in this project carries
  -- updated_at plus the shared set_updated_at trigger, and admins want to know
  -- when a listing was last reviewed.
  updated_at timestamptz not null default now()
);

-- Join table: which services can this center help with?
-- One row per (center, service) pair; the unique constraint is what stops
-- duplicate rows if a form is submitted twice.
create table public.center_services (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (center_id, service_id)
);

-- Conversion tracking: one row per "Call" or "WhatsApp" tap.
-- Deliberately minimal - it records which listing was contacted for which
-- service, never who did it.
create table public.contact_clicks (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  -- timestamptz, not timestamp: timestamp without a time zone silently loses
  -- the offset and makes "clicks today" reporting wrong across time zones.
  clicked_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- Supports the exact query pattern used by "Find help nearby":
--   where center_services.service_id = <current service>
--     and (city ilike '%text%' or pincode like 'text%')
create index center_services_service_idx on public.center_services(service_id);
create index centers_pincode_idx on public.centers(pincode);
create index centers_verified_city_idx on public.centers(verified, city);

-- Note: the unique (center_id, service_id) constraint already creates an index
-- that starts with center_id, so no extra index is needed for lookups by
-- center.
--
-- City search uses ilike '%text%', which cannot use a btree index. With fewer
-- than a few thousand centers this does not matter. If the directory grows,
-- add: create extension if not exists pg_trgm; then a GIN index on city.

create index contact_clicks_center_idx on public.contact_clicks(center_id, clicked_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.centers enable row level security;
alter table public.center_services enable row level security;
alter table public.contact_clicks enable row level security;

-- Visitors see listed centers only. `using (verified)` is the whole publishing
-- switch: a freshly registered center (verified = false) simply does not exist
-- as far as the public API is concerned.
create policy "Public can read verified centers" on public.centers
  for select to anon, authenticated
  using (verified);

-- A center's service list is readable only while that center is listed. (The
-- subquery is itself filtered by the centers policy above, so the explicit
-- `verified` check is a second, readable guarantee.)
create policy "Public can read services of verified centers" on public.center_services
  for select to anon, authenticated
  using (exists (
    select 1 from public.centers
    where centers.id = center_services.center_id and centers.verified
  ));

-- Click tracking is insert-only. There is intentionally no select policy: these
-- rows are for the site operator's reporting, exactly like analytics_events.
-- The check keeps the table clean by accepting a click only for a center a
-- visitor can actually see and a service that is published.
create policy "Anyone can record a contact click" on public.contact_clicks
  for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.centers
      where centers.id = contact_clicks.center_id and centers.verified
    )
    and exists (
      select 1 from public.services
      where services.id = contact_clicks.service_id and services.status = 'published'
    )
  );

-- Supabase grants broad privileges on new tables in the public schema by
-- default, so revoke everything and grant back only what is needed. This is
-- the same pattern used for analytics_events in 20260922001100.
revoke all on public.centers from anon, authenticated;
revoke all on public.center_services from anon, authenticated;
revoke all on public.contact_clicks from anon, authenticated;

grant select on public.centers to anon, authenticated;
grant select on public.center_services to anon, authenticated;
grant insert on public.contact_clicks to anon, authenticated;

-- No insert grant on centers or center_services: registration must go through
-- register_center() below. No update grant anywhere: only the privileged role
-- used by the Supabase dashboard (Table Editor / SQL Editor) can publish a
-- listing.

create index contact_clicks_service_idx on public.contact_clicks(service_id);

create trigger centers_set_updated_at before update on public.centers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Registration entry point
-- ---------------------------------------------------------------------------

create or replace function public.register_center(
  p_name text,
  p_address text,
  p_city text,
  p_pincode text,
  p_phone text,
  p_whatsapp text,
  p_service_ids uuid[]
)
returns uuid
language plpgsql
-- SECURITY DEFINER runs the body as the function owner (the postgres role), and
-- that is what allows writing two tables even though the anonymous caller has
-- no insert privilege of its own. `set search_path = public` is mandatory on a
-- definer function: without it a caller could shadow a table name with one of
-- their own.
security definer
set search_path = public
as $$
declare
  v_center_id uuid;
  v_name text := left(btrim(coalesce(p_name, '')), 160);
  v_address text := left(btrim(coalesce(p_address, '')), 400);
  v_city text := left(btrim(coalesce(p_city, '')), 80);
  -- Normalise before validating: strip anything that is not a digit, so
  -- "+91 98765-43210" and "9876543210" are stored in exactly the same shape.
  v_pincode text := regexp_replace(coalesce(p_pincode, ''), '[^0-9]', '', 'g');
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_whatsapp text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '[^0-9]', '', 'g'), '');
  v_service_count integer;
begin
  -- Validation lives here as well as in the form. The form check is a
  -- convenience for the visitor; this one is the guarantee, because a server
  -- function is reachable by a direct POST request that never touches the UI.
  if length(v_name) < 2 then
    raise exception 'Enter the name of your center.';
  end if;
  if length(v_address) < 5 then
    raise exception 'Enter the full address of your center.';
  end if;
  if length(v_city) < 2 then
    raise exception 'Enter the city or town.';
  end if;
  if v_pincode !~ '^[1-9][0-9]{5}$' then
    raise exception 'Enter a valid 6 digit PIN code.';
  end if;
  if v_phone !~ '^[0-9]{10,13}$' then
    raise exception 'Enter a valid phone number.';
  end if;
  if v_whatsapp is not null and v_whatsapp !~ '^[0-9]{10,13}$' then
    raise exception 'Enter a valid WhatsApp number or leave it blank.';
  end if;

  insert into public.centers (name, address, city, pincode, phone, whatsapp, verified)
  values (v_name, v_address, v_city, v_pincode, v_phone, v_whatsapp, false)
  returning id into v_center_id;

  -- Only published services can be linked, and `on conflict do nothing` makes a
  -- repeated submit harmless.
  insert into public.center_services (center_id, service_id)
  select v_center_id, services.id
  from public.services
  where services.id = any (coalesce(p_service_ids, '{}'::uuid[]))
    and services.status = 'published'
  on conflict (center_id, service_id) do nothing;

  get diagnostics v_service_count = row_count;

  -- Raising an exception aborts the whole transaction, so the center row
  -- inserted above is rolled back with it. This is the strongest argument for
  -- doing both inserts inside one function: you can never end up with a center
  -- that has no services.
  if v_service_count = 0 then
    raise exception 'Select at least one service you can help with.';
  end if;

  return v_center_id;
end;
$$;

-- Postgres grants EXECUTE on new functions to the PUBLIC pseudo-role by
-- default. Take that back and hand it out deliberately.
revoke all on function public.register_center(text, text, text, text, text, text, uuid[]) from public;
grant execute on function public.register_center(text, text, text, text, text, text, uuid[]) to anon, authenticated;



-- ---------------------------------------------------------------------------
-- How to review submissions (no custom admin panel, on purpose)
-- ---------------------------------------------------------------------------
-- New listings arrive with verified = false and are invisible to visitors. Open
-- the Supabase dashboard and use the SQL Editor (or Table Editor) to review.
-- The dashboard runs as a privileged role, so it bypasses RLS.
--
-- 1. See what is waiting:
--      select id, name, address, city, pincode, phone, whatsapp, created_at
--      from public.centers
--      where not verified
--      order by created_at desc;
--
-- 2. Check what a center claims to help with:
--      select s.slug, t.name
--      from public.center_services cs
--      join public.services s on s.id = cs.service_id
--      left join public.service_translations t
--        on t.service_id = s.id
--       and t.language_id = (select id from public.languages where code = 'en')
--      where cs.center_id = '<center-id>';
--
-- 3. Publish (this is the only way a listing becomes visible):
--      update public.centers set verified = true where id = '<center-id>';
--
-- 4. Take a listing down again:
--      update public.centers set verified = false where id = '<center-id>';
--
-- 5. Conversion report:
--      select c.name, s.slug, count(*) as clicks
--      from public.contact_clicks cc
--      join public.centers c on c.id = cc.center_id
--      join public.services s on s.id = cc.service_id
--      group by c.name, s.slug
--      order by clicks desc;
--
-- 6. Optional: to separate Call clicks from WhatsApp clicks, add a channel
--    column (the UI already knows which button was tapped):
--      alter table public.contact_clicks
--        add column channel text not null default 'call'
--        check (channel in ('call', 'whatsapp'));
