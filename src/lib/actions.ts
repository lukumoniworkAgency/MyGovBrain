"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminStatus } from "@/lib/admin";
import { revalidatePath } from "next/cache";

const serviceStatuses = new Set(["draft", "published", "inactive"]);
const sourceStatuses = new Set(["verified", "needs_review", "outdated", "archived"]);
const ruleTypes = new Set(["yes_no", "single_select", "number", "text"]);
const ruleStatuses = new Set(["active", "needs_review", "inactive"]);

export async function trackEvent(eventName: "service_search" | "service_view" | "language_changed" | "checklist_created", path: string, metadata: Record<string, string> = {}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  await supabase.from("analytics_events").insert({ event_name: eventName, path, metadata });
}

function requiredText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseRules(value: string) {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error("Eligibility rules must be a JSON array.");
  for (const rule of parsed) {
    if (!rule || typeof rule !== "object") throw new Error("Each eligibility rule must be an object.");
    const candidate = rule as Record<string, unknown>;
    if (typeof candidate.question_type !== "string" || !ruleTypes.has(candidate.question_type)) throw new Error("Eligibility question type is invalid.");
    if (typeof candidate.sort_order !== "number" || candidate.sort_order < 0) throw new Error("Eligibility sort order is invalid.");
    if (typeof candidate.status !== "string" || !ruleStatuses.has(candidate.status)) throw new Error("Eligibility rule status is invalid.");
  }
  return parsed as Record<string, unknown>[];
}

