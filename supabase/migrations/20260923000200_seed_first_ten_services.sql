-- ============================================================================
-- Part 00 â€” header + reference data for the first-10-services seed.
-- Concatenated into 20260923000200_seed_first_ten_services.sql (do not apply
-- this part file directly).
-- ============================================================================

-- Assamese language (the app supports en/hi/as; only en+hi existed).
insert into public.languages (code, name, native_name, direction, status, sort_order)
values ('as', 'Assamese', 'à¦…à¦¸à¦®à§€à¦¯à¦¼à¦¾', 'ltr', 'active', 3)
on conflict (code) do update set status = excluded.status, native_name = excluded.native_name;

-- Assam state (idempotent; created by the ration-card seed).
insert into public.states (name, code, status)
values ('Assam', 'AS', 'active')
on conflict (code) do update set status = excluded.status;

-- Categories for the first 10 services.
insert into public.service_categories (name, icon, sort_order, status)
values
  ('Identity Documents', 'id-card', 2, 'active'),
  ('Certificates', 'file-badge', 3, 'active'),
  ('Tax & Finance', 'receipt', 4, 'active'),
  ('Travel Documents', 'plane', 5, 'active')
on conflict (name) do update set status = excluded.status;

-- Departments (state-scoped; all rows attach to Assam).
insert into public.departments (state_id, name, status)
select s.id, d.name, 'active'
from public.states s
cross join (values
  ('Unique Identification Authority of India'),
  ('Income Tax Department, Government of India'),
  ('Consular, Passport and Visa Division, Ministry of External Affairs'),
  ('Election Commission of India'),
  ('Ministry of Road Transport and Highways'),
  ('Office of the Registrar General and Census Commissioner, India'),
  ('Revenue and Disaster Management Department, Assam')
) as d(name)
where s.code = 'AS'
on conflict (state_id, name) do update set status = excluded.status;

-- â”€â”€ 1. Aadhaar Card Services (UIDAI) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Identity Documents';
  select id into dept_id from public.departments where state_id = st_id and name = 'Unique Identification Authority of India';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'aadhaar-card-services', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'aadhaar-card-services';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Aadhaar Card Services',
   'Enrol for a new Aadhaar or update name, address, mobile number and biometrics.',
   'Aadhaar is a 12-digit unique identity number issued by the Unique Identification Authority of India (UIDAI). Services include fresh enrolment, demographic updates (name, address, date of birth, mobile number) and biometric updates at Aadhaar Seva Kendras.',
   'Any resident of India can enrol for Aadhaar. Children under 5 get a Baal Aadhaar linked to a parent. Demographic or biometric updates need the existing Aadhaar number.',
   'Book an appointment on the myAadhaar portal or visit an Aadhaar Seva Kendra with proof of identity and address. Biometric updates must be done in person at an enrolment centre.'),
  (svc_id, hi_id, 'à¤†à¤§à¤¾à¤° à¤•à¤¾à¤°à¥à¤¡ à¤¸à¥‡à¤µà¤¾à¤à¤',
   'à¤¨à¤¯à¤¾ à¤†à¤§à¤¾à¤° à¤¬à¤¨à¤µà¤¾à¤à¤ à¤¯à¤¾ à¤¨à¤¾à¤®, à¤ªà¤¤à¤¾, à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤° à¤”à¤° à¤¬à¤¾à¤¯à¥‹à¤®à¥‡à¤Ÿà¥à¤°à¤¿à¤•à¥à¤¸ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚à¥¤',
   'à¤†à¤§à¤¾à¤° à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤ªà¤¹à¤šà¤¾à¤¨ à¤ªà¥à¤°à¤¾à¤§à¤¿à¤•à¤°à¤£ (à¤¯à¥‚à¤†à¤ˆà¤¡à¥€à¤à¤†à¤ˆ) à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤°à¥€ 12 à¤…à¤‚à¤•à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤ªà¤¹à¤šà¤¾à¤¨ à¤¸à¤‚à¤–à¥à¤¯à¤¾ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤®à¥‡à¤‚ à¤¨à¤¯à¤¾ à¤¨à¤¾à¤®à¤¾à¤‚à¤•à¤¨, à¤œà¤¨à¤¸à¤¾à¤‚à¤–à¥à¤¯à¤¿à¤•à¥€à¤¯ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤”à¤° à¤†à¤§à¤¾à¤° à¤¸à¥‡à¤µà¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤°à¥‹à¤‚ à¤ªà¤° à¤¬à¤¾à¤¯à¥‹à¤®à¥‡à¤Ÿà¥à¤°à¤¿à¤• à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¤‚à¥¤',
   'à¤­à¤¾à¤°à¤¤ à¤•à¤¾ à¤•à¥‹à¤ˆ à¤­à¥€ à¤¨à¤¿à¤µà¤¾à¤¸à¥€ à¤†à¤§à¤¾à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤¨à¤¾à¤®à¤¾à¤‚à¤•à¤¨ à¤•à¤°à¤¾ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤ 5 à¤µà¤°à¥à¤· à¤¸à¥‡ à¤•à¤® à¤¬à¤šà¥à¤šà¥‹à¤‚ à¤•à¤¾ à¤¬à¤¾à¤² à¤†à¤§à¤¾à¤° à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾ à¤¸à¥‡ à¤œà¥à¤¡à¤¼à¤¾ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤•à¥‡ à¤²à¤¿à¤ à¤®à¥Œà¤œà¥‚à¤¦à¤¾ à¤†à¤§à¤¾à¤° à¤¨à¤‚à¤¬à¤° à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤®à¥‡à¤°à¤¾ à¤†à¤§à¤¾à¤° à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚ à¤¯à¤¾ à¤ªà¤¹à¤šà¤¾à¤¨ à¤”à¤° à¤ªà¤¤à¥‡ à¤•à¥‡ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤†à¤§à¤¾à¤° à¤¸à¥‡à¤µà¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤œà¤¾à¤à¤à¥¤ à¤¬à¤¾à¤¯à¥‹à¤®à¥‡à¤Ÿà¥à¤°à¤¿à¤• à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¨à¤¾à¤®à¤¾à¤‚à¤•à¤¨ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤ªà¤° à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤°à¥‚à¤ª à¤¸à¥‡ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤'),
  (svc_id, as_id, 'à¦†à¦§à¦¾à§° à¦•à¦¾à§°à§à¦¡ à¦¸à§‡à§±à¦¾',
   'à¦¨à¦¤à§à¦¨ à¦†à¦§à¦¾à§° à¦•à§°à¦• à¦¬à¦¾ à¦¨à¦¾à¦®, à¦ à¦¿à¦•à¦¨à¦¾, à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à§° à¦†à§°à§ à¦¬à¦¾à¦¯à¦¼à§‹à¦®à§‡à¦Ÿà§à§°à¦¿à¦• à¦†à¦ªà¦¡à§‡à¦Ÿ à¦•à§°à¦•à¥¤',
   'à¦†à¦§à¦¾à§° à¦­à¦¾à§°à¦¤à§€à¦¯à¦¼ à¦¬à¦¿à¦¶à¦¿à¦·à§à¦Ÿ à¦ªà¦¹à¦¿à¦šà¦¾à¦¨ à¦•à§°à§à¦¤à§ƒà¦ªà¦•à§à¦· (à¦‡à¦‰à¦†à¦‡à¦¡à¦¿à¦à¦†à¦‡) à¦¦à§à¦¬à¦¾à§°à¦¾ à¦¦à¦¿à¦¯à¦¼à¦¾ à§§à§¨ à¦¸à¦‚à¦–à§à¦¯à¦¾à§° à¦¬à¦¿à¦¶à¦¿à¦·à§à¦Ÿ à¦ªà¦¹à¦¿à¦šà¦¾à¦¨ à¦¨à¦®à§à¦¬à§°à¥¤ à¦¨à¦¤à§à¦¨ à¦¨à¦¾à¦®à¦¾à¦‚à¦•à¦¨, à¦œà¦¨à¦—à¦¾à¦à¦¥à¦¨à¦¿ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦†à§°à§ à¦†à¦§à¦¾à§° à¦¸à§‡à§±à¦¾ à¦•à§‡à¦¨à§à¦¦à§à§°à¦¤ à¦¬à¦¾à¦¯à¦¼à§‹à¦®à§‡à¦Ÿà§à§°à¦¿à¦• à¦†à¦ªà¦¡à§‡à¦Ÿ à¦‡à¦¯à¦¼à¦¾à§° à¦…à¦¨à§à¦¤à§°à§à¦—à¦¤à¥¤',
   'à¦­à¦¾à§°à¦¤à§° à¦¯à¦¿à¦•à§‹à¦¨à§‹ à¦¬à¦¾à¦¸à¦¿à¦¨à§à¦¦à¦¾à¦‡ à¦†à¦§à¦¾à§°à§° à¦¬à¦¾à¦¬à§‡ à¦¨à¦¾à¦®à¦¾à¦‚à¦•à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦†à¦ªà¦¡à§‡à¦Ÿà§° à¦¬à¦¾à¦¬à§‡ à¦¬à§°à§à¦¤à¦®à¦¾à¦¨ à¦†à¦§à¦¾à§° à¦¨à¦®à§à¦¬à§° à¦²à¦¾à¦—à¦¿à¦¬à¥¤',
   'à¦®à§‹à§° à¦†à¦§à¦¾à§° à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦à¦ªà¦‡à¦£à§à¦Ÿà¦®à§‡à¦£à§à¦Ÿ à¦¬à§à¦• à¦•à§°à¦• à¦¬à¦¾ à¦ªà¦¹à¦¿à¦šà¦¾à¦¨ à¦†à§°à§ à¦ à¦¿à¦•à¦¨à¦¾à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦²à§ˆ à¦†à¦§à¦¾à§° à¦¸à§‡à§±à¦¾ à¦•à§‡à¦¨à§à¦¦à§à§°à¦²à§ˆ à¦¯à¦¾à¦“à¦•à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Proof of identity', 'Passport, PAN card, voter ID, driving licence or government photo ID.'),
    ('Proof of address', 'Utility bill, bank passbook, rent agreement or municipal holding receipt.'),
    ('Proof of date of birth', 'Birth certificate, school certificate, passport or PAN card.'),
    ('Proof of relationship (for Baal Aadhaar)', 'Birth certificate of the child with parent Aadhaar.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Proof of date of birth', 'Proof of relationship (for Baal Aadhaar)')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://uidai.gov.in', 'Unique Identification Authority of India', 'official_government_page',
    'Unique Identification Authority of India', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.source_url = 'https://uidai.gov.in');
end;
$$;

