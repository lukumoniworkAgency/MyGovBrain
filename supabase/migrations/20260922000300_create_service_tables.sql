create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete restrict,
  department_id uuid not null references public.departments(id) on delete restrict,
  state_id uuid not null references public.states(id) on delete restrict,
  slug text not null check (slug = lower(slug)),
  status text not null default 'draft' check (status in ('draft', 'published', 'inactive')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_id, slug)
);

create table public.service_translations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  language_id uuid not null references public.languages(id) on delete restrict,
  name text not null,
  short_description text,
  full_description text,
  eligibility_text text,
  how_to_apply_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, language_id)
);

create table public.document_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_documents (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  document_type_id uuid not null references public.document_types(id) on delete restrict,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, document_type_id)
);

create table public.service_sources (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  source_url text not null,
  source_title text not null,
  source_type text not null,
  government_department text,
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete set null,
  status public.service_source_status not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_category_id_idx on public.services(category_id);
create index services_department_id_idx on public.services(department_id);
create index services_state_status_idx on public.services(state_id, status);
create index service_translations_language_id_idx on public.service_translations(language_id);
create index service_documents_document_type_id_idx on public.service_documents(document_type_id);
create index service_sources_status_idx on public.service_sources(status);

create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger service_translations_set_updated_at before update on public.service_translations for each row execute function public.set_updated_at();
create trigger document_types_set_updated_at before update on public.document_types for each row execute function public.set_updated_at();
create trigger service_documents_set_updated_at before update on public.service_documents for each row execute function public.set_updated_at();
create trigger service_sources_set_updated_at before update on public.service_sources for each row execute function public.set_updated_at();
