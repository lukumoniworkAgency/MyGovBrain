-- Preserve signup name from Supabase Auth metadata in the citizen profile.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120), '')
  )
  on conflict (id) do update
    set full_name = coalesce(
      nullif(left(trim(coalesce(excluded.full_name, '')), 120), ''),
      public.profiles.full_name
    );
  return new;
end;
$$;
