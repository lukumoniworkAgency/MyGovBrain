do $$
declare
  target_service_id uuid;
  english_id uuid;
  hindi_id uuid;
  case_rule_id uuid;
  document_rule_id uuid;
begin
  select id into target_service_id from public.services where slug = 'assam-ration-card-application';
  select id into english_id from public.languages where code = 'en';
  select id into hindi_id from public.languages where code = 'hi';

  if target_service_id is null then
    raise exception 'Expected Week 2 ration card service is missing';
  end if;

  insert into public.eligibility_rules (service_id, question_type, question_text, options, sort_order, status)
  values (
    target_service_id,
    'single_select',
    'Which application case describes what you need?',
    '[{"value":"new","label":"New ration card"},{"value":"duplicate","label":"Duplicate ration card"},{"value":"separate","label":"Separate ration card"},{"value":"change","label":"Inclusion, deletion, surrender, or another change"}]'::jsonb,
    1,
    'needs_review'
  )
  on conflict do nothing
  returning id into case_rule_id;

  if case_rule_id is null then
    select id into case_rule_id from public.eligibility_rules where service_id = target_service_id and sort_order = 1;
  end if;

  insert into public.eligibility_rules_translations (rule_id, language_id, question_text, option_labels)
  values
    (case_rule_id, english_id, 'Which application case describes what you need?', '{"new":"New ration card","duplicate":"Duplicate ration card","separate":"Separate ration card","change":"Inclusion, deletion, surrender, or another change"}'::jsonb),
    (case_rule_id, hindi_id, 'आपको किस प्रकार के आवेदन की आवश्यकता है?', '{"new":"नया राशन कार्ड","duplicate":"डुप्लीकेट राशन कार्ड","separate":"अलग राशन कार्ड","change":"शामिल करना, हटाना, सरेंडर या अन्य बदलाव"}'::jsonb)
  on conflict (rule_id, language_id) do update set question_text = excluded.question_text, option_labels = excluded.option_labels;

  insert into public.eligibility_rules (service_id, question_type, question_text, options, sort_order, status)
  values (
    target_service_id,
    'yes_no',
    'Do you have the documents listed for your selected application case?',
    '[{"value":"yes","label":"Yes"},{"value":"no","label":"No"}]'::jsonb,
    2,
    'needs_review'
  )
  on conflict do nothing
  returning id into document_rule_id;

  if document_rule_id is null then
    select id into document_rule_id from public.eligibility_rules where service_id = target_service_id and sort_order = 2;
  end if;

  insert into public.eligibility_rules_translations (rule_id, language_id, question_text, option_labels)
  values
    (document_rule_id, english_id, 'Do you have the documents listed for your selected application case?', '{"yes":"Yes","no":"No"}'::jsonb),
    (document_rule_id, hindi_id, 'क्या आपके पास चुने गए आवेदन प्रकार के लिए सूचीबद्ध दस्तावेज़ हैं?', '{"yes":"हाँ","no":"नहीं"}'::jsonb)
  on conflict (rule_id, language_id) do update set question_text = excluded.question_text, option_labels = excluded.option_labels;
end;
$$;
