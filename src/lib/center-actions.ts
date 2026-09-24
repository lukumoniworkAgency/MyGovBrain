"use server";

/**
 * Server actions for the center directory.
 *
 * Two different callers use this file:
 *   - the "Find help nearby" component (search + click tracking);
 *   - the /register-agent form (new listing).
 *
 * IMPORTANT RULE: a server action is a public HTTP endpoint. Next.js sends a
 * POST request for it, and anybody can craft that request without ever loading
 * the page. So every action validates its own input and never trusts the UI.
 * That is why the FormData checks below exist even though the form also does
 * client-side validation.
 */

import {
  centerMessages,
  draftFromFormData,
  validateCenterDraft,
  type FindCentersResult,
  type RegisterCenterState,
} from "@/lib/center-links";
import { findCentersForService, insertCenterRegistration, recordContactClick } from "@/lib/centers";

/** A uuid that satisfies the services.id column type. */
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Search for centers offering a service near the visitor.
 * Returns plain data (never throws) so the component can always render.
 */
export async function findHelpCenters(serviceId: string, location: string): Promise<FindCentersResult> {
  if (typeof serviceId !== "string" || !uuidPattern.test(serviceId)) {
    return { centers: [], error: centerMessages.searchFailed };
  }
  if (typeof location !== "string") {
    return { centers: [], error: centerMessages.locationRequired };
  }
  return findCentersForService(serviceId, location.slice(0, 80));
}

/**
 * Record a "Call" or "WhatsApp" tap.
 *
 * The component calls this with `void` and does not await it: tracking is a
 * nice-to-have, opening the phone app matters more. Errors are swallowed on
 * purpose (they are logged inside recordContactClick).
 */
export async function trackCenterContactClick(centerId: string, serviceId: string) {
  if (typeof centerId !== "string" || typeof serviceId !== "string") return { ok: false };
  if (!uuidPattern.test(centerId) || !uuidPattern.test(serviceId)) return { ok: false };
  try {
    await recordContactClick(centerId, serviceId);
    return { ok: true };
  } catch (error) {
    console.error("trackCenterContactClick failed", error);
    return { ok: false };
  }
}

/**
 * Register a new listing.
 *
 * Signature matters: `useActionState(registerCenter, initialState)` calls an
 * action as (previousState, formData). The `_previousState` argument is unused
 * here, hence the underscore prefix that marks it as intentional.
 *
 * The listing is written with verified = false, so it stays invisible until an
 * admin reviews it in the Supabase dashboard. We never publish automatically.
 */
export async function registerCenter(_previousState: RegisterCenterState, formData: FormData): Promise<RegisterCenterState> {
  // One parser and one validator, shared with the browser form. The browser
  // check is a convenience; this one is the guarantee.
  const draft = draftFromFormData(formData);
  const problem = validateCenterDraft(draft);
  if (problem) return { status: "error", message: problem };

  const result = await insertCenterRegistration({
    ...draft,
    // The column is nullable, so an empty text box becomes null rather than "".
    whatsapp: draft.whatsapp || null,
  });

  // On failure the SQL function's own validation message is returned when it is
  // one we wrote (see insertCenterRegistration); otherwise a generic message.
  if (result.error) return { status: "error", message: result.error };

  // Nothing to revalidate: the listing is not public yet, and no public page
  // caches center data.
  return { status: "success", message: centerMessages.success };
}