-- â”€â”€ 2. PAN Card Application (Income Tax Department) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Tax & Finance';
  select id into dept_id from public.departments where state_id = st_id and name = 'Income Tax Department, Government of India';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'pan-card-application', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'pan-card-application';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'PAN Card Application',
   'Apply for a new PAN card, corrections, or a reprint through NSDL or UTIITSL.',
   'Permanent Account Number (PAN) is a 10-character alphanumeric identifier issued by the Income Tax Department. It is required for filing income tax returns, high-value financial transactions, and opening bank or demat accounts. Applications (Form 49A for Indians, 49AA for foreigners) are processed through NSDL e-Gov or UTIITSL.',
   'All Indian citizens, including minors (through a guardian), companies and foreign entities transacting in India can apply. One person may hold only one PAN.',
   'Fill Form 49A online on the NSDL or UTIITSL portal, upload photo, signature, identity, address and birth proofs, pay the fee, and send or e-sign the acknowledgement. The e-PAN usually arrives by email within days.'),
  (svc_id, hi_id, 'à¤ªà¥ˆà¤¨ à¤•à¤¾à¤°à¥à¤¡ à¤†à¤µà¥‡à¤¦à¤¨',
   'à¤à¤¨à¤à¤¸à¤¡à¥€à¤à¤² à¤¯à¤¾ à¤¯à¥‚à¤Ÿà¥€à¤†à¤ˆà¤†à¤ˆà¤Ÿà¥€à¤à¤¸à¤à¤² à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ à¤¨à¤¯à¤¾ à¤ªà¥ˆà¤¨ à¤•à¤¾à¤°à¥à¤¡, à¤¸à¥à¤§à¤¾à¤° à¤¯à¤¾ à¤ªà¥à¤¨à¤°à¥à¤®à¥à¤¦à¥à¤°à¤£ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚à¥¤',
   'à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤–à¤¾à¤¤à¤¾ à¤¸à¤‚à¤–à¥à¤¯à¤¾ (à¤ªà¥ˆà¤¨) à¤†à¤¯à¤•à¤° à¤µà¤¿à¤­à¤¾à¤— à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤°à¥€ 10 à¤…à¤•à¥à¤·à¤°à¥‹à¤‚ à¤•à¥€ à¤ªà¤¹à¤šà¤¾à¤¨ à¤¸à¤‚à¤–à¥à¤¯à¤¾ à¤¹à¥ˆà¥¤ à¤†à¤¯à¤•à¤° à¤°à¤¿à¤Ÿà¤°à¥à¤¨, à¤µà¤¿à¤¤à¥à¤¤à¥€à¤¯ à¤²à¥‡à¤¨à¤¦à¥‡à¤¨ à¤”à¤° à¤¬à¥ˆà¤‚à¤• à¤–à¤¾à¤¤à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤¨à¤¾à¤¬à¤¾à¤²à¤¿à¤— (à¤…à¤­à¤¿à¤­à¤¾à¤µà¤• à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡), à¤•à¤‚à¤ªà¤¨à¤¿à¤¯à¤¾à¤ à¤”à¤° à¤µà¤¿à¤¦à¥‡à¤¶à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤à¤ à¤¸à¤¹à¤¿à¤¤ à¤¸à¤­à¥€ à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤¨à¤¾à¤—à¤°à¤¿à¤• à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤à¤• à¤µà¥à¤¯à¤•à¥à¤¤à¤¿ à¤•à¥‡ à¤ªà¤¾à¤¸ à¤•à¥‡à¤µà¤² à¤à¤• à¤ªà¥ˆà¤¨ à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤',
   'à¤à¤¨à¤à¤¸à¤¡à¥€à¤à¤² à¤¯à¤¾ à¤¯à¥‚à¤Ÿà¥€à¤†à¤ˆà¤†à¤ˆà¤Ÿà¥€à¤à¤¸à¤à¤² à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤«à¥‰à¤°à¥à¤® 49A à¤­à¤°à¥‡à¤‚, à¤«à¥‹à¤Ÿà¥‹, à¤¹à¤¸à¥à¤¤à¤¾à¤•à¥à¤·à¤° à¤”à¤° à¤ªà¥à¤°à¤®à¤¾à¤£ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚, à¤¶à¥à¤²à¥à¤• à¤•à¤¾ à¤­à¥à¤—à¤¤à¤¾à¤¨ à¤•à¤°à¥‡à¤‚à¥¤ à¤ˆ-à¤ªà¥ˆà¤¨ à¤†à¤®à¤¤à¥Œà¤° à¤ªà¤° à¤•à¥à¤› à¤¦à¤¿à¤¨à¥‹à¤‚ à¤®à¥‡à¤‚ à¤ˆà¤®à¥‡à¤² à¤¸à¥‡ à¤®à¤¿à¤²à¤¤à¤¾ à¤¹à¥ˆà¥¤'),
  (svc_id, as_id, 'à¦ªà§‡à¦¨ à¦•à¦¾à§°à§à¦¡ à¦†à¦¬à§‡à¦¦à¦¨',
   'à¦à¦¨à¦à¦›à¦¡à¦¿à¦à¦² à¦¬à¦¾ à¦‡à¦‰à¦Ÿà¦¿à¦†à¦‡à¦†à¦‡à¦Ÿà¦¿à¦à¦›à¦à¦²à§° à¦œà§°à¦¿à¦¯à¦¼à¦¤à§‡ à¦¨à¦¤à§à¦¨ à¦ªà§‡à¦¨ à¦•à¦¾à§°à§à¦¡, à¦¸à¦‚à¦¶à§‹à¦§à¦¨ à¦¬à¦¾ à¦ªà§à¦¨à§°à§à¦®à§à¦¦à§à§°à¦£à§° à¦¬à¦¾à¦¬à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•à¥¤',
   'à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦à¦•à¦¾à¦‰à¦£à§à¦Ÿ à¦¨à¦®à§à¦¬à§° (à¦ªà§‡à¦¨) à¦†à¦¯à¦¼à¦•à§° à¦¬à¦¿à¦­à¦¾à¦—à§‡ à¦¦à¦¿à¦¯à¦¼à¦¾ à§§à§¦ à¦†à¦–à§°à§° à¦ªà¦¹à¦¿à¦šà¦¾à¦¨ à¦¨à¦®à§à¦¬à§°à¥¤ à¦†à¦¯à¦¼à¦•à§° à§°à¦¿à¦Ÿà¦¾à§°à§à¦£, à¦¬à¦¿à¦¤à§à¦¤à§€à¦¯à¦¼ à¦²à§‡à¦¨à¦¦à§‡à¦¨ à¦†à§°à§ à¦¬à§‡à¦™à§à¦• à¦à¦•à¦¾à¦‰à¦£à§à¦Ÿà§° à¦¬à¦¾à¦¬à§‡ à¦ªà§à§°à¦¯à¦¼à§‹à¦œà¦¨à¥¤',
   'à¦¨à¦¾à¦¬à¦¾à¦²à¦¿à¦• (à¦…à¦­à¦¿à¦­à¦¾à§±à¦•à§° à¦œà§°à¦¿à¦¯à¦¼à¦¤à§‡), à¦•à§‹à¦®à§à¦ªà¦¾à¦¨à§€ à¦†à§°à§ à¦¬à¦¿à¦¦à§‡à¦¶à§€ à¦ªà§à§°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à¦¸à¦¹ à¦¸à¦•à¦²à§‹ à¦­à¦¾à§°à¦¤à§€à¦¯à¦¼ à¦¨à¦¾à¦—à§°à¦¿à¦•à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦à¦œà¦¨à§° à¦“à¦šà§°à¦¤ à¦®à¦¾à¦¤à§à§° à¦à¦–à¦¨ à¦ªà§‡à¦¨ à¦¥à¦¾à¦•à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤',
   'à¦à¦¨à¦à¦›à¦¡à¦¿à¦à¦² à¦¬à¦¾ à¦‡à¦‰à¦Ÿà¦¿à¦†à¦‡à¦†à¦‡à¦Ÿà¦¿à¦à¦›à¦à¦² à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦«à§°à§à¦® 49A à¦ªà§‚à§°à¦£ à¦•à§°à¦•, à¦«à¦Ÿà§‹, à¦šà¦¹à§€ à¦†à§°à§ à¦ªà§à§°à¦®à¦¾à¦£ à¦†à¦ªà¦²à§‹à¦¡ à¦•à§°à¦•, à¦®à¦¾à¦šà§à¦² à¦¦à¦¿à¦¯à¦¼à¦•à¥¤ à¦‡-à¦ªà§‡à¦¨ à¦¸à¦¾à¦§à¦¾à§°à¦£à¦¤à§‡ à¦•à§‡à¦‡à¦¦à¦¿à¦¨à¦®à¦¾à¦¨à¦¤ à¦‡à¦®à§‡à¦‡à¦²à¦¤ à¦†à¦¹à§‡à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Passport-size photograph', 'Recent colour photograph as per portal specifications.'),
    ('Signature specimen', 'Signature on plain paper scanned for the PAN card.'),
    ('Aadhaar card (e-KYC)', 'Aadhaar can serve as proof of identity, address and birth for e-sign.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Proof of date of birth', 'Passport-size photograph', 'Signature specimen', 'Aadhaar card (e-KYC)')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://www.incometax.gov.in', 'Income Tax Department â€” PAN Services', 'official_government_page',
    'Income Tax Department, Government of India', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.source_url = 'https://www.incometax.gov.in');
end;
$$;

