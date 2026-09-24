-- Additive production hardening for marketplace workflows and document access.
-- Existing tables, rows, routes, and clients remain compatible.

create or replace function public.validate_application_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'submitted' and new.status = 'verification') or
    (old.status = 'verification' and new.status = 'processing') or
    (old.status = 'processing' and new.status in ('approved', 'rejected')) or
    (old.status = 'approved' and new.status in ('completed', 'rejected'))
  ) then
    raise exception 'Invalid application status transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  if new.status = 'completed' then
    new.completed_at = coalesce(new.completed_at, now());
  else
    new.completed_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists applications_validate_status_transition on public.applications;
create trigger applications_validate_status_transition
before update of status on public.applications
for each row execute function public.validate_application_status_transition();

create table if not exists public.document_access_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('signed_url')),
  created_at timestamptz not null default now()
);

create index if not exists document_access_logs_document_idx
  on public.document_access_logs(document_id, created_at desc);
create index if not exists document_access_logs_user_idx
  on public.document_access_logs(user_id, created_at desc);

alter table public.document_access_logs enable row level security;
drop policy if exists "Users record own document access" on public.document_access_logs;
create policy "Users record own document access"
  on public.document_access_logs for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "Admins read document access" on public.document_access_logs;
create policy "Admins read document access"
  on public.document_access_logs for select to authenticated
  using (public.is_admin());

grant insert on public.document_access_logs to authenticated;
grant select on public.document_access_logs to authenticated;

-- Metadata authorization does not grant Storage access. Privileged users therefore
-- need an explicit Storage read policy before they can sign another user's object.
drop policy if exists "Admins read private documents" on storage.objects;
create policy "Admins read private documents" on storage.objects
  for select to authenticated
  using (bucket_id = 'private-documents' and public.is_admin());
