create extension if not exists "pgcrypto";

create type public.service_source_status as enum (
  'verified',
  'needs_review',
  'outdated',
  'archived'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
