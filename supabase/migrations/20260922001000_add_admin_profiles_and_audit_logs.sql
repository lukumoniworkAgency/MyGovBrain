create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('create', 'update', 'delete')),
  table_name text not null,
  record_id uuid not null,
  created_at timestamptz not null default now()
);

create index audit_logs_record_idx on public.audit_logs(table_name, record_id);
create index audit_logs_user_idx on public.audit_logs(user_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin = true);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "Admins can read profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "Admins can update profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can read audit logs" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "Admins can insert audit logs" on public.audit_logs for insert to authenticated with check (public.is_admin() and user_id = auth.uid());

create policy "Admins can insert services" on public.services for insert to authenticated with check (public.is_admin());
create policy "Admins can update services" on public.services for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete services" on public.services for delete to authenticated using (public.is_admin());
create policy "Admins can insert service translations" on public.service_translations for insert to authenticated with check (public.is_admin());
create policy "Admins can update service translations" on public.service_translations for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete service translations" on public.service_translations for delete to authenticated using (public.is_admin());
create policy "Admins can insert service documents" on public.service_documents for insert to authenticated with check (public.is_admin());
create policy "Admins can update service documents" on public.service_documents for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete service documents" on public.service_documents for delete to authenticated using (public.is_admin());
create policy "Admins can insert service sources" on public.service_sources for insert to authenticated with check (public.is_admin());
create policy "Admins can update service sources" on public.service_sources for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete service sources" on public.service_sources for delete to authenticated using (public.is_admin());
create policy "Admins can insert eligibility rules" on public.eligibility_rules for insert to authenticated with check (public.is_admin());
create policy "Admins can update eligibility rules" on public.eligibility_rules for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete eligibility rules" on public.eligibility_rules for delete to authenticated using (public.is_admin());
create policy "Admins can insert eligibility translations" on public.eligibility_rules_translations for insert to authenticated with check (public.is_admin());
create policy "Admins can update eligibility translations" on public.eligibility_rules_translations for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can delete eligibility translations" on public.eligibility_rules_translations for delete to authenticated using (public.is_admin());
create policy "Admins can insert document types" on public.document_types for insert to authenticated with check (public.is_admin());
create policy "Admins can update document types" on public.document_types for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can insert categories" on public.service_categories for insert to authenticated with check (public.is_admin());
create policy "Admins can update categories" on public.service_categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can insert departments" on public.departments for insert to authenticated with check (public.is_admin());
create policy "Admins can update departments" on public.departments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can insert states" on public.states for insert to authenticated with check (public.is_admin());
create policy "Admins can update states" on public.states for update to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.profiles, public.audit_logs from anon;
grant select on public.profiles to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant insert, update, delete on public.services, public.service_translations, public.service_documents, public.service_sources, public.eligibility_rules, public.eligibility_rules_translations, public.document_types, public.service_categories, public.departments, public.states to authenticated;
