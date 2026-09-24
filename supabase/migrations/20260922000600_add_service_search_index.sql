alter table public.service_translations
  add column search_document tsvector generated always as (
    to_tsvector(
      'simple'::regconfig,
      coalesce(name, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(full_description, '') || ' ' ||
      coalesce(eligibility_text, '') || ' ' ||
      coalesce(how_to_apply_text, '')
    )
  ) stored;

create index service_translations_search_document_idx
  on public.service_translations using gin (search_document);