-- â”€â”€ 3. Passport Services (CPV Division, MEA) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Travel Documents';
  select id into dept_id from public.departments where state_id = st_id and name = 'Consular, Passport and Visa Division, Ministry of External Affairs';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'passport-services', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'passport-services';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Passport Services',
   'Apply for a fresh passport, reissue, renewal, or personal-detail updates.',
   'An Indian passport is issued by the Consular, Passport and Visa (CPV) Division through Passport Seva Kendras. Services include fresh issue, reissue on expiry or loss, renewal, and changes to name, address or spouse details. Most applications include a police verification step.',
   'Indian citizens can apply. Minors receive a 5-year passport applied through a parent or guardian. Tatkaal fast-track is available for urgent travel needs.',
   'Register on the Passport Seva portal, fill the application form, pay the fee online, book a PSK appointment, and carry original identity, address and birth proofs with photocopies to the appointment.'),
  (svc_id, hi_id, 'à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤¸à¥‡à¤µà¤¾à¤à¤',
   'à¤¨à¤¯à¤¾ à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ, à¤ªà¥à¤¨à¤ƒ à¤œà¤¾à¤°à¥€, à¤¨à¤µà¥€à¤¨à¥€à¤•à¤°à¤£ à¤¯à¤¾ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤µà¤¿à¤µà¤°à¤£ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚à¥¤',
   'à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¤¾à¤‚à¤¸à¥à¤²à¤°, à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤à¤µà¤‚ à¤µà¥€à¤œà¤¼à¤¾ à¤ªà¥à¤°à¤­à¤¾à¤— à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤¸à¥‡à¤µà¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤°à¥‹à¤‚ à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤®à¥‡à¤‚ à¤¨à¤¯à¤¾ à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ, à¤¸à¤®à¤¾à¤ªà¥à¤¤à¤¿ à¤¯à¤¾ à¤–à¥‹à¤¨à¥‡ à¤ªà¤° à¤ªà¥à¤¨à¤ƒ à¤œà¤¾à¤°à¥€, à¤¨à¤µà¥€à¤¨à¥€à¤•à¤°à¤£ à¤”à¤° à¤¨à¤¾à¤®-à¤ªà¤¤à¤¾ à¤¸à¤‚à¤¶à¥‹à¤§à¤¨ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¤‚à¥¤ à¤…à¤§à¤¿à¤•à¤¾à¤‚à¤¶ à¤†à¤µà¥‡à¤¦à¤¨à¥‹à¤‚ à¤®à¥‡à¤‚ à¤ªà¥à¤²à¤¿à¤¸ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤',
   'à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤¨à¤¾à¤—à¤°à¤¿à¤• à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¨à¤¾à¤¬à¤¾à¤²à¤¿à¤—à¥‹à¤‚ à¤•à¥‹ à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾ à¤¯à¤¾ à¤…à¤­à¤¿à¤­à¤¾à¤µà¤• à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ 5 à¤µà¤°à¥à¤·à¥€à¤¯ à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤®à¤¿à¤²à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤…à¤¤à¥à¤¯à¤¾à¤µà¤¶à¥à¤¯à¤• à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤¹à¥‡à¤¤à¥ à¤¤à¤¤à¥à¤•à¤¾à¤² à¤¸à¥‡à¤µà¤¾ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¹à¥ˆà¥¤',
   'à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ à¤¸à¥‡à¤µà¤¾ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¤°à¥‡à¤‚, à¤«à¥‰à¤°à¥à¤® à¤­à¤°à¥‡à¤‚, à¤¶à¥à¤²à¥à¤• à¤•à¤¾ à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤­à¥à¤—à¤¤à¤¾à¤¨ à¤•à¤°à¥‡à¤‚, à¤ªà¥€à¤à¤¸à¤•à¥‡ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤®à¥‚à¤² à¤ªà¤¹à¤šà¤¾à¤¨, à¤ªà¤¤à¤¾ à¤µ à¤œà¤¨à¥à¤® à¤ªà¥à¤°à¤®à¤¾à¤£à¤ªà¤¤à¥à¤°à¥‹à¤‚ à¤•à¥€ à¤«à¥‹à¤Ÿà¥‹à¤•à¥‰à¤ªà¥€ à¤¸à¤¹à¤¿à¤¤ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤ªà¤° à¤œà¤¾à¤à¤à¥¤'),
  (svc_id, as_id, 'à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ à¦¸à§‡à§±à¦¾',
   'à¦¨à¦¤à§à¦¨ à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ, à¦ªà§à¦¨à§° à¦‡à¦›à§à¦¯à§, à¦¨à¦¬à§€à¦•à§°à¦£ à¦¬à¦¾ à¦¬à§à¦¯à¦•à§à¦¤à¦¿à¦—à¦¤ à¦¬à¦¿à§±à§°à¦£ à¦†à¦ªà¦¡à§‡à¦Ÿà§° à¦¬à¦¾à¦¬à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•à¥¤',
   'à¦­à¦¾à§°à¦¤à§€à¦¯à¦¼ à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ à¦•à¦¨à¦›à§à¦²à¦¾à§°, à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ à¦†à§°à§ à¦­à¦¿à¦›à¦¾ à¦¬à¦¿à¦­à¦¾à¦—à§‡ à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ à¦¸à§‡à§±à¦¾ à¦•à§‡à¦¨à§à¦¦à§à§°à§° à¦œà§°à¦¿à¦¯à¦¼à¦¤à§‡ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦¨à¦¤à§à¦¨ à¦‡à¦›à§à¦¯à§, à¦®à§à¦¯à¦¾à¦¦ à¦¶à§‡à¦· à¦¬à¦¾ à¦¹à§‡à§°à§à§±à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦ªà§à¦¨à§° à¦‡à¦›à§à¦¯à§, à¦¨à¦¬à§€à¦•à§°à¦£ à¦†à§°à§ à¦¨à¦¾à¦®-à¦ à¦¿à¦•à¦¨à¦¾ à¦¸à¦‚à¦¶à§‹à¦§à¦¨ à¦‡à¦¯à¦¼à¦¾à§° à¦…à¦¨à§à¦¤à§°à§à¦—à¦¤à¥¤ à¦¬à§‡à¦›à¦¿à¦­à¦¾à¦— à¦†à¦¬à§‡à¦¦à¦¨à¦¤ à¦†à§°à¦•à§à¦·à§€ à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨ à¦¹à¦¯à¦¼à¥¤',
   'à¦­à¦¾à§°à¦¤à§€à¦¯à¦¼ à¦¨à¦¾à¦—à§°à¦¿à¦•à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦¨à¦¾à¦¬à¦¾à¦²à¦¿à¦•à§‡ à¦ªà¦¿à¦¤à§ƒ-à¦®à¦¾à¦¤à§ƒ à¦¬à¦¾ à¦…à¦­à¦¿à¦­à¦¾à§±à¦•à§° à¦œà§°à¦¿à¦¯à¦¼à¦¤à§‡ à§« à¦¬à¦›à§°à§€à¦¯à¦¼à¦¾ à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ à¦ªà¦¾à¦¯à¦¼à¥¤ à¦œà§°à§à§°à§€ à¦­à§à§°à¦®à¦£à§° à¦¬à¦¾à¦¬à§‡ à¦¤à§Žà¦•à¦¾à¦² à¦¸à§‡à§±à¦¾ à¦†à¦›à§‡à¥¤',
   'à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ à¦¸à§‡à§±à¦¾ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦•, à¦«à§°à§à¦® à¦ªà§‚à§°à¦£ à¦•à§°à¦•, à¦®à¦¾à¦šà§à¦² à¦…à¦¨à¦²à¦¾à¦‡à¦¨ à¦¦à¦¿à¦¯à¦¼à¦•, à¦ªà¦¿à¦à¦›à¦•à§‡ à¦à¦ªà¦‡à¦£à§à¦Ÿà¦®à§‡à¦£à§à¦Ÿ à¦¬à§à¦• à¦•à§°à¦• à¦†à§°à§ à¦®à§‚à¦² à¦ªà¦¹à¦¿à¦šà¦¾à¦¨, à¦ à¦¿à¦•à¦¨à¦¾ à¦“ à¦œà¦¨à§à¦® à¦ªà§à§°à¦®à¦¾à¦£à§° à¦«à¦Ÿà§‹à¦•à¦ªà¦¿à¦¸à¦¹ à¦à¦ªà¦‡à¦£à§à¦Ÿà¦®à§‡à¦£à§à¦Ÿà¦²à§ˆ à¦¯à¦¾à¦“à¦•à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Previous passport (for reissue)', 'Old passport booklet required for renewal or reissue cases.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Proof of date of birth', 'Passport-size photograph', 'Previous passport (for reissue)')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://www.passportindia.gov.in', 'Passport Seva â€” Ministry of External Affairs', 'official_government_page',
    'Consular, Passport and Visa Division, Ministry of External Affairs', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://www.passportindia.gov.in');
end;
$$;

-- â”€â”€ 4. Voter ID Registration (Election Commission of India) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Identity Documents';
  select id into dept_id from public.departments where state_id = st_id and name = 'Election Commission of India';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'voter-id-registration', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'voter-id-registration';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Voter ID Registration',
   'Register as a voter and get your Elector Photo Identity Card (EPIC).',
   'The Elector Photo Identity Card (EPIC), commonly called the Voter ID, is issued by the Election Commission of India. Services include new registration (Form 6), correction of details (Form 8), shifting constituency, and downloading e-EPIC from the voters portal.',
   'Every Indian citizen aged 18 years or above on the qualifying date of 1 January, 1 April, 1 July or 1 October can register. You must be ordinarily resident at the address in the constituency.',
   'Fill Form 6 on the Voters Services Portal or the Voter Helpline app, upload a photo, identity, address and age proof, and submit. The Booth Level Officer verifies the details before the EPIC is issued.'),
  (svc_id, hi_id, 'à¤®à¤¤à¤¦à¤¾à¤¤à¤¾ à¤ªà¤¹à¤šà¤¾à¤¨ à¤ªà¤¤à¥à¤° à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£',
   'à¤®à¤¤à¤¦à¤¾à¤¤à¤¾ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤…à¤ªà¤¨à¤¾ à¤®à¤¤à¤¦à¤¾à¤¤à¤¾ à¤«à¥‹à¤Ÿà¥‹ à¤ªà¤¹à¤šà¤¾à¤¨ à¤ªà¤¤à¥à¤° (à¤à¤ªà¤¿à¤•) à¤ªà¤¾à¤à¤à¥¤',
   'à¤®à¤¤à¤¦à¤¾à¤¤à¤¾ à¤«à¥‹à¤Ÿà¥‹ à¤ªà¤¹à¤šà¤¾à¤¨ à¤ªà¤¤à¥à¤° (à¤à¤ªà¤¿à¤•) à¤­à¤¾à¤°à¤¤ à¤¨à¤¿à¤°à¥à¤µà¤¾à¤šà¤¨ à¤†à¤¯à¥‹à¤— à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤®à¥‡à¤‚ à¤¨à¤¯à¤¾ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ (à¤«à¥‰à¤°à¥à¤® 6), à¤µà¤¿à¤µà¤°à¤£ à¤¸à¥à¤§à¤¾à¤° (à¤«à¥‰à¤°à¥à¤® 8), à¤¨à¤¿à¤°à¥à¤µà¤¾à¤šà¤¨ à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤¬à¤¦à¤²à¤¨à¤¾ à¤”à¤° à¤ˆ-à¤à¤ªà¤¿à¤• à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¤‚à¥¤',
   '1 à¤œà¤¨à¤µà¤°à¥€, 1 à¤…à¤ªà¥à¤°à¥ˆà¤², 1 à¤œà¥à¤²à¤¾à¤ˆ à¤¯à¤¾ 1 à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤° à¤•à¥€ à¤…à¤°à¥à¤¹à¤¤à¤¾ à¤¤à¤¿à¤¥à¤¿ à¤•à¥‹ 18 à¤µà¤°à¥à¤· à¤¯à¤¾ à¤…à¤§à¤¿à¤• à¤†à¤¯à¥ à¤•à¤¾ à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤­à¤¾à¤°à¤¤à¥€à¤¯ à¤¨à¤¾à¤—à¤°à¤¿à¤• à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¤°à¤¾ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤‰à¤¸à¥€ à¤¨à¤¿à¤°à¥à¤µà¤¾à¤šà¤¨ à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤•à¥‡ à¤ªà¤¤à¥‡ à¤ªà¤° à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤¨à¤¿à¤µà¤¾à¤¸ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤®à¤¤à¤¦à¤¾à¤¤à¤¾ à¤¸à¥‡à¤µà¤¾ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤¯à¤¾ à¤µà¥‹à¤Ÿà¤° à¤¹à¥‡à¤²à¥à¤ªà¤²à¤¾à¤‡à¤¨ à¤à¤ª à¤ªà¤° à¤«à¥‰à¤°à¥à¤® 6 à¤­à¤°à¥‡à¤‚, à¤«à¥‹à¤Ÿà¥‹, à¤ªà¤¹à¤šà¤¾à¤¨, à¤ªà¤¤à¤¾ à¤”à¤° à¤†à¤¯à¥ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚à¥¤ à¤¬à¥‚à¤¥ à¤²à¥‡à¤µà¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¥‡ à¤¬à¤¾à¤¦ à¤à¤ªà¤¿à¤• à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤'),
  (svc_id, as_id, 'à¦­à§‹à¦Ÿà¦¾à§° à¦ªà§°à¦¿à¦šà¦¯à¦¼ à¦ªà¦¤à§à§° à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨',
   'à¦­à§‹à¦Ÿà¦¾à§° à¦¹à¦¿à¦šà¦¾à¦ªà§‡ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦• à¦†à§°à§ à¦†à¦ªà§‹à¦¨à¦¾à§° à¦­à§‹à¦Ÿà¦¾à§° à¦«à¦Ÿà§‹ à¦ªà§°à¦¿à¦šà¦¯à¦¼ à¦ªà¦¤à§à§° (à¦à¦ªà¦¿à¦•) à¦ªà¦¾à¦“à¦•à¥¤',
   'à¦­à§‹à¦Ÿà¦¾à§° à¦«à¦Ÿà§‹ à¦ªà§°à¦¿à¦šà¦¯à¦¼ à¦ªà¦¤à§à§° (à¦à¦ªà¦¿à¦•) à¦­à¦¾à§°à¦¤à§° à¦¨à¦¿à§°à§à¦¬à¦¾à¦šà¦¨ à¦†à¦¯à¦¼à§‹à¦—à§‡ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦¨à¦¤à§à¦¨ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ (à¦«à§°à§à¦® 6), à¦¬à¦¿à§±à§°à¦£ à¦¸à¦‚à¦¶à§‹à¦§à¦¨ (à¦«à§°à§à¦® 8), à¦¸à¦®à¦·à§à¦Ÿà¦¿ à¦¸à¦²à¦¨à¦¿ à¦†à§°à§ à¦‡-à¦à¦ªà¦¿à¦• à¦¡à¦¾à¦‰à¦¨à¦²à§‹à¦¡ à¦‡à¦¯à¦¼à¦¾à§° à¦…à¦¨à§à¦¤à§°à§à¦—à¦¤à¥¤',
   'à§§ à¦œà¦¾à¦¨à§à§±à¦¾à§°à§€, à§§ à¦à¦ªà§à§°à¦¿à¦², à§§ à¦œà§à¦²à¦¾à¦‡ à¦¬à¦¾ à§§ à¦…à¦•à§à¦Ÿà§‹à¦¬à§°à§° à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾à§° à¦¤à¦¾à§°à¦¿à¦–à¦¤ à§§à§® à¦¬à¦›à§° à¦¬à¦¾ à¦¤à¦¾à¦¤à¦•à§ˆ à¦¬à§‡à¦›à¦¿ à¦¬à¦¯à¦¼à¦¸à§° à¦ªà§à§°à¦¤à¦¿à¦œà¦¨ à¦­à¦¾à§°à¦¤à§€à¦¯à¦¼ à¦¨à¦¾à¦—à§°à¦¿à¦•à§‡ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦¸à§‡à¦‡ à¦¸à¦®à¦·à§à¦Ÿà¦¿à§° à¦ à¦¿à¦•à¦¨à¦¾à¦¤ à¦¸à¦¾à¦§à¦¾à§°à¦£ à¦¬à¦¾à¦¸à¦¿à¦¨à§à¦¦à¦¾ à¦¹â€™à¦¬ à¦²à¦¾à¦—à¦¿à¦¬à¥¤',
   'à¦­à§‹à¦Ÿà¦¾à§° à¦¸à§‡à§±à¦¾ à¦ªà§‹à§°à§à¦Ÿà§‡à¦² à¦¬à¦¾ à¦­à§‹à¦Ÿà¦¾à§° à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨ à¦à¦ªà¦¤ à¦«à§°à§à¦® 6 à¦ªà§‚à§°à¦£ à¦•à§°à¦•, à¦«à¦Ÿà§‹, à¦ªà¦¹à¦¿à¦šà¦¾à¦¨, à¦ à¦¿à¦•à¦¨à¦¾ à¦†à§°à§ à¦¬à¦¯à¦¼à¦¸à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦†à¦ªà¦²à§‹à¦¡ à¦•à§°à¦•à¥¤ à¦¬à§à¦¥ à¦ªà§°à§à¦¯à¦¾à¦¯à¦¼à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾à¦‡ à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨ à¦•à§°à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦à¦ªà¦¿à¦• à¦¦à¦¿à¦¯à¦¼à¦¾ à¦¹à¦¯à¦¼à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Proof of date of birth', 'Passport-size photograph')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://voters.eci.gov.in', 'Voters Services Portal â€” Election Commission of India', 'official_government_page',
    'Election Commission of India', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://voters.eci.gov.in');
