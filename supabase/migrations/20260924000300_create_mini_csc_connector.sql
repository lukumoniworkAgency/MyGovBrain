-- GovGuide AI Mini CSC Connector: additive migration.
-- Existing centers, services, applications, profiles, and storage remain canonical.
create type public.lead_status as enum ('new','assigned','contacted','documents_pending','in_progress','submitted','completed','cancelled','rejected');
create type public.lead_priority as enum ('normal','high','urgent');

alter table public.centers add column if not exists owner_name text;
alter table public.centers add column if not exists latitude numeric(9,6);
alter table public.centers add column if not exists longitude numeric(9,6);
alter table public.centers add column if not exists supported_languages text[] not null default '{}';
alter table public.centers add column if not exists verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended'));
alter table public.centers add column if not exists active boolean not null default false;
update public.centers set verification_status = case when verified then 'verified' else 'pending' end where verification_status = 'pending';

create table if not exists public.csc_staff (
  id uuid primary key default gen_random_uuid(),
  csc_id uuid not null references public.centers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'operator' check (role in ('operator','manager')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (csc_id, user_id)
);
create table if not exists public.service_leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text not null unique default ('GGA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  assigned_csc_id uuid references public.centers(id) on delete set null,
  status public.lead_status not null default 'new',
  priority public.lead_priority not null default 'normal',
  language text not null default 'en',
  citizen_name text not null,
  phone text not null,
  district text,
  notes text check (notes is null or length(notes) <= 4000),
  expected_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.service_leads(id) on delete cascade,
  old_status public.lead_status,
  new_status public.lead_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  notes text check (notes is null or length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.service_leads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  note text not null check (length(btrim(note)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create table if not exists public.lead_documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.service_leads(id) on delete cascade,
  file_path text not null,
  document_type text not null default 'other',
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create table if not exists public.lead_activity_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.service_leads(id) on delete cascade,
  action text not null,
  actor uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists service_leads_user_idx on public.service_leads(user_id, created_at desc);
create index if not exists service_leads_center_status_idx on public.service_leads(assigned_csc_id, status, created_at desc);
create index if not exists lead_history_lead_idx on public.lead_status_history(lead_id, created_at);
create index if not exists lead_notes_lead_idx on public.lead_notes(lead_id, created_at);

create or replace function public.owns_lead(target_lead uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.service_leads l where l.id = target_lead and (l.user_id = auth.uid() or public.is_admin() or exists (select 1 from public.csc_staff s where s.csc_id = l.assigned_csc_id and s.user_id = auth.uid() and s.active)));
$$;
revoke all on function public.owns_lead(uuid) from public;
grant execute on function public.owns_lead(uuid) to authenticated;

create or replace function public.record_lead_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.lead_status_history(lead_id, old_status, new_status, changed_by) values (new.id, null, new.status, auth.uid());
    insert into public.lead_activity_log(lead_id, action, actor) values (new.id, 'created', auth.uid());
  elsif old.status is distinct from new.status then
    insert into public.lead_status_history(lead_id, old_status, new_status, changed_by) values (new.id, old.status, new.status, auth.uid());
    insert into public.lead_activity_log(lead_id, action, actor) values (new.id, 'status_updated', auth.uid());
  end if;
  return new;
end; $$;
drop trigger if exists service_leads_status_history on public.service_leads;
create trigger service_leads_status_history after insert or update of status on public.service_leads for each row execute function public.record_lead_status();
create trigger service_leads_set_updated_at before update on public.service_leads for each row execute function public.set_updated_at();

alter table public.csc_staff enable row level security;
alter table public.service_leads enable row level security;
alter table public.lead_status_history enable row level security;
alter table public.lead_notes enable row level security;
alter table public.lead_documents enable row level security;
alter table public.lead_activity_log enable row level security;

create policy "Staff read their membership" on public.csc_staff for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "Admins manage center staff" on public.csc_staff for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Users read own leads and assigned operators read leads" on public.service_leads for select to authenticated using (user_id = auth.uid() or public.owns_lead(id));
create policy "Users create own leads" on public.service_leads for insert to authenticated with check (user_id = auth.uid());
create policy "Owners operators and admins update leads" on public.service_leads for update to authenticated using (public.owns_lead(id)) with check (public.owns_lead(id));
create policy "Admins assign verified leads" on public.service_leads for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Lead history follows lead access" on public.lead_status_history for select to authenticated using (public.owns_lead(lead_id));
create policy "Lead notes follow lead access" on public.lead_notes for select to authenticated using (public.owns_lead(lead_id));
create policy "Lead authors create notes" on public.lead_notes for insert to authenticated with check (author_id = auth.uid() and public.owns_lead(lead_id));
create policy "Lead documents follow lead access" on public.lead_documents for select to authenticated using (public.owns_lead(lead_id));
create policy "Lead uploaders create documents" on public.lead_documents for insert to authenticated with check (uploaded_by = auth.uid() and public.owns_lead(lead_id));
create policy "Lead activity follows lead access" on public.lead_activity_log for select to authenticated using (public.owns_lead(lead_id));

grant select, insert, update on public.service_leads to authenticated;
grant select, insert on public.lead_status_history, public.lead_notes, public.lead_documents, public.lead_activity_log to authenticated;
grant select, insert, update, delete on public.csc_staff to authenticated;
grant update on public.centers to authenticated;
grant select on public.centers to authenticated;
