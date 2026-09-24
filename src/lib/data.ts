import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Language = { id: string; code: string; name: string; native_name: string };
export type Category = { id: string; name: string; icon: string | null; sort_order: number };
export type Translation = {
  language_id: string;
  language_code: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  eligibility_text: string | null;
  how_to_apply_text: string | null;
};
export type Service = {
  id: string;
  slug: string;
  state_code: string;
  category: Category;
  translations: Translation[];
  documents?: { id: string; name: string; description: string | null; is_required: boolean }[];
  sources?: { source_url: string; source_title: string; status: string; verified_at: string | null }[];
  eligibilityRules?: EligibilityRule[];
};
export type EligibilityRule = {
  id: string;
  question_type: "yes_no" | "single_select" | "number" | "text";
  question_text: string | null;
  options: { value: string; label: string }[];
  sort_order: number;
  status: string;
  translations: { language_code: string; question_text: string; option_labels: Record<string, string> }[];
};

type Relation<T> = T | T[] | null;
type RawTranslation = Omit<Translation, "language_code"> & { languages: Relation<{ code: string }> };
type RawService = {
  id: string;
  slug: string;
  states: Relation<{ code: string }>;
  service_categories: Relation<Category>;
  service_translations: RawTranslation[];
  service_documents: { is_required: boolean; document_types: Relation<{ id: string; name: string; description: string | null }> }[];
  service_sources: { source_url: string; source_title: string; status: string; verified_at: string | null }[];
  eligibility_rules: { id: string; question_type: EligibilityRule["question_type"]; question_text: string | null; options: EligibilityRule["options"]; sort_order: number; status: string; eligibility_rules_translations: { question_text: string; option_labels: Record<string, string>; languages: Relation<{ code: string }> }[] }[];
};

const fallbackLanguageCode = "en";

function firstRelation<T>(relation: Relation<T>) {
  return Array.isArray(relation) ? relation[0] : relation ?? undefined;
}

export function selectTranslation(translations: Translation[], languageCode: string) {
  const selected = translations.find((translation) => translation.language_code === languageCode);
  if (selected) return { translation: selected, isFallback: false };
  const fallback = translations.find((translation) => translation.language_code === fallbackLanguageCode);
  return { translation: fallback ?? translations[0], isFallback: Boolean(fallback) && Boolean(translations[0]) };
}

export async function getLanguages(): Promise<Language[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase.from("languages").select("id, code, name, native_name").eq("status", "active").order("sort_order");
  return (data ?? []) as Language[];
}

function mapService(row: RawService): Service {
  return {
    id: row.id,
    slug: row.slug,
    state_code: firstRelation(row.states)?.code ?? "",
    category: firstRelation(row.service_categories) ?? { id: "", name: "", icon: null, sort_order: 0 },
    translations: (row.service_translations ?? []).map((translation) => ({
      ...translation,
      language_code: firstRelation(translation.languages)?.code ?? "",
    })),
    documents: row.service_documents?.map((document) => ({
      id: firstRelation(document.document_types)?.id ?? "",
      name: firstRelation(document.document_types)?.name ?? "",
      description: firstRelation(document.document_types)?.description ?? null,
      is_required: document.is_required,
    })),
    sources: row.service_sources ?? [],
    eligibilityRules: row.eligibility_rules?.map((rule) => ({
      id: rule.id,
      question_type: rule.question_type,
      question_text: rule.question_text,
      options: rule.options,
      sort_order: rule.sort_order,
      status: rule.status,
      translations: rule.eligibility_rules_translations.map((translation) => ({
        language_code: firstRelation(translation.languages)?.code ?? "",
        question_text: translation.question_text,
        option_labels: translation.option_labels,
      })),
    })).sort((first, second) => first.sort_order - second.sort_order),
  };
}

const serviceSelect = `id, slug, states!inner(code), service_categories!inner(id, name, icon, sort_order), service_translations!inner(language_id, name, short_description, full_description, eligibility_text, how_to_apply_text, languages!inner(code)), service_documents(document_type_id, is_required, document_types!inner(id, name, description)), service_sources(source_url, source_title, status, verified_at), eligibility_rules(id, question_type, question_text, options, sort_order, status, eligibility_rules_translations(question_text, option_labels, languages!inner(code)))`;

export async function getCategories() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: [] as Category[], error: true };
  const { data, error } = await supabase.from("service_categories").select("id, name, icon, sort_order").eq("status", "active").order("sort_order");
  return { data: (data ?? []) as Category[], error: Boolean(error) };
}

export async function getServices(options: { categoryId?: string; query?: string } = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: [] as Service[], error: true };
  let request = supabase.from("services").select(serviceSelect).eq("status", "published").order("slug");
  if (options.categoryId) request = request.eq("category_id", options.categoryId);
  if (options.query?.trim()) {
    request = request.textSearch("service_translations.search_document", options.query.trim(), { type: "websearch", config: "simple" });
  }
  const { data, error } = await request;
  return { data: (data ?? []).map((row) => mapService(row as unknown as RawService)), error: Boolean(error) };
}

export async function getService(stateCode: string, slug: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: true };
  const { data, error } = await supabase.from("services").select(serviceSelect).eq("status", "published").eq("slug", slug).eq("states.code", stateCode.toUpperCase()).maybeSingle();
  return { data: data ? mapService(data as unknown as RawService) : null, error: Boolean(error) };
}

export async function getChecklistState(serviceId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { checked: [] as string[], authenticated: false };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { checked: [] as string[], authenticated: false };
  const { data } = await supabase.from("user_checklists").select("user_checklist_items(document_type_id, checked)").eq("service_id", serviceId).eq("user_id", userData.user.id).maybeSingle();
  return { checked: (data?.user_checklist_items ?? []).filter((item: { checked: boolean }) => item.checked).map((item: { document_type_id: string }) => item.document_type_id), authenticated: true };
}

export async function getUserDashboard(languageCode = "en") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { authenticated: false, data: [] as { serviceId: string; slug: string; stateCode: string; serviceName: string; checked: number; total: number; result: string | null }[] };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { authenticated: false, data: [] };
  const { data } = await supabase.from("user_checklists").select("service_id, user_checklist_items(checked), services!inner(slug, states!inner(code), service_translations!inner(name, languages!inner(code))), user_service_cases(eligibility_result)").eq("user_id", userData.user.id);
  const rows = (data ?? []) as unknown as { service_id: string; user_checklist_items: { checked: boolean }[]; services: { slug: string; states: { code: string }; service_translations: { name: string; languages: { code: string } }[] }; user_service_cases: { eligibility_result: string | null }[] }[];
  return { authenticated: true, data: rows.map((row) => ({ serviceId: row.service_id, slug: row.services.slug, stateCode: row.services.states.code, serviceName: row.services.service_translations.find((translation) => translation.languages.code === languageCode)?.name ?? row.services.service_translations.find((translation) => translation.languages.code === "en")?.name ?? row.services.service_translations[0]?.name ?? "", checked: row.user_checklist_items.filter((item) => item.checked).length, total: row.user_checklist_items.length, result: row.user_service_cases[0]?.eligibility_result ?? null })) };
}