end;
$$;

-- â”€â”€ 5. Driving Licence Services (MoRTH) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Identity Documents';
  select id into dept_id from public.departments where state_id = st_id and name = 'Ministry of Road Transport and Highways';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'driving-licence-services', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'driving-licence-services';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Driving Licence Services',
   'Apply for a learner licence, permanent licence, renewal or duplicate.',
   'A driving licence is issued under the Motor Vehicles Act, 1988 through the Sarathi portal of the Ministry of Road Transport and Highways. Services include learner licence, permanent licence after the driving test, renewal, duplicate issue, and addition of vehicle classes.',
   'Applicants must be 16+ for gearless two-wheelers, 18+ for cars and geared vehicles, and 20+ for transport vehicles. A learner licence held for at least 30 days is required before the permanent licence test.',
   'Apply on the Sarathi portal, upload photo, signature, identity, address and age proofs, book a slot at the RTO, pass the learner test and then the driving test. Licences are dispatched after approval.'),
  (svc_id, hi_id, 'à¤¡à¥à¤°à¤¾à¤‡à¤µà¤¿à¤‚à¤— à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸ à¤¸à¥‡à¤µà¤¾à¤à¤',
   'à¤²à¤°à¥à¤¨à¤° à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸, à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸, à¤¨à¤µà¥€à¤¨à¥€à¤•à¤°à¤£ à¤¯à¤¾ à¤¡à¥à¤ªà¥à¤²à¤¿à¤•à¥‡à¤Ÿ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚à¥¤',
   'à¤¡à¥à¤°à¤¾à¤‡à¤µà¤¿à¤‚à¤— à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸ à¤®à¥‹à¤Ÿà¤° à¤µà¤¾à¤¹à¤¨ à¤…à¤§à¤¿à¤¨à¤¿à¤¯à¤®, 1988 à¤•à¥‡ à¤¤à¤¹à¤¤ à¤¸à¤¡à¤¼à¤• à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤®à¤‚à¤¤à¥à¤°à¤¾à¤²à¤¯ à¤•à¥‡ à¤¸à¤¾à¤°à¤¥à¥€ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤¸à¥‡ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤®à¥‡à¤‚ à¤²à¤°à¥à¤¨à¤° à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸, à¤¡à¥à¤°à¤¾à¤‡à¤µà¤¿à¤‚à¤— à¤Ÿà¥‡à¤¸à¥à¤Ÿ à¤•à¥‡ à¤¬à¤¾à¤¦ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸, à¤¨à¤µà¥€à¤¨à¥€à¤•à¤°à¤£, à¤¡à¥à¤ªà¥à¤²à¤¿à¤•à¥‡à¤Ÿ à¤”à¤° à¤µà¤¾à¤¹à¤¨ à¤¶à¥à¤°à¥‡à¤£à¥€ à¤œà¥‹à¤¡à¤¼à¤¨à¤¾ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¥¤',
   'à¤—à¤¿à¤¯à¤°à¤²à¥‡à¤¸ à¤¦à¥‹à¤ªà¤¹à¤¿à¤¯à¤¾ à¤¹à¥‡à¤¤à¥ 16+, à¤•à¤¾à¤° à¤µ à¤—à¤¿à¤¯à¤° à¤µà¤¾à¤¹à¤¨à¥‹à¤‚ à¤¹à¥‡à¤¤à¥ 18+ à¤”à¤° à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤µà¤¾à¤¹à¤¨à¥‹à¤‚ à¤¹à¥‡à¤¤à¥ 20+ à¤†à¤¯à¥ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸ à¤Ÿà¥‡à¤¸à¥à¤Ÿ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤•à¤® à¤¸à¥‡ à¤•à¤® 30 à¤¦à¤¿à¤¨ à¤ªà¥à¤°à¤¾à¤¨à¤¾ à¤²à¤°à¥à¤¨à¤° à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸ à¤šà¤¾à¤¹à¤¿à¤à¥¤',
   'à¤¸à¤¾à¤°à¤¥à¥€ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚, à¤«à¥‹à¤Ÿà¥‹, à¤¹à¤¸à¥à¤¤à¤¾à¤•à¥à¤·à¤° à¤µ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚, à¤†à¤°à¤Ÿà¥€à¤“ à¤®à¥‡à¤‚ à¤¸à¥à¤²à¥‰à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚, à¤²à¤°à¥à¤¨à¤° à¤Ÿà¥‡à¤¸à¥à¤Ÿ à¤”à¤° à¤«à¤¿à¤° à¤¡à¥à¤°à¤¾à¤‡à¤µà¤¿à¤‚à¤— à¤Ÿà¥‡à¤¸à¥à¤Ÿ à¤ªà¤¾à¤¸ à¤•à¤°à¥‡à¤‚à¥¤ à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤à¤¿ à¤•à¥‡ à¤¬à¤¾à¤¦ à¤²à¤¾à¤‡à¤¸à¥‡à¤‚à¤¸ à¤­à¥‡à¤œà¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤'),
  (svc_id, as_id, 'à¦¡à§à§°à¦¾à¦‡à¦­à¦¿à¦‚ à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š à¦¸à§‡à§±à¦¾',
   'à¦²à¦¾à§°à§à¦¨à¦¾à§° à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š, à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š, à¦¨à¦¬à§€à¦•à§°à¦£ à¦¬à¦¾ à¦¡à§à¦ªà§à¦²à¦¿à¦•à§‡à¦Ÿà§° à¦¬à¦¾à¦¬à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•à¥¤',
   'à¦¡à§à§°à¦¾à¦‡à¦­à¦¿à¦‚ à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š à¦®à¦Ÿà§° à¦¯à¦¾à¦¨ à¦†à¦‡à¦¨, à§§à§¯à§®à§®à§° à¦…à¦§à§€à¦¨à¦¤ à¦ªà¦¥ à¦ªà§°à¦¿à¦¬à¦¹à¦£ à¦®à¦¨à§à¦¤à§à§°à¦¾à¦²à¦¯à¦¼à§° à¦¸à¦¾à§°à¦¥à¦¿ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à§° à¦œà§°à¦¿à¦¯à¦¼à¦¤à§‡ à¦¦à¦¿à¦¯à¦¼à¦¾ à¦¹à¦¯à¦¼à¥¤ à¦²à¦¾à§°à§à¦¨à¦¾à§° à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š, à¦¡à§à§°à¦¾à¦‡à¦­à¦¿à¦‚ à¦ªà§°à§€à¦•à§à¦·à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š, à¦¨à¦¬à§€à¦•à§°à¦£, à¦¡à§à¦ªà§à¦²à¦¿à¦•à§‡à¦Ÿ à¦†à§°à§ à¦¬à¦¾à¦¹à¦¨ à¦¶à§à§°à§‡à¦£à§€ à¦¯à§‹à¦— à¦•à§°à¦¾ à¦‡à¦¯à¦¼à¦¾à§° à¦…à¦¨à§à¦¤à§°à§à¦—à¦¤à¥¤',
   'à¦—à¦¿à¦¯à¦¼à¦¾à§°à¦¬à¦¿à¦¹à§€à¦¨ à¦¦à§à¦šà¦•à§€à¦¯à¦¼à¦¾à§° à¦¬à¦¾à¦¬à§‡ à§§à§¬+, à¦—à¦¾à¦¡à¦¼à§€ à¦“ à¦—à¦¿à¦¯à¦¼à¦¾à§°à¦¯à§à¦•à§à¦¤ à¦¬à¦¾à¦¹à¦¨à§° à¦¬à¦¾à¦¬à§‡ à§§à§®+ à¦†à§°à§ à¦ªà§°à¦¿à¦¬à¦¹à¦£ à¦¬à¦¾à¦¹à¦¨à§° à¦¬à¦¾à¦¬à§‡ à§¨à§¦+ à¦¬à¦¯à¦¼à¦¸ à¦²à¦¾à¦—à¦¿à¦¬à¥¤ à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š à¦ªà§°à§€à¦•à§à¦·à¦¾à§° à¦†à¦—à¦¤à§‡ à¦•à¦®à§‡à¦“ à§©à§¦ à¦¦à¦¿à¦¨ à¦ªà§à§°à¦£à¦¿ à¦²à¦¾à§°à§à¦¨à¦¾à§° à¦²à¦¾à¦‡à¦šà§‡à¦žà§à¦š à¦²à¦¾à¦—à¦¿à¦¬à¥¤',
   'à¦¸à¦¾à§°à¦¥à¦¿ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•, à¦«à¦Ÿà§‹, à¦šà¦¹à§€ à¦“ à¦ªà§à§°à¦®à¦¾à¦£ à¦†à¦ªà¦²à§‹à¦¡ à¦•à§°à¦•, à¦†à§°à¦Ÿà¦¿à¦…â€™à¦¤ à¦¸à§à¦²à¦Ÿ à¦¬à§à¦• à¦•à§°à¦•, à¦²à¦¾à§°à§à¦¨à¦¾à§° à¦ªà§°à§€à¦•à§à¦·à¦¾ à¦†à§°à§ à¦¤à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦¡à§à§°à¦¾à¦‡à¦­à¦¿à¦‚ à¦ªà§°à§€à¦•à§à¦·à¦¾à¦¤ à¦‰à¦¤à§à¦¤à§€à§°à§à¦£ à¦¹à¦“à¦•à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Proof of date of birth', 'Passport-size photograph')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://sarathi.parivahan.gov.in', 'Sarathi â€” Driving Licence Services', 'official_government_page',
    'Ministry of Road Transport and Highways', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://sarathi.parivahan.gov.in');
end;
$$;

