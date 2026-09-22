do $$
declare
  assam_id uuid;
  english_id uuid;
  hindi_id uuid;
  category_id uuid;
  department_id uuid;
  target_service_id uuid;
  document_id uuid;
begin
  insert into public.languages (code, name, native_name, direction, status, sort_order)
  values
    ('en', 'English', 'English', 'ltr', 'active', 1),
    ('hi', 'Hindi', 'हिन्दी', 'ltr', 'active', 2)
  on conflict (code) do update set status = excluded.status;

  insert into public.states (name, code, status)
  values ('Assam', 'AS', 'active')
  on conflict (code) do update set status = excluded.status;

  insert into public.service_categories (name, icon, sort_order, status)
  values ('Welfare', 'hand-heart', 1, 'active')
  on conflict (name) do update set status = excluded.status;

  insert into public.departments (state_id, name, status)
  select id, 'Food, Public Distribution and Consumer Affairs, Assam', 'active'
  from public.states where code = 'AS'
  on conflict (state_id, name) do update set status = excluded.status;

  select id into assam_id from public.states where code = 'AS';
  select id into english_id from public.languages where code = 'en';
  select id into hindi_id from public.languages where code = 'hi';
  select id into category_id from public.service_categories where name = 'Welfare';
  select id into department_id from public.departments
    where state_id = assam_id and name = 'Food, Public Distribution and Consumer Affairs, Assam';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (category_id, department_id, assam_id, 'assam-ration-card-application', 'published', 1)
  on conflict (state_id, slug) do update set
    category_id = excluded.category_id,
    department_id = excluded.department_id,
    status = excluded.status,
    version = excluded.version;

  select id into target_service_id from public.services
    where state_id = assam_id and slug = 'assam-ration-card-application';

  insert into public.service_translations (
    service_id, language_id, name, short_description, full_description,
    eligibility_text, how_to_apply_text
  ) values (
    target_service_id,
    english_id,
    'Apply for an Assam Ration Card',
    'Apply for an AAY or PHH ration card under the National Food Security Act through the Assam Food, Public Distribution and Consumer Affairs authority.',
    'The official Assam guidance describes the application cases covered by the page, including a person without a ration card, duplicate cards, migration, marriage, child inclusion, and other changes.',
    'For a new card, the source states that a person without a ration card may apply where the eligibility conditions under the National Food Security Act are met. It identifies the eldest woman of the family as the applicant in the stated case, or the eldest man where there is no adult female member.',
    'Submit the application in the prescribed Proforma-C to the Food, Public Distribution and Consumer Affairs authority of the relevant district or sub-division. The required documents depend on the application case.'
  )
  on conflict (service_id, language_id) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    full_description = excluded.full_description,
    eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.service_translations (
    service_id, language_id, name, short_description, full_description,
    eligibility_text, how_to_apply_text
  ) values (
    target_service_id,
    hindi_id,
    'असम राशन कार्ड के लिए आवेदन',
    'राष्ट्रीय खाद्य सुरक्षा अधिनियम के अंतर्गत AAY या PHH राशन कार्ड के लिए आवेदन।',
    'यह हिंदी अनुवाद मशीन-सहायित प्रारूप है और सरकारी सेवा में दिखाने से पहले भाषाई समीक्षा आवश्यक है।',
    'यह हिंदी अनुवाद मशीन-सहायित प्रारूप है और पात्रता संबंधी भाषा की समीक्षा आवश्यक है।',
    'यह हिंदी अनुवाद मशीन-सहायित प्रारूप है और आवेदन प्रक्रिया की समीक्षा आवश्यक है।'
  )
  on conflict (service_id, language_id) do update set
    name = excluded.name,
    short_description = excluded.short_description,
    full_description = excluded.full_description,
    eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description)
  values
    ('Family member particulars', 'Detailed particulars of family members, as listed by the Assam FPD&CA authority.'),
    ('Birth certificate', 'Birth certificate for minor family members where required by the official instructions.'),
    ('Certified voter-list copy', 'Certified copy of the relevant page of the voter list.'),
    ('Tax or land-revenue receipt', 'Copy of the tax-pay or land-revenue receipt.'),
    ('Surrender or non-availability certificate', 'Required in the applicable previous-card or previous-residence cases.'),
    ('Address proof', 'Official page lists PAN card, driving licence, bank or post-office passbook, municipal holding receipt, electricity bill, or telephone bill as examples.')
  on conflict (name) do update set description = excluded.description;

  for document_id in
    select id from public.document_types where name in (
      'Family member particulars',
      'Birth certificate',
      'Certified voter-list copy',
      'Tax or land-revenue receipt',
      'Surrender or non-availability certificate',
      'Address proof'
    )
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (target_service_id, document_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (
    service_id, source_url, source_title, source_type,
    government_department, verified_at, verified_by, status
  )
  select
    target_service_id,
    'https://fcsca.assam.gov.in/information-services/detail/how-to-apply-for-ration-cards',
    'Apply for Ration Card',
    'official_government_page',
    'Food, Public Distribution and Consumer Affairs, Assam',
    date '2026-09-22',
    null,
    'verified'
  where not exists (
    select 1 from public.service_sources existing_source
    where existing_source.source_url = 'https://fcsca.assam.gov.in/information-services/detail/how-to-apply-for-ration-cards'
  );
end;
$$;