export async function saveAdminService(_previousState: { error?: string; success?: boolean }, formData: FormData) {
  const { supabase, user, isAdmin } = await getAdminStatus();
  if (!supabase || !user) return { error: "Sign in is required." };
  if (!isAdmin) return { error: "You do not have administrator access." };
  const serviceId = formData.get("service_id");
  const categoryId = requiredText(formData, "category_id");
  const departmentId = requiredText(formData, "department_id");
  const stateId = requiredText(formData, "state_id");
  const slug = requiredText(formData, "slug");
  const status = requiredText(formData, "status");
  const sourceUrl = requiredText(formData, "source_url");
  const sourceId = requiredText(formData, "source_id");
  const sourceStatus = requiredText(formData, "source_status");
  if (!categoryId || !departmentId || !stateId || !slug || !status || !sourceUrl || !sourceStatus) return { error: "Category, department, state, slug, service status, source URL, and source status are required." };
  if (!serviceStatuses.has(status)) return { error: "Service status is invalid." };
  if (!sourceStatuses.has(sourceStatus)) return { error: "Source status is invalid." };
  try { new URL(sourceUrl); } catch { return { error: "Source URL must be a valid URL." }; }
  let rules: Record<string, unknown>[];
  try { rules = parseRules(requiredText(formData, "eligibility_rules_json") ?? "[]"); } catch (error) { return { error: error instanceof Error ? error.message : "Eligibility rules are invalid." }; }
  const translations = ["en", "hi"].map((code) => ({ code, name: requiredText(formData, `${code}_name`), short_description: requiredText(formData, `${code}_short_description`), full_description: requiredText(formData, `${code}_full_description`), eligibility_text: requiredText(formData, `${code}_eligibility_text`), how_to_apply_text: requiredText(formData, `${code}_how_to_apply_text`) }));
  if (translations.some((translation) => !translation.name)) return { error: "English and Hindi service names are required." };
  const { data: service, error: serviceError } = await supabase.from("services").upsert({ ...(typeof serviceId === "string" && serviceId ? { id: serviceId } : {}), category_id: categoryId, department_id: departmentId, state_id: stateId, slug, status, version: 1 }, { onConflict: "state_id,slug" }).select("id").single();
  if (serviceError || !service) return { error: serviceError?.message ?? "Service could not be saved." };
  const languageResult = await supabase.from("languages").select("id, code").in("code", ["en", "hi"]);
  if (languageResult.error) return { error: "Languages could not be loaded." };
  for (const translation of translations) {
    const language = languageResult.data.find((item) => item.code === translation.code);
    if (!language) return { error: `Missing ${translation.code} language configuration.` };
    const { error } = await supabase.from("service_translations").upsert({ service_id: service.id, language_id: language.id, name: translation.name, short_description: translation.short_description, full_description: translation.full_description, eligibility_text: translation.eligibility_text, how_to_apply_text: translation.how_to_apply_text }, { onConflict: "service_id,language_id" });
    if (error) return { error: "Service translations could not be saved." };
  }
  const selectedDocuments = formData.getAll("document_type_id").filter((value): value is string => typeof value === "string");
  await supabase.from("service_documents").delete().eq("service_id", service.id);
  if (selectedDocuments.length) {
    const { error } = await supabase.from("service_documents").insert(selectedDocuments.map((documentTypeId) => ({ service_id: service.id, document_type_id: documentTypeId, is_required: formData.get(`required_${documentTypeId}`) === "on" })));
    if (error) return { error: "Documents could not be saved." };
  }
  const sourceResult = await supabase.from("service_sources").upsert({ ...(sourceId ? { id: sourceId } : {}), service_id: service.id, source_url: sourceUrl, source_title: requiredText(formData, "source_title") ?? "Official source", verified_at: requiredText(formData, "verified_at") || null, verified_by: user.id, status: sourceStatus }, { onConflict: "id" });
  if (sourceResult.error) return { error: "Official source could not be saved." };
  await supabase.from("eligibility_rules").delete().eq("service_id", service.id);
  for (const rule of rules) {
    const { data: savedRule, error } = await supabase.from("eligibility_rules").insert({ service_id: service.id, question_type: rule.question_type, question_text: typeof rule.question_text === "string" ? rule.question_text : null, options: rule.options ?? [], sort_order: rule.sort_order, status: typeof rule.status === "string" ? rule.status : "needs_review" }).select("id").single();
    if (error || !savedRule) return { error: "Eligibility rules could not be saved." };
    const ruleTranslations = typeof rule.translations === "object" && rule.translations !== null ? rule.translations as Record<string, unknown> : {};
    for (const code of ["en", "hi"]) {
      const language = languageResult.data.find((item) => item.code === code);
      const translation = ruleTranslations[code];
      if (!language || !translation || typeof translation !== "object") continue;
      const candidate = translation as Record<string, unknown>;
      await supabase.from("eligibility_rules_translations").insert({ rule_id: savedRule.id, language_id: language.id, question_text: typeof candidate.question_text === "string" ? candidate.question_text : "", option_labels: candidate.option_labels ?? {} });
    }
  }
  await supabase.from("audit_logs").insert({ user_id: user.id, action: serviceId ? "update" : "create", table_name: "services", record_id: service.id });
  revalidatePath("/admin");
  revalidatePath(`/services/${stateId}/${slug}`);
  return { success: true };
}

export async function saveChecklistItem(serviceId: string, documentTypeId: string, checked: boolean) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "configuration" as const };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, reason: "unauthenticated" as const };
  const { data: checklist, error: checklistError } = await supabase.from("user_checklists").upsert({ user_id: userData.user.id, service_id: serviceId, status: "active" }, { onConflict: "user_id,service_id" }).select("id").single();
  if (checklistError || !checklist) return { ok: false, reason: "database" as const };
  await trackEvent("checklist_created", "/services", {});
  const { error } = await supabase.from("user_checklist_items").upsert({ checklist_id: checklist.id, document_type_id: documentTypeId, checked }, { onConflict: "checklist_id,document_type_id" });
  return { ok: !error, reason: error ? "database" as const : undefined };
}

export async function saveEligibilityResult(serviceId: string, answers: Record<string, string>) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "configuration" as const };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, reason: "unauthenticated" as const };
  const result = "Based on what you shared, you may be able to continue with this service. Please verify the current official requirements before applying.";
  const { error } = await supabase.from("user_service_cases").upsert({ user_id: userData.user.id, service_id: serviceId, status: "active", eligibility_answers: answers, eligibility_result: result }, { onConflict: "user_id,service_id" });
  return { ok: !error, reason: error ? "database" as const : undefined };
}