-- â”€â”€ 6. Birth Certificate (RGI / Civil Registration) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Certificates';
  select id into dept_id from public.departments where state_id = st_id and name = 'Office of the Registrar General and Census Commissioner, India';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'birth-certificate', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'birth-certificate';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Birth Certificate',
   'Register a birth and obtain the official birth certificate.',
   'A birth certificate is issued under the Registration of Births and Deaths Act, 1969 by the local Registrar (municipality, panchayat or hospital). It records the name, date and place of birth and parentage, and is required for Aadhaar, passport, school admission and many other services.',
   'Every birth in India must be registered within 21 days, free of charge. Parents, the head of the household, or the hospital where the birth occurred can report the birth. Delayed registration needs additional affidavits and fees.',
   'Report the birth at the hospital or the local Registrar office (municipal body or gaon panchayat) with parent identity proofs. Apply online on the Civil Registration System portal or your state service portal, then collect the printed certificate.'),
  (svc_id, hi_id, 'à¤œà¤¨à¥à¤® à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤°',
   'à¤œà¤¨à¥à¤® à¤•à¤¾ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤†à¤§à¤¿à¤•à¤¾à¤°à¤¿à¤• à¤œà¤¨à¥à¤® à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚à¥¤',
   'à¤œà¤¨à¥à¤® à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤œà¤¨à¥à¤®-à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤…à¤§à¤¿à¤¨à¤¿à¤¯à¤®, 1969 à¤•à¥‡ à¤¤à¤¹à¤¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¤œà¤¿à¤¸à¥à¤Ÿà¥à¤°à¤¾à¤° (à¤¨à¤—à¤°à¤ªà¤¾à¤²à¤¿à¤•à¤¾, à¤ªà¤‚à¤šà¤¾à¤¯à¤¤ à¤¯à¤¾ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤²) à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤®à¥‡à¤‚ à¤¨à¤¾à¤®, à¤œà¤¨à¥à¤® à¤¤à¤¿à¤¥à¤¿, à¤¸à¥à¤¥à¤¾à¤¨ à¤”à¤° à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾ à¤•à¤¾ à¤µà¤¿à¤µà¤°à¤£ à¤¦à¤°à¥à¤œ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤†à¤§à¤¾à¤°, à¤ªà¤¾à¤¸à¤ªà¥‹à¤°à¥à¤Ÿ, à¤¸à¥à¤•à¥‚à¤² à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤¸à¤¹à¤¿à¤¤ à¤•à¤ˆ à¤¸à¥‡à¤µà¤¾à¤“à¤‚ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤­à¤¾à¤°à¤¤ à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤œà¤¨à¥à¤® à¤•à¤¾ 21 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤¨à¤¿à¤ƒà¤¶à¥à¤²à¥à¤• à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤¹à¥ˆà¥¤ à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾, à¤ªà¤°à¤¿à¤µà¤¾à¤° à¤•à¤¾ à¤®à¥à¤–à¤¿à¤¯à¤¾ à¤¯à¤¾ à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤œà¤¨à¥à¤® à¤•à¥€ à¤¸à¥‚à¤šà¤¨à¤¾ à¤¦à¥‡ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤µà¤¿à¤²à¤‚à¤¬à¤¿à¤¤ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤¹à¥‡à¤¤à¥ à¤…à¤¤à¤¿à¤°à¤¿à¤•à¥à¤¤ à¤¶à¤ªà¤¥à¤ªà¤¤à¥à¤° à¤µ à¤¶à¥à¤²à¥à¤• à¤²à¤—à¤¤à¤¾ à¤¹à¥ˆà¥¤',
   'à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤¯à¤¾ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¤œà¤¿à¤¸à¥à¤Ÿà¥à¤°à¤¾à¤° à¤•à¤¾à¤°à¥à¤¯à¤¾à¤²à¤¯ (à¤¨à¤—à¤° à¤¨à¤¿à¤•à¤¾à¤¯ à¤¯à¤¾ à¤—à¥à¤°à¤¾à¤® à¤ªà¤‚à¤šà¤¾à¤¯à¤¤) à¤®à¥‡à¤‚ à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾ à¤•à¥‡ à¤ªà¤¹à¤šà¤¾à¤¨ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤¸à¤¹à¤¿à¤¤ à¤¸à¥‚à¤šà¤¨à¤¾ à¤¦à¥‡à¤‚à¥¤ à¤¸à¤¿à¤µà¤¿à¤² à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤¯à¤¾ à¤°à¤¾à¤œà¥à¤¯ à¤¸à¥‡à¤µà¤¾ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤®à¥à¤¦à¥à¤°à¤¿à¤¤ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚à¥¤'),
  (svc_id, as_id, 'à¦œà¦¨à§à¦® à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§°',
   'à¦œà¦¨à§à¦® à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦• à¦†à§°à§ à¦šà§°à¦•à¦¾à§°à§€ à¦œà¦¨à§à¦® à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦²à¦¾à¦­ à¦•à§°à¦•à¥¤',
   'à¦œà¦¨à§à¦® à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦œà¦¨à§à¦®-à¦®à§ƒà¦¤à§à¦¯à§ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦†à¦‡à¦¨, à§§à§¯à§¬à§¯à§° à¦…à¦§à§€à¦¨à¦¤ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦•à§‡ (à¦ªà§Œà§°à¦¸à¦­à¦¾, à¦ªà¦žà§à¦šà¦¾à¦¯à¦¼à¦¤ à¦¬à¦¾ à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾à¦²à¦¯à¦¼) à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦¨à¦¾à¦®, à¦œà¦¨à§à¦® à¦¤à¦¾à§°à¦¿à¦–, à¦¸à§à¦¥à¦¾à¦¨ à¦†à§°à§ à¦ªà¦¿à¦¤à§ƒ-à¦®à¦¾à¦¤à§ƒà§° à¦¬à¦¿à§±à§°à¦£ à¦¥à¦¾à¦•à§‡à¥¤ à¦†à¦§à¦¾à§°, à¦ªà¦¾à¦›à¦ªâ€™à§°à§à¦Ÿ, à¦¬à¦¿à¦¦à§à¦¯à¦¾à¦²à¦¯à¦¼à¦¤ à¦¨à¦¾à¦®à¦­à§°à§à¦¤à¦¿à¦¸à¦¹ à¦¬à¦¹à§ à¦¸à§‡à§±à¦¾à§° à¦¬à¦¾à¦¬à§‡ à¦²à¦¾à¦—à§‡à¥¤',
   'à¦­à¦¾à§°à¦¤à¦¤ à¦ªà§à§°à¦¤à¦¿à¦Ÿà§‹ à¦œà¦¨à§à¦® à§¨à§§ à¦¦à¦¿à¦¨à§° à¦­à¦¿à¦¤à§°à¦¤ à¦¬à¦¿à¦¨à¦¾à¦®à§‚à¦²à§€à¦¯à¦¼à¦¾à¦•à§ˆ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦¾à¦Ÿà§‹ à¦¬à¦¾à¦§à§à¦¯à¦¤à¦¾à¦®à§‚à¦²à¦•à¥¤ à¦ªà¦¿à¦¤à§ƒ-à¦®à¦¾à¦¤à§ƒ, à¦ªà§°à¦¿à¦¯à¦¼à¦¾à¦²à§° à¦®à§à§°à¦¬à§à¦¬à§€ à¦¬à¦¾ à¦¸à¦‚à¦¶à§à¦²à¦¿à¦·à§à¦Ÿ à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾à¦²à¦¯à¦¼à§‡ à¦œà¦¨à§à¦®à§° à¦–à¦¬à§° à¦¦à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦ªà¦²à¦®à¦•à§ˆ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨à§° à¦¬à¦¾à¦¬à§‡ à¦…à¦¤à¦¿à§°à¦¿à¦•à§à¦¤ à¦¶à¦ªà¦¤à¦¨à¦¾à¦®à¦¾ à¦“ à¦®à¦¾à¦šà§à¦² à¦²à¦¾à¦—à§‡à¥¤',
   'à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾à¦²à¦¯à¦¼ à¦¬à¦¾ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦• à¦•à¦¾à§°à§à¦¯à¦¾à¦²à¦¯à¦¼à¦¤ à¦ªà¦¿à¦¤à§ƒ-à¦®à¦¾à¦¤à§ƒà§° à¦ªà§°à¦¿à¦šà¦¯à¦¼ à¦ªà§à§°à¦®à¦¾à¦£à¦¸à¦¹ à¦–à¦¬à§° à¦¦à¦¿à¦¯à¦¼à¦•à¥¤ à¦¨à¦¾à¦—à§°à¦¿à¦• à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦ªà§‹à§°à§à¦Ÿà§‡à¦² à¦¬à¦¾ à§°à¦¾à¦œà§à¦¯ à¦¸à§‡à§±à¦¾ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦…à¦¨à¦²à¦¾à¦‡à¦¨ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿ à¦®à§à¦¦à§à§°à¦¿à¦¤ à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦¸à¦‚à¦—à§à§°à¦¹ à¦•à§°à¦•à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Hospital birth report', 'Discharge summary or birth report issued by the hospital.'),
    ('Parent identity proof', 'Aadhaar, voter ID or other photo ID of either parent.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Hospital birth report', 'Parent identity proof', 'Proof of address')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://crsorgi.gov.in', 'Civil Registration System â€” Registrar General of India', 'official_government_page',
    'Office of the Registrar General and Census Commissioner, India', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://crsorgi.gov.in');
end;
$$;

