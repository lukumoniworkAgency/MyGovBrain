create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in ('service_search', 'service_view', 'language_changed', 'checklist_created')),
  path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);
alter table public.analytics_events enable row level security;
create policy "Anyone can record minimal analytics" on public.analytics_events for insert to anon, authenticated with check (metadata <@ '{}'::jsonb or jsonb_typeof(metadata) = 'object');
revoke all on public.analytics_events from anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
