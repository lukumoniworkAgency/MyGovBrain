/**
 * Server-only database access for the center directory.
 *
 * "Server-only" matters here: this file imports "@/lib/supabase/server", which
 * imports next/headers, which only exists on the server. Never import this file
 * from a Client Component. Client Components call the server actions in
 * src/lib/center-actions.ts instead, and share types/helpers through
 * src/lib/center-links.ts.
 */

import {
  centerMessages,
  digitsOnly,
  sanitizeLocationQuery,
  type FindCentersResult,
  type HelpCenter,
  type ServiceOption,
} from "@/lib/center-links";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** A safety cap. The UI does not paginate yet, and 50 cards is plenty. */
const maxResults = 50;

/** The database returns the embedded join as an array; we only need the row. */
type CenterRow = HelpCenter & { center_services: { service_id: string }[] };

/**
 * Find listed centers that offer `serviceId` in the city or PIN code the
 * visitor typed.
 *
 * Two things are happening in the query below:
 *   - `center_services!inner(service_id)` is an INNER join, so a center only
 *     appears when it actually offers this service. A plain (left) join would
 *     return every center in the city.
 *   - Row level security adds `where verified = true` on centers for anonymous
 *     visitors, so an unverified registration can never leak here even if this
 *     code forgot to filter it.
 */
export async function findCentersForService(serviceId: string, location: string): Promise<FindCentersResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { centers: [], error: centerMessages.searchFailed };

  const search = sanitizeLocationQuery(location);
  if (!search) return { centers: [], error: centerMessages.locationRequired };

  // Build the "city OR pincode" filter. Each value was sanitised above, so it
  // cannot inject extra filter syntax into the query string.
  const filters = [`city.ilike.%${search}%`];
  const digits = digitsOnly(search);
  if (digits) {
    // Prefix match, so both "781001" and the partial "781" work.
    filters.push(`pincode.like.${digits}%`);
  }

  const { data, error } = await supabase
    .from("centers")
    .select("id, name, address, city, pincode, phone, whatsapp, verified, center_services!inner(service_id)")
    .eq("center_services.service_id", serviceId)
    .or(filters.join(","))
    .order("city")
    .order("name")
    .limit(maxResults);

  if (error) {
    // Log the technical detail for the developer, show friendly copy to the
    // visitor.
    console.error("findCentersForService failed", error.message);
    return { centers: [], error: centerMessages.searchFailed };
  }

  // Map explicitly instead of spreading, so the embedded center_services array
  // never leaks into the component's props.
  const centers = ((data ?? []) as unknown as CenterRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    phone: row.phone,
    whatsapp: row.whatsapp,
    verified: row.verified,
  }));

  return { centers, error: null };
}

/**
 * The checkbox list on /register-agent: every published service, with its
 * English name and state code.
 *
 * The same service exists once per state (unique (state_id, slug)), so the
 * state code is shown in the label to keep "Aadhaar Card Services" (Assam)
 * distinguishable from "Aadhaar Card Services" (Bihar).
 */
export async function getServiceOptions(): Promise<{ data: ServiceOption[]; error: boolean }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: [], error: true };

  const { data, error } = await supabase
    .from("services")
    .select("id, slug, states!inner(code), service_translations!inner(name, languages!inner(code))")
    .eq("status", "published")
    .order("slug")
    .limit(200);

  if (error) {
    console.error("getServiceOptions failed", error.message);
    return { data: [], error: true };
  }

  const rows = (data ?? []) as unknown as {
    id: string;
    slug: string;
    states: { code: string } | { code: string }[] | null;
    service_translations: { name: string; languages: { code: string } | { code: string }[] | null }[];
  }[];

  function firstRelation<T>(relation: T | T[] | null): T | undefined {
    return Array.isArray(relation) ? relation[0] : relation ?? undefined;
  }

  const options = rows.map((row) => {
    const english = row.service_translations.find((translation) => firstRelation(translation.languages)?.code === "en");
    return {
      id: row.id,
      // Fall back to any translation, then to the slug, so a missing English
      // row can never render an empty checkbox label.
      name: english?.name ?? row.service_translations[0]?.name ?? row.slug,
      stateCode: firstRelation(row.states)?.code ?? "",
    };
  });

  options.sort((first, second) => first.name.localeCompare(second.name) || first.stateCode.localeCompare(second.stateCode));
  return { data: options, error: false };
}

export type CenterRegistration = {
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  whatsapp: string | null;
  serviceIds: string[];
};

/**
 * Write a new listing through the register_center SQL function.
 *
 * Why not two inserts from here? See the long comment at the top of
 * supabase/migrations/20260923000300_add_center_directory_tables.sql: the public
 * role cannot read back an unverified row to discover its id, and two separate
 * inserts are not atomic. The function performs both inserts inside one
 * transaction and returns the new id.
 */
export async function insertCenterRegistration(input: CenterRegistration): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { id: null, error: centerMessages.saveFailed };

  const { data, error } = await supabase.rpc("register_center", {
    p_name: input.name,
    p_address: input.address,
    p_city: input.city,
    p_pincode: input.pincode,
    p_phone: input.phone,
    p_whatsapp: input.whatsapp,
    p_service_ids: input.serviceIds,
  });

  if (error) {
    console.error("insertCenterRegistration failed", error.message);
    // Validation errors raised by the SQL function carry a message we wrote
    // ourselves, so they are safe (and useful) to show. Anything else is a
    // database detail the visitor should not have to read.
    const isOurValidation = Object.values(centerMessages).some((message) => message === error.message);
    return { id: null, error: isOurValidation ? error.message : centerMessages.saveFailed };
  }

  return { id: typeof data === "string" ? data : null, error: null };
}

/**
 * Record one "Call" or "WhatsApp" tap. Called from a server action that does
 * not await the result, so a slow or failing insert can never delay the tap.
 */
export async function recordContactClick(centerId: string, serviceId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from("contact_clicks").insert({ center_id: centerId, service_id: serviceId });
  if (error) console.error("recordContactClick failed", error.message);
}