-- â”€â”€ 7. Income Certificate (Revenue Dept, Assam) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Certificates';
  select id into dept_id from public.departments where state_id = st_id and name = 'Revenue and Disaster Management Department, Assam';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'income-certificate', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'income-certificate';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Income Certificate',
   'Get official proof of family income for scholarships, schemes and admissions.',
   'An income certificate is issued by the Circle Officer (Tahsildar) through the Revenue Department. It certifies the annual family income from all sources and is required for scholarships, fee concessions, economically-weaker-section benefits, and welfare schemes. In Assam it is issued through the Sewa Setu portal with Circle-level verification.',
   'Permanent residents of Assam can apply. The applicant must declare income from salary, agriculture, business, rent and other sources. Students applying for scholarships need a bonafide certificate from their institution.',
   'Apply on the Sewa Setu portal with identity, address and income proofs plus an affidavit. The Gaon Pradhan or Ward Member verifies the claim, then the Circle Officer approves and the certificate is available for download.'),
  (svc_id, hi_id, 'à¤†à¤¯ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤°',
   'à¤›à¤¾à¤¤à¥à¤°à¤µà¥ƒà¤¤à¥à¤¤à¤¿, à¤¯à¥‹à¤œà¤¨à¤¾à¤“à¤‚ à¤”à¤° à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤¹à¥‡à¤¤à¥ à¤ªà¤¾à¤°à¤¿à¤µà¤¾à¤°à¤¿à¤• à¤†à¤¯ à¤•à¤¾ à¤†à¤§à¤¿à¤•à¤¾à¤°à¤¿à¤• à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¾à¤à¤à¥¤',
   'à¤†à¤¯ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤°à¤¾à¤œà¤¸à¥à¤µ à¤µà¤¿à¤­à¤¾à¤— à¤•à¥‡ à¤®à¤¾à¤§à¥à¤¯à¤® à¤¸à¥‡ à¤¸à¤°à¥à¤•à¤¿à¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ (à¤¤à¤¹à¤¸à¥€à¤²à¤¦à¤¾à¤°) à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤¯à¤¹ à¤¸à¤­à¥€ à¤¸à¥à¤°à¥‹à¤¤à¥‹à¤‚ à¤¸à¥‡ à¤µà¤¾à¤°à¥à¤·à¤¿à¤• à¤ªà¤¾à¤°à¤¿à¤µà¤¾à¤°à¤¿à¤• à¤†à¤¯ à¤ªà¥à¤°à¤®à¤¾à¤£à¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ à¤”à¤° à¤›à¤¾à¤¤à¥à¤°à¤µà¥ƒà¤¤à¥à¤¤à¤¿, à¤¶à¥à¤²à¥à¤• à¤°à¤¿à¤¯à¤¾à¤¯à¤¤ à¤¤à¤¥à¤¾ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤¯à¥‹à¤œà¤¨à¤¾à¤“à¤‚ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤ à¤…à¤¸à¤® à¤®à¥‡à¤‚ à¤¯à¤¹ à¤¸à¥‡à¤µà¤¾ à¤¸à¥‡à¤¤à¥ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤¸à¥‡ à¤¸à¤°à¥à¤•à¤¿à¤² à¤¸à¥à¤¤à¤°à¥€à¤¯ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤',
   'à¤…à¤¸à¤® à¤•à¥‡ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤¨à¤¿à¤µà¤¾à¤¸à¥€ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤µà¥‡à¤¤à¤¨, à¤•à¥ƒà¤·à¤¿, à¤µà¥à¤¯à¤µà¤¸à¤¾à¤¯, à¤•à¤¿à¤°à¤¾à¤¯à¤¾ à¤µ à¤…à¤¨à¥à¤¯ à¤¸à¥à¤°à¥‹à¤¤à¥‹à¤‚ à¤•à¥€ à¤†à¤¯ à¤˜à¥‹à¤·à¤¿à¤¤ à¤•à¤°à¤¨à¥€ à¤¹à¥‹à¤¤à¥€ à¤¹à¥ˆà¥¤ à¤›à¤¾à¤¤à¥à¤°à¤µà¥ƒà¤¤à¥à¤¤à¤¿ à¤¹à¥‡à¤¤à¥ à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤¨ à¤•à¤¾ à¤¬à¥‹à¤¨à¤¾à¤«à¤¾à¤‡à¤¡ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤¸à¥‡à¤µà¤¾ à¤¸à¥‡à¤¤à¥ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤ªà¤¹à¤šà¤¾à¤¨, à¤ªà¤¤à¤¾, à¤†à¤¯ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤µ à¤¶à¤ªà¤¥à¤ªà¤¤à¥à¤° à¤¸à¤¹à¤¿à¤¤ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚à¥¤ à¤—à¤¾à¤à¤µ à¤ªà¥à¤°à¤§à¤¾à¤¨ à¤¯à¤¾ à¤µà¤¾à¤°à¥à¤¡ à¤¸à¤¦à¤¸à¥à¤¯ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚, à¤«à¤¿à¤° à¤¸à¤°à¥à¤•à¤¿à¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤à¤¿ à¤¦à¥‡à¤¤à¥‡ à¤¹à¥ˆà¤‚ à¤”à¤° à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤¹à¥‡à¤¤à¥ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤'),
  (svc_id, as_id, 'à¦†à¦¯à¦¼à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§°',
   'à¦œà¦²à¦ªà¦¾à¦¨à¦¿, à¦†à¦à¦šà¦¨à¦¿ à¦†à§°à§ à¦¨à¦¾à¦®à¦­à§°à§à¦¤à¦¿à§° à¦¬à¦¾à¦¬à§‡ à¦ªà¦¾à§°à¦¿à¦¬à¦¾à§°à¦¿à¦• à¦†à¦¯à¦¼à§° à¦šà§°à¦•à¦¾à§°à§€ à¦ªà§à§°à¦®à¦¾à¦£ à¦²à¦¾à¦­ à¦•à§°à¦•à¥¤',
   'à¦†à¦¯à¦¼à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à§°à¦¾à¦œà¦¹ à¦¬à¦¿à¦­à¦¾à¦—à§° à¦œà§°à¦¿à¦¯à¦¼à¦¤à§‡ à¦šà¦•à§à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾ (à¦¤à¦¹à¦šà¦¿à¦²à¦¦à¦¾à§°)à¦¯à¦¼à§‡ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦¸à¦•à¦²à§‹ à¦‰à§Žà¦¸à§°à¦ªà§°à¦¾ à¦¬à¦¾à§°à§à¦·à¦¿à¦• à¦ªà¦¾à§°à¦¿à¦¬à¦¾à§°à¦¿à¦• à¦†à¦¯à¦¼ à¦ªà§à§°à¦®à¦¾à¦£à¦¿à¦¤ à¦•à§°à§‡ à¦†à§°à§ à¦œà¦²à¦ªà¦¾à¦¨à¦¿, à¦®à¦¾à¦šà§à¦² à§°à§‡à¦¹à¦¾à¦‡ à¦¤à¦¥à¦¾ à¦•à¦²à§à¦¯à¦¾à¦£ à¦†à¦à¦šà¦¨à¦¿à§° à¦¬à¦¾à¦¬à§‡ à¦²à¦¾à¦—à§‡à¥¤ à¦…à¦¸à¦®à¦¤ à¦¸à§‡à§±à¦¾ à¦¸à§‡à¦¤à§ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à§°à§‡ à¦šà¦•à§à§° à¦ªà§°à§à¦¯à¦¾à¦¯à¦¼à§° à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨à§‡à§°à§‡ à¦¦à¦¿à¦¯à¦¼à¦¾ à¦¹à¦¯à¦¼à¥¤',
   'à¦…à¦¸à¦®à§° à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦¬à¦¾à¦¸à¦¿à¦¨à§à¦¦à¦¾à¦‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦¦à§°à¦®à¦¹à¦¾, à¦•à§ƒà¦·à¦¿, à¦¬à§à¦¯à§±à¦¸à¦¾à¦¯à¦¼, à¦­à¦¾à¦¡à¦¼à¦¾ à¦“ à¦…à¦¨à§à¦¯ à¦‰à§Žà¦¸à§° à¦†à¦¯à¦¼ à¦˜à§‹à¦·à¦£à¦¾ à¦•à§°à¦¿à¦¬ à¦²à¦¾à¦—à¦¿à¦¬à¥¤ à¦œà¦²à¦ªà¦¾à¦¨à¦¿à§° à¦¬à¦¾à¦¬à§‡ à¦ªà§à§°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§° à¦¬à¦¨à¦¾à¦«à¦¾à¦‡à¦¡ à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦²à¦¾à¦—à¦¿à¦¬à¥¤',
   'à¦¸à§‡à§±à¦¾ à¦¸à§‡à¦¤à§ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦ªà§°à¦¿à¦šà¦¯à¦¼, à¦ à¦¿à¦•à¦¨à¦¾, à¦†à¦¯à¦¼à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦“ à¦¶à¦ªà¦¤à¦¨à¦¾à¦®à¦¾à¦¸à¦¹ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•à¥¤ à¦—à¦¾à¦à¦“ à¦ªà§à§°à¦§à¦¾à¦¨ à¦¬à¦¾ à§±à¦¾à§°à§à¦¡ à¦¸à¦¦à¦¸à§à¦¯à¦‡ à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨ à¦•à§°à§‡, à¦¤à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦šà¦•à§à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾à¦‡ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¦à¦¿à¦¯à¦¼à§‡ à¦†à§°à§ à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦¡à¦¾à¦‰à¦¨à¦²à§‹à¦¡à§° à¦¬à¦¾à¦¬à§‡ à¦‰à¦ªà¦²à¦¬à§à¦§ à¦¹à¦¯à¦¼à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Income proof', 'Salary slip, land records, or income affidavit as applicable.'),
    ('Affidavit of income', 'Self-declared affidavit stating family income from all sources.'),
    ('Bonafide certificate (for students)', 'Certificate from school or college confirming enrolment.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Income proof', 'Affidavit of income', 'Aadhaar card (e-KYC)')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://sewasetu.assam.gov.in', 'Sewa Setu â€” Government of Assam', 'official_government_page',
    'Revenue and Disaster Management Department, Assam', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://sewasetu.assam.gov.in');
end;
$$;

-- â”€â”€ 8. Caste Certificate (Revenue Dept, Assam) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Certificates';
  select id into dept_id from public.departments where state_id = st_id and name = 'Revenue and Disaster Management Department, Assam';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'caste-certificate', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'caste-certificate';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Caste Certificate',
   'Get official proof of SC, ST or OBC status for reservations and benefits.',
   'A caste certificate is issued by the Circle Officer after verification of caste and residence records. It certifies that the holder belongs to a Scheduled Caste, Scheduled Tribe or Other Backward Class notified for Assam, and is required for reservation in education, jobs, scholarships and welfare schemes.',
   'Applicants belonging to a notified SC, ST or OBC community who are permanent residents of Assam can apply. The caste claim must be supported by legacy records such as a parent certificate, land records or the 1951 NRC-era village list entry.',
   'Apply on the Sewa Setu portal with identity, address and caste-linkage proofs plus an affidavit. The Gaon Pradhan verifies, the Circle Officer approves after record checks, and the certificate is available for download.'),
  (svc_id, hi_id, 'à¤œà¤¾à¤¤à¤¿ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤°',
   'à¤†à¤°à¤•à¥à¤·à¤£ à¤µ à¤²à¤¾à¤­à¥‹à¤‚ à¤¹à¥‡à¤¤à¥ à¤…à¤œà¤¾, à¤…à¤œà¤œà¤¾ à¤¯à¤¾ à¤…à¤ªà¤¿à¤µ à¤µà¤°à¥à¤— à¤•à¤¾ à¤†à¤§à¤¿à¤•à¤¾à¤°à¤¿à¤• à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¾à¤à¤à¥¤',
   'à¤œà¤¾à¤¤à¤¿ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤¸à¤°à¥à¤•à¤¿à¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤¤à¤¿ à¤µ à¤¨à¤¿à¤µà¤¾à¤¸ à¤…à¤­à¤¿à¤²à¥‡à¤–à¥‹à¤‚ à¤•à¥‡ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¥‡ à¤¬à¤¾à¤¦ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤¯à¤¹ à¤ªà¥à¤°à¤®à¤¾à¤£à¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ à¤•à¤¿ à¤§à¤¾à¤°à¤• à¤…à¤¸à¤® à¤¹à¥‡à¤¤à¥ à¤…à¤§à¤¿à¤¸à¥‚à¤šà¤¿à¤¤ à¤…à¤¨à¥à¤¸à¥‚à¤šà¤¿à¤¤ à¤œà¤¾à¤¤à¤¿, à¤œà¤¨à¤œà¤¾à¤¤à¤¿ à¤¯à¤¾ à¤…à¤¨à¥à¤¯ à¤ªà¤¿à¤›à¤¡à¤¼à¤¾ à¤µà¤°à¥à¤— à¤¸à¥‡ à¤¹à¥ˆà¥¤ à¤¶à¤¿à¤•à¥à¤·à¤¾, à¤¨à¥Œà¤•à¤°à¥€, à¤›à¤¾à¤¤à¥à¤°à¤µà¥ƒà¤¤à¥à¤¤à¤¿ à¤®à¥‡à¤‚ à¤†à¤°à¤•à¥à¤·à¤£ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤…à¤¸à¤® à¤•à¥‡ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤¨à¤¿à¤µà¤¾à¤¸à¥€ à¤œà¥‹ à¤…à¤§à¤¿à¤¸à¥‚à¤šà¤¿à¤¤ à¤…à¤œà¤¾, à¤…à¤œà¤œà¤¾ à¤¯à¤¾ à¤…à¤ªà¤¿à¤µ à¤¸à¤®à¥à¤¦à¤¾à¤¯ à¤¸à¥‡ à¤¹à¥ˆà¤‚, à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¦à¤¾à¤µà¥‡ à¤¹à¥‡à¤¤à¥ à¤®à¤¾à¤¤à¤¾-à¤ªà¤¿à¤¤à¤¾ à¤•à¤¾ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤°, à¤­à¥‚à¤®à¤¿ à¤…à¤­à¤¿à¤²à¥‡à¤– à¤œà¥ˆà¤¸à¥‡ à¤µà¤¿à¤°à¤¾à¤¸à¤¤ à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¤‚à¥¤',
   'à¤¸à¥‡à¤µà¤¾ à¤¸à¥‡à¤¤à¥ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤ªà¤¹à¤šà¤¾à¤¨, à¤ªà¤¤à¤¾, à¤œà¤¾à¤¤à¤¿-à¤¸à¤‚à¤¬à¤‚à¤§ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤µ à¤¶à¤ªà¤¥à¤ªà¤¤à¥à¤° à¤¸à¤¹à¤¿à¤¤ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚à¥¤ à¤—à¤¾à¤à¤µ à¤ªà¥à¤°à¤§à¤¾à¤¨ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚, à¤¸à¤°à¥à¤•à¤¿à¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤…à¤­à¤¿à¤²à¥‡à¤– à¤œà¤¾à¤à¤š à¤•à¥‡ à¤¬à¤¾à¤¦ à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤à¤¿ à¤¦à¥‡à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤'),
  (svc_id, as_id, 'à¦œà¦¾à¦¤à¦¿à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§°',
   'à¦¸à¦‚à§°à¦•à§à¦·à¦£ à¦“ à¦¸à§à¦¬à¦¿à¦§à¦¾à§° à¦¬à¦¾à¦¬à§‡ à¦…à¦¨à§à¦¸à§‚à¦šà¦¿à¦¤ à¦œà¦¾à¦¤à¦¿, à¦œà¦¨à¦œà¦¾à¦¤à¦¿ à¦¬à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¨à§à¦¯ à¦ªà¦¿à¦›à¦ªà§°à¦¾ à¦¶à§à§°à§‡à¦£à§€à§° à¦šà§°à¦•à¦¾à§°à§€ à¦ªà§à§°à¦®à¦¾à¦£ à¦²à¦¾à¦­ à¦•à§°à¦•à¥¤',
   'à¦œà¦¾à¦¤à¦¿à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦šà¦•à§à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾à¦‡ à¦œà¦¾à¦¤à¦¿ à¦“ à¦¬à¦¾à¦¸à¦¸à§à¦¥à¦¾à¦¨à§° à¦…à¦­à¦¿à¦²à§‡à¦– à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨ à¦•à§°à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦…à¦¸à¦®à§° à¦¬à¦¾à¦¬à§‡ à¦…à¦§à¦¿à¦¸à§‚à¦šà¦¿à¦¤ à¦…à¦¨à§à¦¸à§‚à¦šà¦¿à¦¤ à¦œà¦¾à¦¤à¦¿, à¦œà¦¨à¦œà¦¾à¦¤à¦¿ à¦¬à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¨à§à¦¯ à¦ªà¦¿à¦›à¦ªà§°à¦¾ à¦¶à§à§°à§‡à¦£à§€à§° à¦¬à§à¦²à¦¿ à¦ªà§à§°à¦®à¦¾à¦£à¦¿à¦¤ à¦•à§°à§‡à¥¤ à¦¶à¦¿à¦•à§à¦·à¦¾, à¦šà¦¾à¦•à§°à¦¿, à¦œà¦²à¦ªà¦¾à¦¨à¦¿à¦¤ à¦¸à¦‚à§°à¦•à§à¦·à¦£à§° à¦¬à¦¾à¦¬à§‡ à¦²à¦¾à¦—à§‡à¥¤',
   'à¦…à¦¸à¦®à§° à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦¬à¦¾à¦¸à¦¿à¦¨à§à¦¦à¦¾ à¦¯à¦¿à¦¸à¦•à¦² à¦…à¦§à¦¿à¦¸à§‚à¦šà¦¿à¦¤ à¦¸à¦®à§à¦ªà§à§°à¦¦à¦¾à¦¯à¦¼à§°, à¦¤à§‡à¦“à¦à¦²à§‹à¦•à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦ªà¦¿à¦¤à§ƒ-à¦®à¦¾à¦¤à§ƒà§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§°, à¦®à¦¾à¦Ÿà¦¿à§° à¦…à¦­à¦¿à¦²à§‡à¦–à§° à¦¦à§°à§‡ à¦‰à¦¤à§à¦¤à§°à¦¾à¦§à¦¿à¦•à¦¾à§°à§€ à¦¨à¦¥à¦¿ à¦²à¦¾à¦—à¦¿à¦¬à¥¤',
   'à¦¸à§‡à§±à¦¾ à¦¸à§‡à¦¤à§ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦ªà§°à¦¿à¦šà¦¯à¦¼, à¦ à¦¿à¦•à¦¨à¦¾, à¦œà¦¾à¦¤à¦¿-à¦¸à¦®à§à¦ªà§°à§à¦•à§€à¦¯à¦¼ à¦ªà§à§°à¦®à¦¾à¦£ à¦“ à¦¶à¦ªà¦¤à¦¨à¦¾à¦®à¦¾à¦¸à¦¹ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•à¥¤ à¦—à¦¾à¦à¦“ à¦ªà§à§°à¦§à¦¾à¦¨à§‡ à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨ à¦•à§°à§‡, à¦šà¦•à§à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾à¦‡ à¦…à¦­à¦¿à¦²à§‡à¦– à¦ªà§°à§€à¦•à§à¦·à¦¾à§° à¦ªà¦¾à¦›à¦¤ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Caste linkage proof', 'Parent caste certificate, land records or legacy village-list entry.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Caste linkage proof', 'Affidavit of income', 'Aadhaar card (e-KYC)')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://sewasetu.assam.gov.in', 'Sewa Setu â€” Government of Assam', 'official_government_page',
    'Revenue and Disaster Management Department, Assam', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://sewasetu.assam.gov.in');
