create table public.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code)),
  name text not null,
  native_name text not null,
  direction text not null default 'ltr' check (direction in ('ltr', 'rtl')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique check (code = upper(code)),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.districts (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.states(id) on delete restrict,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_id, name)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  state_id uuid references public.states(id) on delete restrict,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_id, name)
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index districts_state_id_idx on public.districts(state_id);
create index departments_state_id_idx on public.departments(state_id);
create index service_categories_status_sort_order_idx on public.service_categories(status, sort_order);

create trigger languages_set_updated_at before update on public.languages for each row execute function public.set_updated_at();
create trigger states_set_updated_at before update on public.states for each row execute function public.set_updated_at();
create trigger districts_set_updated_at before update on public.districts for each row execute function public.set_updated_at();
create trigger departments_set_updated_at before update on public.departments for each row execute function public.set_updated_at();
create trigger service_categories_set_updated_at before update on public.service_categories for each row execute function public.set_updated_at();
