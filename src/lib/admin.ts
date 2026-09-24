import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminWorkspace = {
  categories: { id: string; name: string }[];
  states: { id: string; name: string; code: string }[];
  departments: { id: string; name: string; state_id: string | null }[];
  languages: { id: string; code: string; name: string }[];
  documentTypes: { id: string; name: string; description: string | null }[];
  services: AdminService[];
};

export type AdminService = {
  id: string;
  slug: string;
  status: string;
  category_id: string;
  department_id: string;
  state_id: string;
  translations: { language_id: string; language_code: string; name: string; short_description: string | null; full_description: string | null; eligibility_text: string | null; how_to_apply_text: string | null }[];
  documents: { document_type_id: string; is_required: boolean }[];
  source: { id: string; source_url: string; source_title: string; verified_at: string | null; verified_by: string | null; status: string } | null;
  rules: { id: string; question_type: string; question_text: string | null; options: unknown; sort_order: number; status: string; translations: { language_code: string; question_text: string; option_labels: unknown }[] }[];
};

export async function getAdminStatus() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, isAdmin: false };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { supabase, user: null, isAdmin: false };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { supabase, user: userData.user, isAdmin: isAdmin === true };
}

export async function getAdminWorkspace(): Promise<AdminWorkspace | null> {
  const { supabase, isAdmin } = await getAdminStatus();
  if (!supabase || !isAdmin) return null;
  const [categories, states, departments, languages, documentTypes, services] = await Promise.all([
    supabase.from("service_categories").select("id, name").order("name"),
    supabase.from("states").select("id, name, code").order("name"),
    supabase.from("departments").select("id, name, state_id").order("name"),
    supabase.from("languages").select("id, code, name").eq("status", "active").order("sort_order"),
    supabase.from("document_types").select("id, name, description").order("name"),
    supabase.from("services").select("id, slug, status, category_id, department_id, state_id, service_translations(language_id, name, short_description, full_description, eligibility_text, how_to_apply_text, languages(code)), service_documents(document_type_id, is_required), service_sources(id, source_url, source_title, verified_at, verified_by, status), eligibility_rules(id, question_type, question_text, options, sort_order, status, eligibility_rules_translations(question_text, option_labels, languages(code)))").order("slug"),
  ]);
  if ([categories, states, departments, languages, documentTypes, services].some((result) => result.error)) return null;
  return {
    categories: categories.data ?? [],
    states: states.data ?? [],
    departments: departments.data ?? [],
    languages: languages.data ?? [],
    documentTypes: documentTypes.data ?? [],
    services: (services.data ?? []).map((service) => {
      const translations = (service.service_translations ?? []).map((translation) => ({ ...translation, language_code: translation.languages?.[0]?.code ?? "" }));
      const source = Array.isArray(service.service_sources) ? service.service_sources[0] ?? null : service.service_sources ?? null;
      const rules = (service.eligibility_rules ?? []).map((rule) => ({ ...rule, translations: (rule.eligibility_rules_translations ?? []).map((translation) => ({ ...translation, language_code: translation.languages?.[0]?.code ?? "" })) }));
      return { id: service.id, slug: service.slug, status: service.status, category_id: service.category_id, department_id: service.department_id, state_id: service.state_id, translations, documents: service.service_documents ?? [], source, rules } as AdminService;
    }),
  };
}