end;
$$;

-- â”€â”€ 9. Domicile / Permanent Resident Certificate (Revenue Dept, Assam) â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Certificates';
  select id into dept_id from public.departments where state_id = st_id and name = 'Revenue and Disaster Management Department, Assam';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'domicile-certificate', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'domicile-certificate';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Domicile Certificate (PRC)',
   'Get proof of permanent residence in Assam for jobs, admissions and quotas.',
   'A domicile or Permanent Resident Certificate (PRC) is issued by the Circle Officer certifying long-term residence in Assam. It is required for state-quota seats in medical and engineering admissions, state government jobs, and domicile-linked scholarships.',
   'Persons residing in Assam for the qualifying period (generally 10+ years, or born in the state) can apply. Supporting residence evidence such as voter lists, land records or school certificates is required.',
   'Apply on the Sewa Setu portal with identity, address and residence proofs plus an affidavit. Local verification is followed by Circle Officer approval, after which the certificate is available for download.'),
  (svc_id, hi_id, 'à¤…à¤§à¤¿à¤µà¤¾à¤¸ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° (à¤ªà¥€à¤†à¤°à¤¸à¥€)',
   'à¤¨à¥Œà¤•à¤°à¥€, à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤µ à¤•à¥‹à¤Ÿà¤¾ à¤¹à¥‡à¤¤à¥ à¤…à¤¸à¤® à¤®à¥‡à¤‚ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤¨à¤¿à¤µà¤¾à¤¸ à¤•à¤¾ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¾à¤à¤à¥¤',
   'à¤…à¤§à¤¿à¤µà¤¾à¤¸ à¤¯à¤¾ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤¨à¤¿à¤µà¤¾à¤¸à¥€ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° (à¤ªà¥€à¤†à¤°à¤¸à¥€) à¤¸à¤°à¥à¤•à¤¿à¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤…à¤¸à¤® à¤®à¥‡à¤‚ à¤¦à¥€à¤°à¥à¤˜à¤•à¤¾à¤²à¤¿à¤• à¤¨à¤¿à¤µà¤¾à¤¸ à¤ªà¥à¤°à¤®à¤¾à¤£à¤¿à¤¤ à¤•à¤°à¤¤à¥‡ à¤¹à¥à¤ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾ à¤µ à¤‡à¤‚à¤œà¥€à¤¨à¤¿à¤¯à¤°à¤¿à¤‚à¤— à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤®à¥‡à¤‚ à¤°à¤¾à¤œà¥à¤¯ à¤•à¥‹à¤Ÿà¤¾, à¤°à¤¾à¤œà¥à¤¯ à¤¸à¤°à¤•à¤¾à¤°à¥€ à¤¨à¥Œà¤•à¤°à¥€ à¤µ à¤›à¤¾à¤¤à¥à¤°à¤µà¥ƒà¤¤à¥à¤¤à¤¿ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤¨à¤¿à¤°à¥à¤§à¤¾à¤°à¤¿à¤¤ à¤…à¤µà¤§à¤¿ (à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯à¤¤à¤ƒ 10+ à¤µà¤°à¥à¤·, à¤¯à¤¾ à¤°à¤¾à¤œà¥à¤¯ à¤®à¥‡à¤‚ à¤œà¤¨à¥à¤®) à¤¸à¥‡ à¤…à¤¸à¤® à¤®à¥‡à¤‚ à¤°à¤¹ à¤°à¤¹à¥‡ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤®à¤¤à¤¦à¤¾à¤¤à¤¾ à¤¸à¥‚à¤šà¥€, à¤­à¥‚à¤®à¤¿ à¤…à¤­à¤¿à¤²à¥‡à¤– à¤¯à¤¾ à¤µà¤¿à¤¦à¥à¤¯à¤¾à¤²à¤¯ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤œà¥ˆà¤¸à¥‡ à¤¨à¤¿à¤µà¤¾à¤¸ à¤¸à¤¾à¤•à¥à¤·à¥à¤¯ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¤‚à¥¤',
   'à¤¸à¥‡à¤µà¤¾ à¤¸à¥‡à¤¤à¥ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤ªà¤¹à¤šà¤¾à¤¨, à¤ªà¤¤à¤¾, à¤¨à¤¿à¤µà¤¾à¤¸ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤µ à¤¶à¤ªà¤¥à¤ªà¤¤à¥à¤° à¤¸à¤¹à¤¿à¤¤ à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚à¥¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¨ à¤•à¥‡ à¤¬à¤¾à¤¦ à¤¸à¤°à¥à¤•à¤¿à¤² à¤…à¤§à¤¿à¤•à¤¾à¤°à¥€ à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤à¤¿ à¤¦à¥‡à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤'),
  (svc_id, as_id, 'à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦¬à¦¾à¦¸à¦¿à¦¨à§à¦¦à¦¾à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° (à¦ªà¦¿à¦†à§°à¦šà¦¿)',
   'à¦šà¦¾à¦•à§°à¦¿, à¦¨à¦¾à¦®à¦­à§°à§à¦¤à¦¿ à¦“ à¦•à§‹à¦Ÿà¦¾à§° à¦¬à¦¾à¦¬à§‡ à¦…à¦¸à¦®à¦¤ à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦¬à¦¾à¦¸à¦¸à§à¦¥à¦¾à¦¨à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦²à¦¾à¦­ à¦•à§°à¦•à¥¤',
   'à¦…à¦§à¦¿à¦¬à¦¾à¦¸ à¦¬à¦¾ à¦¸à§à¦¥à¦¾à¦¯à¦¼à§€ à¦¬à¦¾à¦¸à¦¿à¦¨à§à¦¦à¦¾à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° (à¦ªà¦¿à¦†à§°à¦šà¦¿) à¦šà¦•à§à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾à¦‡ à¦…à¦¸à¦®à¦¤ à¦¦à§€à§°à§à¦˜à¦•à¦¾à¦²à§€à¦¨ à¦¬à¦¾à¦¸à¦¸à§à¦¥à¦¾à¦¨ à¦ªà§à§°à¦®à¦¾à¦£à¦¿à¦¤ à¦•à§°à¦¿ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾ à¦“ à¦…à¦­à¦¿à¦¯à¦¾à¦¨à§à¦¤à§à§°à¦¿à¦• à¦¨à¦¾à¦®à¦­à§°à§à¦¤à¦¿à¦¤ à§°à¦¾à¦œà§à¦¯ à¦•à§‹à¦Ÿà¦¾, à§°à¦¾à¦œà§à¦¯ à¦šà§°à¦•à¦¾à§°à§€ à¦šà¦¾à¦•à§°à¦¿ à¦“ à¦œà¦²à¦ªà¦¾à¦¨à¦¿à§° à¦¬à¦¾à¦¬à§‡ à¦²à¦¾à¦—à§‡à¥¤',
   'à¦¨à¦¿à§°à§à¦§à¦¾à§°à¦¿à¦¤ à¦¸à¦®à¦¯à¦¼ (à¦¸à¦¾à¦§à¦¾à§°à¦£à¦¤à§‡ à§§à§¦+ à¦¬à¦›à§°, à¦¬à¦¾ à§°à¦¾à¦œà§à¦¯à¦¤ à¦œà¦¨à§à¦®) à¦§à§°à¦¿ à¦…à¦¸à¦®à¦¤ à¦¥à¦•à¦¾ à¦²à§‹à¦•à§‡ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦­à§‹à¦Ÿà¦¾à§° à¦¤à¦¾à¦²à¦¿à¦•à¦¾, à¦®à¦¾à¦Ÿà¦¿à§° à¦…à¦­à¦¿à¦²à§‡à¦– à¦¬à¦¾ à¦¬à¦¿à¦¦à§à¦¯à¦¾à¦²à¦¯à¦¼à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§°à§° à¦¦à§°à§‡ à¦¬à¦¾à¦¸à¦¸à§à¦¥à¦¾à¦¨à§° à¦¸à¦¾à¦•à§à¦·à§à¦¯ à¦²à¦¾à¦—à¦¿à¦¬à¥¤',
   'à¦¸à§‡à§±à¦¾ à¦¸à§‡à¦¤à§ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦ªà§°à¦¿à¦šà¦¯à¦¼, à¦ à¦¿à¦•à¦¨à¦¾, à¦¬à¦¾à¦¸à¦¸à§à¦¥à¦¾à¦¨à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦“ à¦¶à¦ªà¦¤à¦¨à¦¾à¦®à¦¾à¦¸à¦¹ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦•à¥¤ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦¸à¦¤à§à¦¯à¦¾à¦ªà¦¨à§° à¦ªà¦¾à¦›à¦¤ à¦šà¦•à§à§° à¦¬à¦¿à¦·à¦¯à¦¼à¦¾à¦‡ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Residence evidence', 'Voter list entry, land records, or school certificate proving residence.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Proof of identity', 'Proof of address', 'Residence evidence', 'Affidavit of income', 'Aadhaar card (e-KYC)')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://sewasetu.assam.gov.in', 'Sewa Setu â€” Government of Assam', 'official_government_page',
    'Revenue and Disaster Management Department, Assam', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://sewasetu.assam.gov.in');
