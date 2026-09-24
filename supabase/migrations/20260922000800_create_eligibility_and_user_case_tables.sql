create type public.eligibility_question_type as enum ('yes_no', 'single_select', 'number', 'text');

create table public.eligibility_rules (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  question_type public.eligibility_question_type not null,
  question_text text,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  status text not null default 'needs_review' check (status in ('active', 'needs_review', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.eligibility_rules_translations (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.eligibility_rules(id) on delete cascade,
  language_id uuid not null references public.languages(id) on delete restrict,
  question_text text not null,
  option_labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rule_id, language_id)
);

create table public.user_service_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  eligibility_answers jsonb not null default '{}'::jsonb,
  eligibility_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, service_id)
);

create table public.user_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  case_id uuid references public.user_service_cases(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, service_id)
);

create table public.user_checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.user_checklists(id) on delete cascade,
  document_type_id uuid not null references public.document_types(id) on delete cascade,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (checklist_id, document_type_id)
);

create index eligibility_rules_service_sort_idx on public.eligibility_rules(service_id, sort_order);
create index eligibility_rule_translations_language_idx on public.eligibility_rules_translations(language_id);
create index user_service_cases_user_idx on public.user_service_cases(user_id);
create index user_checklists_user_idx on public.user_checklists(user_id);
create index user_checklist_items_checklist_idx on public.user_checklist_items(checklist_id);

create trigger eligibility_rules_set_updated_at before update on public.eligibility_rules for each row execute function public.set_updated_at();
create trigger eligibility_rule_translations_set_updated_at before update on public.eligibility_rules_translations for each row execute function public.set_updated_at();
create trigger user_service_cases_set_updated_at before update on public.user_service_cases for each row execute function public.set_updated_at();
create trigger user_checklists_set_updated_at before update on public.user_checklists for each row execute function public.set_updated_at();
create trigger user_checklist_items_set_updated_at before update on public.user_checklist_items for each row execute function public.set_updated_at();

alter table public.eligibility_rules enable row level security;
alter table public.eligibility_rules_translations enable row level security;
alter table public.user_service_cases enable row level security;
alter table public.user_checklists enable row level security;
alter table public.user_checklist_items enable row level security;

create policy "Public can read published eligibility rules" on public.eligibility_rules for select to anon, authenticated using (status in ('active', 'needs_review') and exists (select 1 from public.services where services.id = eligibility_rules.service_id and services.status = 'published'));
create policy "Public can read published eligibility translations" on public.eligibility_rules_translations for select to anon, authenticated using (exists (select 1 from public.eligibility_rules join public.services on services.id = eligibility_rules.service_id where eligibility_rules.id = eligibility_rules_translations.rule_id and eligibility_rules.status in ('active', 'needs_review') and services.status = 'published'));

create policy "Users can read own service cases" on public.user_service_cases for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own service cases" on public.user_service_cases for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own service cases" on public.user_service_cases for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own service cases" on public.user_service_cases for delete to authenticated using (auth.uid() = user_id);

create policy "Users can read own checklists" on public.user_checklists for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own checklists" on public.user_checklists for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own checklists" on public.user_checklists for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own checklists" on public.user_checklists for delete to authenticated using (auth.uid() = user_id);

create policy "Users can read own checklist items" on public.user_checklist_items for select to authenticated using (exists (select 1 from public.user_checklists where user_checklists.id = user_checklist_items.checklist_id and user_checklists.user_id = auth.uid()));
create policy "Users can insert own checklist items" on public.user_checklist_items for insert to authenticated with check (exists (select 1 from public.user_checklists where user_checklists.id = user_checklist_items.checklist_id and user_checklists.user_id = auth.uid()));
create policy "Users can update own checklist items" on public.user_checklist_items for update to authenticated using (exists (select 1 from public.user_checklists where user_checklists.id = user_checklist_items.checklist_id and user_checklists.user_id = auth.uid())) with check (exists (select 1 from public.user_checklists where user_checklists.id = user_checklist_items.checklist_id and user_checklists.user_id = auth.uid()));
create policy "Users can delete own checklist items" on public.user_checklist_items for delete to authenticated using (exists (select 1 from public.user_checklists where user_checklists.id = user_checklist_items.checklist_id and user_checklists.user_id = auth.uid()));

grant select on public.eligibility_rules to anon, authenticated;
grant select on public.eligibility_rules_translations to anon, authenticated;
grant select, insert, update, delete on public.user_service_cases to authenticated;
grant select, insert, update, delete on public.user_checklists to authenticated;
grant select, insert, update, delete on public.user_checklist_items to authenticated;
