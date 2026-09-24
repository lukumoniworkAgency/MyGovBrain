-- Phase 3 platform schema: additive extensions to the existing catalog.
create type public.user_role as enum ('citizen', 'csc_operator', 'admin', 'super_admin');
create type public.application_status as enum ('submitted', 'verification', 'processing', 'approved', 'completed', 'rejected');
create type public.document_kind as enum ('aadhaar', 'pan', 'voter_id', 'driving_license', 'certificate', 'marksheet', 'other');
create type public.notification_channel as enum ('in_app', 'email', 'sms', 'whatsapp');
create type public.job_type as enum ('government', 'private', 'apprenticeship', 'internship');

alter table public.profiles add column if not exists role public.user_role not null default 'citizen';
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
update public.profiles set role = case when is_admin then 'admin'::public.user_role else 'citizen'::public.user_role end where role is null;

create table public.roles (id uuid primary key default gen_random_uuid(), name public.user_role not null unique, description text, created_at timestamptz not null default now());
insert into public.roles(name, description) values ('citizen', 'Citizen account'), ('csc_operator', 'CSC center operator'), ('admin', 'Platform administrator'), ('super_admin', 'Super administrator') on conflict (name) do nothing;

-- Extend the existing public.centers table from the center directory migration.
alter table public.centers add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.centers add column if not exists description text;
alter table public.centers add column if not exists area text;
alter table public.centers add column if not exists district_id uuid references public.districts(id) on delete restrict;
alter table public.centers add column if not exists state_id uuid references public.states(id) on delete restrict;
alter table public.centers add column if not exists email text;
alter table public.centers add column if not exists rating numeric(2,1) not null default 0 check (rating between 0 and 5);
alter table public.centers add column if not exists review_count integer not null default 0 check (review_count >= 0);
alter table public.centers add column if not exists status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'closed'));
alter table public.centers add column if not exists is_verified boolean not null default false;
alter table public.centers add column if not exists metadata jsonb not null default '{}'::jsonb;
create table public.csc_services (center_id uuid not null references public.centers(id) on delete cascade, service_id uuid not null references public.services(id) on delete cascade, price_override numeric(10,2) check (price_override >= 0), is_available boolean not null default true, lead_time_days integer check (lead_time_days >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key (center_id, service_id));
create table public.service_fees (id uuid primary key default gen_random_uuid(), service_id uuid not null references public.services(id) on delete cascade, label text not null, amount numeric(10,2) not null check (amount >= 0), currency text not null default 'INR' check (currency = 'INR'), created_at timestamptz not null default now());
create table public.service_steps (id uuid primary key default gen_random_uuid(), service_id uuid not null references public.services(id) on delete cascade, step_number integer not null check (step_number > 0), title text not null, instructions text not null, created_at timestamptz not null default now(), unique (service_id, step_number));
create table public.service_faqs (id uuid primary key default gen_random_uuid(), service_id uuid not null references public.services(id) on delete cascade, question text not null, answer text not null, sort_order integer not null default 0, created_at timestamptz not null default now());


create table public.applications (id uuid primary key default gen_random_uuid(), reference_number text not null unique default ('MGB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))), citizen_id uuid not null references auth.users(id) on delete restrict, center_id uuid references public.centers(id) on delete set null, service_id uuid not null references public.services(id) on delete restrict, status public.application_status not null default 'submitted', notes text, remarks text, submitted_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz);
create table public.application_status_history (id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade, status public.application_status not null, remarks text, changed_by uuid references auth.users(id) on delete set null, changed_at timestamptz not null default now());
create table public.documents (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, kind public.document_kind not null default 'other', display_name text not null, storage_bucket text not null default 'private-documents', storage_path text not null, mime_type text not null, size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760), checksum_sha256 text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.application_documents (application_id uuid not null references public.applications(id) on delete cascade, document_id uuid not null references public.documents(id) on delete restrict, primary key (application_id, document_id));

create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, type text not null check (type in ('application', 'job', 'scholarship', 'scheme', 'system')), channel public.notification_channel not null default 'in_app', title text not null, body text not null, data jsonb not null default '{}'::jsonb, is_read boolean not null default false, is_important boolean not null default false, sent_at timestamptz, created_at timestamptz not null default now());
create table public.saved_services (user_id uuid not null references auth.users(id) on delete cascade, service_id uuid not null references public.services(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, service_id));
create table public.saved_csc (user_id uuid not null references auth.users(id) on delete cascade, center_id uuid not null references public.centers(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, center_id));
create table public.job_categories (id uuid primary key default gen_random_uuid(), name text not null unique, created_at timestamptz not null default now());
create table public.jobs (id uuid primary key default gen_random_uuid(), title text not null, organization text not null, description text not null, type public.job_type not null, state_id uuid references public.states(id) on delete set null, qualification text, apply_url text not null, deadline date, salary text, status text not null default 'published' check (status in ('draft', 'published', 'closed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.saved_jobs (user_id uuid not null references auth.users(id) on delete cascade, job_id uuid not null references public.jobs(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, job_id));
create table public.scholarship_categories (id uuid primary key default gen_random_uuid(), name text not null unique, created_at timestamptz not null default now());
create table public.scholarships (id uuid primary key default gen_random_uuid(), title text not null, provider text not null, description text not null, eligibility text not null, benefits text, documents_required text[] not null default '{}', state_id uuid references public.states(id) on delete set null, education_level text, income_criteria text, deadline date, apply_url text not null, status text not null default 'published' check (status in ('draft', 'published', 'closed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.saved_scholarships (user_id uuid not null references auth.users(id) on delete cascade, scholarship_id uuid not null references public.scholarships(id) on delete cascade, created_at timestamptz not null default now(), primary key (user_id, scholarship_id));
create table public.ai_conversations (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text, context jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.ai_messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.ai_conversations(id) on delete cascade, role text not null check (role in ('user', 'assistant', 'system')), content text not null, citations jsonb not null default '[]'::jsonb, created_at timestamptz not null default now());



create index applications_citizen_idx on public.applications(citizen_id, submitted_at desc);
create index applications_center_status_idx on public.applications(center_id, status);
create index applications_service_idx on public.applications(service_id);
create index documents_owner_idx on public.documents(owner_id, created_at desc);
create index notifications_user_read_idx on public.notifications(user_id, is_read, created_at desc);
create index jobs_status_deadline_idx on public.jobs(status, deadline);
create index scholarships_status_deadline_idx on public.scholarships(status, deadline);
create index centers_location_idx on public.centers(city, district_id, pincode) where is_verified = true;

create or replace function public.has_role(required public.user_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and (role = required or role = 'super_admin'::public.user_role));
$$;
revoke all on function public.has_role(public.user_role) from public;
grant execute on function public.has_role(public.user_role) to authenticated;

create or replace function public.owns_center(target_center uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.centers where id = target_center and owner_id = auth.uid());
$$;
revoke all on function public.owns_center(uuid) from public;
grant execute on function public.owns_center(uuid) to authenticated;

create or replace function public.record_application_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.application_status_history(application_id, status, remarks, changed_by) values (new.id, new.status, new.remarks, auth.uid());
  end if;
  return new;
end; $$;

create trigger applications_status_history after insert or update of status on public.applications for each row execute function public.record_application_status();
create trigger applications_set_updated_at before update on public.applications for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications for each row execute function public.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs for each row execute function public.set_updated_at();
create trigger scholarships_set_updated_at before update on public.scholarships for each row execute function public.set_updated_at();
create trigger ai_conversations_set_updated_at before update on public.ai_conversations for each row execute function public.set_updated_at();

create policy "Users manage notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Users read notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage saved services" on public.saved_services for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage saved centers" on public.saved_csc for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage saved jobs" on public.saved_jobs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage saved scholarships" on public.saved_scholarships for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage AI conversations" on public.ai_conversations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage AI messages" on public.ai_messages for all to authenticated using (exists (select 1 from public.ai_conversations where ai_conversations.id = ai_messages.conversation_id and ai_conversations.user_id = auth.uid())) with check (exists (select 1 from public.ai_conversations where ai_conversations.id = ai_messages.conversation_id and ai_conversations.user_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('private-documents', 'private-documents', false) on conflict (id) do update set public = false;
create policy "Users upload private documents" on storage.objects for insert to authenticated with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users read private documents" on storage.objects for select to authenticated using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete private documents" on storage.objects for delete to authenticated using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);

grant select on public.services, public.service_translations, public.jobs, public.scholarships, public.centers, public.csc_services to anon, authenticated;
grant select, insert, update, delete on public.applications, public.application_status_history, public.documents, public.application_documents, public.notifications, public.saved_services, public.saved_csc, public.saved_jobs, public.saved_scholarships, public.ai_conversations, public.ai_messages to authenticated;
grant select on public.service_fees, public.service_steps, public.service_faqs to authenticated;


-- Security and operational policies. Public catalog rows remain readable only when published/verified.
alter table public.roles enable row level security;
alter table public.service_fees enable row level security;
alter table public.service_steps enable row level security;
alter table public.service_faqs enable row level security;
alter table public.csc_services enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.documents enable row level security;
alter table public.application_documents enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_services enable row level security;
alter table public.saved_csc enable row level security;
alter table public.jobs enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.scholarships enable row level security;
alter table public.saved_scholarships enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

create policy "Published services are public" on public.services for select to anon, authenticated using (status = 'published');
create policy "Published service translations are public" on public.service_translations for select to anon, authenticated using (exists (select 1 from public.services where services.id = service_translations.service_id and services.status = 'published'));
create policy "Published jobs are public" on public.jobs for select to anon, authenticated using (status = 'published');
create policy "Published scholarships are public" on public.scholarships for select to anon, authenticated using (status = 'published');
create policy "Verified centers are public" on public.centers for select to anon, authenticated using (verified);
create policy "Public center services follow center verification" on public.csc_services for select to anon, authenticated using (exists (select 1 from public.centers where centers.id = csc_services.center_id and centers.verified));

create policy "Citizens manage own applications" on public.applications for select to authenticated using (citizen_id = auth.uid() or public.owns_center(center_id) or public.is_admin());
create policy "Citizens create own applications" on public.applications for insert to authenticated with check (citizen_id = auth.uid());
create policy "Owners and centers update applications" on public.applications for update to authenticated using (citizen_id = auth.uid() or public.owns_center(center_id) or public.is_admin()) with check (citizen_id = auth.uid() or public.owns_center(center_id) or public.is_admin());
create policy "Application history follows application access" on public.application_status_history for select to authenticated using (exists (select 1 from public.applications where applications.id = application_status_history.application_id and (applications.citizen_id = auth.uid() or public.owns_center(applications.center_id) or public.is_admin())));

create policy "Owners manage documents" on public.documents for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "Owners upload document metadata" on public.documents for insert to authenticated with check (owner_id = auth.uid());
create policy "Owners delete document metadata" on public.documents for delete to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "Owners manage application document links" on public.application_documents for select to authenticated using (exists (select 1 from public.applications where applications.id = application_documents.application_id and (applications.citizen_id = auth.uid() or public.owns_center(applications.center_id) or public.is_admin())));