end;
$$;

-- â”€â”€ 10. Death Certificate (RGI / Civil Registration) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
do $$
declare
  st_id uuid; en_id uuid; hi_id uuid; as_id uuid;
  cat_id uuid; dept_id uuid; svc_id uuid; doc_id uuid;
begin
  select id into st_id from public.states where code = 'AS';
  select id into en_id from public.languages where code = 'en';
  select id into hi_id from public.languages where code = 'hi';
  select id into as_id from public.languages where code = 'as';
  select id into cat_id from public.service_categories where name = 'Certificates';
  select id into dept_id from public.departments where state_id = st_id and name = 'Office of the Registrar General and Census Commissioner, India';

  insert into public.services (category_id, department_id, state_id, slug, status, version)
  values (cat_id, dept_id, st_id, 'death-certificate', 'published', 1)
  on conflict (state_id, slug) do update set status = excluded.status, version = excluded.version;
  select id into svc_id from public.services where state_id = st_id and slug = 'death-certificate';

  insert into public.service_translations (service_id, language_id, name, short_description, full_description, eligibility_text, how_to_apply_text) values
  (svc_id, en_id, 'Death Certificate',
   'Register a death and obtain the official death certificate.',
   'A death certificate is issued under the Registration of Births and Deaths Act, 1969 by the local Registrar. It records the name, date, place and cause of death, and is required for insurance claims, pension settlement, property transfer and closing official records.',
   'Every death in India must be registered within 21 days. The head of the household, nearest relative, or the hospital or institution where the death occurred can report it. Delayed registration needs additional affidavits and fees.',
   'Report the death at the hospital or local Registrar office (municipal body or gaon panchayat) with the deceased identity proof. Apply on the Civil Registration System portal or state service portal, then collect the printed certificate.'),
  (svc_id, hi_id, 'à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤°',
   'à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤•à¤¾ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤†à¤§à¤¿à¤•à¤¾à¤°à¤¿à¤• à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚à¥¤',
   'à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤œà¤¨à¥à¤®-à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤…à¤§à¤¿à¤¨à¤¿à¤¯à¤®, 1969 à¤•à¥‡ à¤¤à¤¹à¤¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¤œà¤¿à¤¸à¥à¤Ÿà¥à¤°à¤¾à¤° à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤œà¤¾à¤°à¥€ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤®à¥‡à¤‚ à¤¨à¤¾à¤®, à¤¤à¤¿à¤¥à¤¿, à¤¸à¥à¤¥à¤¾à¤¨ à¤µ à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤•à¤¾ à¤•à¤¾à¤°à¤£ à¤¦à¤°à¥à¤œ à¤¹à¥‹à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤¬à¥€à¤®à¤¾ à¤¦à¤¾à¤µà¤¾, à¤ªà¥‡à¤‚à¤¶à¤¨ à¤¨à¤¿à¤ªà¤Ÿà¤¾à¤¨, à¤¸à¤‚à¤ªà¤¤à¥à¤¤à¤¿ à¤¹à¤¸à¥à¤¤à¤¾à¤‚à¤¤à¤°à¤£ à¤¹à¥‡à¤¤à¥ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤',
   'à¤­à¤¾à¤°à¤¤ à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤®à¥ƒà¤¤à¥à¤¯à¥ à¤•à¤¾ 21 à¤¦à¤¿à¤¨à¥‹à¤‚ à¤•à¥‡ à¤­à¥€à¤¤à¤° à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤¹à¥ˆà¥¤ à¤ªà¤°à¤¿à¤µà¤¾à¤° à¤•à¤¾ à¤®à¥à¤–à¤¿à¤¯à¤¾, à¤¨à¤¿à¤•à¤Ÿà¤¤à¤® à¤¸à¤‚à¤¬à¤‚à¤§à¥€ à¤¯à¤¾ à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤¸à¥‚à¤šà¤¨à¤¾ à¤¦à¥‡ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤µà¤¿à¤²à¤‚à¤¬à¤¿à¤¤ à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤¹à¥‡à¤¤à¥ à¤…à¤¤à¤¿à¤°à¤¿à¤•à¥à¤¤ à¤¶à¤ªà¤¥à¤ªà¤¤à¥à¤° à¤µ à¤¶à¥à¤²à¥à¤• à¤²à¤—à¤¤à¤¾ à¤¹à¥ˆà¥¤',
   'à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤¯à¤¾ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¤œà¤¿à¤¸à¥à¤Ÿà¥à¤°à¤¾à¤° à¤•à¤¾à¤°à¥à¤¯à¤¾à¤²à¤¯ à¤®à¥‡à¤‚ à¤®à¥ƒà¤¤à¤• à¤•à¥‡ à¤ªà¤¹à¤šà¤¾à¤¨ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤¸à¤¹à¤¿à¤¤ à¤¸à¥‚à¤šà¤¨à¤¾ à¤¦à¥‡à¤‚à¥¤ à¤¸à¤¿à¤µà¤¿à¤² à¤ªà¤‚à¤œà¥€à¤•à¤°à¤£ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤¯à¤¾ à¤°à¤¾à¤œà¥à¤¯ à¤¸à¥‡à¤µà¤¾ à¤ªà¥‹à¤°à¥à¤Ÿà¤² à¤ªà¤° à¤†à¤µà¥‡à¤¦à¤¨ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤®à¥à¤¦à¥à¤°à¤¿à¤¤ à¤ªà¥à¤°à¤®à¤¾à¤£ à¤ªà¤¤à¥à¤° à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚à¥¤'),
  (svc_id, as_id, 'à¦®à§ƒà¦¤à§à¦¯à§à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§°',
   'à¦®à§ƒà¦¤à§à¦¯à§ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦• à¦†à§°à§ à¦šà§°à¦•à¦¾à§°à§€ à¦®à§ƒà¦¤à§à¦¯à§à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦²à¦¾à¦­ à¦•à§°à¦•à¥¤',
   'à¦®à§ƒà¦¤à§à¦¯à§à§° à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦œà¦¨à§à¦®-à¦®à§ƒà¦¤à§à¦¯à§ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦†à¦‡à¦¨, à§§à§¯à§¬à§¯à§° à¦…à¦§à§€à¦¨à¦¤ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦•à§‡ à¦¦à¦¿à¦¯à¦¼à§‡à¥¤ à¦¨à¦¾à¦®, à¦¤à¦¾à§°à¦¿à¦–, à¦¸à§à¦¥à¦¾à¦¨ à¦“ à¦®à§ƒà¦¤à§à¦¯à§à§° à¦•à¦¾à§°à¦£ à¦²à¦¿à¦–à¦¾ à¦¥à¦¾à¦•à§‡à¥¤ à¦¬à§€à¦®à¦¾ à¦¦à¦¾à¦¬à§€, à¦ªà§‡à¦žà§à¦šà¦¨ à¦¨à¦¿à¦·à§à¦ªà¦¤à§à¦¤à¦¿, à¦¸à¦®à§à¦ªà¦¤à§à¦¤à¦¿ à¦¹à¦¸à§à¦¤à¦¾à¦¨à§à¦¤à§°à§° à¦¬à¦¾à¦¬à§‡ à¦²à¦¾à¦—à§‡à¥¤',
   'à¦­à¦¾à§°à¦¤à¦¤ à¦ªà§à§°à¦¤à¦¿à¦Ÿà§‹ à¦®à§ƒà¦¤à§à¦¯à§ à§¨à§§ à¦¦à¦¿à¦¨à§° à¦­à¦¿à¦¤à§°à¦¤ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦•à§°à¦¾à¦Ÿà§‹ à¦¬à¦¾à¦§à§à¦¯à¦¤à¦¾à¦®à§‚à¦²à¦•à¥¤ à¦ªà§°à¦¿à¦¯à¦¼à¦¾à¦²à§° à¦®à§à§°à¦¬à§à¦¬à§€, à¦¨à¦¿à¦•à¦Ÿ à¦†à¦¤à§à¦®à§€à¦¯à¦¼ à¦¬à¦¾ à¦¸à¦‚à¦¶à§à¦²à¦¿à¦·à§à¦Ÿ à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾à¦²à¦¯à¦¼à§‡ à¦–à¦¬à§° à¦¦à¦¿à¦¬ à¦ªà¦¾à§°à§‡à¥¤ à¦ªà¦²à¦®à¦•à§ˆ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨à§° à¦¬à¦¾à¦¬à§‡ à¦…à¦¤à¦¿à§°à¦¿à¦•à§à¦¤ à¦¶à¦ªà¦¤à¦¨à¦¾à¦®à¦¾ à¦“ à¦®à¦¾à¦šà§à¦² à¦²à¦¾à¦—à§‡à¥¤',
   'à¦šà¦¿à¦•à¦¿à§Žà¦¸à¦¾à¦²à¦¯à¦¼ à¦¬à¦¾ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦• à¦•à¦¾à§°à§à¦¯à¦¾à¦²à¦¯à¦¼à¦¤ à¦®à§ƒà¦¤à¦•à§° à¦ªà§°à¦¿à¦šà¦¯à¦¼ à¦ªà§à§°à¦®à¦¾à¦£à¦¸à¦¹ à¦–à¦¬à§° à¦¦à¦¿à¦¯à¦¼à¦•à¥¤ à¦¨à¦¾à¦—à§°à¦¿à¦• à¦ªà¦žà§à¦œà§€à¦¯à¦¼à¦¨ à¦ªà§‹à§°à§à¦Ÿà§‡à¦² à¦¬à¦¾ à§°à¦¾à¦œà§à¦¯ à¦¸à§‡à§±à¦¾ à¦ªà§‹à§°à§à¦Ÿà§‡à¦²à¦¤ à¦†à¦¬à§‡à¦¦à¦¨ à¦•à§°à¦¿ à¦®à§à¦¦à§à§°à¦¿à¦¤ à¦ªà§à§°à¦®à¦¾à¦£ à¦ªà¦¤à§à§° à¦¸à¦‚à¦—à§à§°à¦¹ à¦•à§°à¦•à¥¤')
  on conflict (service_id, language_id) do update set
    name = excluded.name, short_description = excluded.short_description,
    full_description = excluded.full_description, eligibility_text = excluded.eligibility_text,
    how_to_apply_text = excluded.how_to_apply_text;

  insert into public.document_types (name, description) values
    ('Hospital death report', 'Medical certificate of cause of death issued by the hospital.'),
    ('Deceased identity proof', 'Aadhaar, voter ID or other ID of the deceased person.')
  on conflict (name) do update set description = excluded.description;

  for doc_id in select id from public.document_types where name in
    ('Hospital death report', 'Deceased identity proof', 'Parent identity proof')
  loop
    insert into public.service_documents (service_id, document_type_id, is_required)
    values (svc_id, doc_id, true)
    on conflict (service_id, document_type_id) do update set is_required = excluded.is_required;
  end loop;

  insert into public.service_sources (service_id, source_url, source_title, source_type, government_department, verified_at, verified_by, status)
  select svc_id, 'https://crsorgi.gov.in', 'Civil Registration System â€” Registrar General of India', 'official_government_page',
    'Office of the Registrar General and Census Commissioner, India', date '2026-09-23', null, 'verified'
  where not exists (select 1 from public.service_sources s where s.service_id = svc_id and s.source_url = 'https://crsorgi.gov.in');
end;
$$;
