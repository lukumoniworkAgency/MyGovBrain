/**
 * Shared pieces of the "Find help nearby" / agent registration feature.
 *
 * WHY THIS FILE IS SEPARATE FROM src/lib/centers.ts
 * -------------------------------------------------
 * src/lib/centers.ts talks to Supabase and imports "@/lib/supabase/server",
 * which imports next/headers. next/headers only works on the server, so a
 * Client Component ("use client") may not import it - the build would fail.
 * Everything in THIS file is pure: types, message copy, and functions that
 * take a string and return a string. Both the browser and the server can use
 * it safely.
 */

/** A listed CSC / agent, exactly the columns the public cards need. */
export type HelpCenter = {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  whatsapp: string | null;
  verified: boolean;
};

/** One checkbox option in the agent registration form. */
export type ServiceOption = {
  id: string;
  /** English name from service_translations. */
  name: string;
  /** State code, because the same service exists once per state. */
  stateCode: string;
};

/** What the "Find help nearby" search returns. */
export type FindCentersResult = {
  centers: HelpCenter[];
  /** null means "no problem"; a string is a message we can show the visitor. */
  error: string | null;
};

/** What the registration server action returns to useActionState. */
export type RegisterCenterState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Validation/status messages shared by the form (instant feedback) and the
 * server action + SQL function (the real enforcement). Keeping one copy stops
 * the two layers from drifting apart.
 */
export const centerMessages = {
  locationRequired: "Enter a city or a 6 digit PIN code.",
  searchFailed: "We could not search for centers right now. Please try again.",
  nameRequired: "Enter the name of your center.",
  addressRequired: "Enter the full address of your center.",
  cityRequired: "Enter the city or town.",
  pincodeInvalid: "Enter a valid 6 digit PIN code.",
  phoneInvalid: "Enter a valid phone number with at least 10 digits.",
  whatsappInvalid: "Enter a valid WhatsApp number or leave it blank.",
  servicesRequired: "Select at least one service you can help with.",
  saveFailed: "We could not save your details right now. Please try again.",
  success: "Thanks, we'll review and list you soon.",
} as const;

/** The raw values of the registration form, after trimming and normalising. */
export type CenterDraft = {
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  /** Empty string means "not provided". */
  whatsapp: string;
  serviceIds: string[];
};

/** A uuid, which is what the services.id column expects. */
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Turn submitted FormData into a clean draft.
 *
 * This runs in two places on purpose: in the browser it drives the instant
 * error message, and in the server action it is the real input filter. Server
 * actions are public HTTP endpoints, so the server never trusts the browser.
 */
export function draftFromFormData(formData: FormData): CenterDraft {
  const text = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  return {
    name: text("name"),
    address: text("address"),
    city: text("city"),
    pincode: digitsOnly(text("pincode")),
    phone: digitsOnly(text("phone")),
    whatsapp: digitsOnly(text("whatsapp")),
    serviceIds: Array.from(
      new Set(formData.getAll("service_ids").filter((value): value is string => typeof value === "string" && uuidPattern.test(value)))
    // A cap keeps a crafted request from sending thousands of ids.
    ).slice(0, 50),
  };
}

/**
 * Returns the first problem with the draft, or null when it looks fine.
 * These rules mirror the CHECK constraints and the SQL function, so the visitor
 * gets a helpful sentence instead of a database error.
 */
export function validateCenterDraft(draft: CenterDraft): string | null {
  if (draft.name.length < 2) return centerMessages.nameRequired;
  if (draft.address.length < 5) return centerMessages.addressRequired;
  if (draft.city.length < 2) return centerMessages.cityRequired;
  if (!/^[1-9][0-9]{5}$/.test(draft.pincode)) return centerMessages.pincodeInvalid;
  if (!/^[0-9]{10,13}$/.test(draft.phone)) return centerMessages.phoneInvalid;
  if (draft.whatsapp && !/^[0-9]{10,13}$/.test(draft.whatsapp)) return centerMessages.whatsappInvalid;
  if (draft.serviceIds.length === 0) return centerMessages.servicesRequired;
  return null;
}

/**
 * PostgREST filters are built as strings, for example:
 *   .or(`city.ilike.%${value}%,pincode.like.${value}%`)
 * so the visitor's text becomes part of a small query language. A comma or a
 * parenthesis inside the value would close the filter early and let somebody
 * write their own filter. This function keeps user text as data by removing
 * the characters that are meaningful to that syntax, and by capping the length.
 *
 * Everything else (letters, digits, spaces, non-English scripts such as
 * Devanagari) is preserved, so "Guwahati" and "गुवाहाटी" both still work.
 */
export function sanitizeLocationQuery(raw: string) {
  return raw
    .replace(/[,()*%\\"'.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

/** Digits only. Phone numbers are stored as digits, but never trust that. */
export function digitsOnly(value: string | null | undefined) {
  return (value ?? "").replace(/[^0-9]/g, "");
}

/**
 * wa.me needs a full international number. Indian numbers are stored either as
 * 10 digits (local) or with a country code already included, so the 91 prefix
 * is added only when the number looks local.
 * Change this constant when the directory expands outside India.
 */
export function toInternationalNumber(phone: string) {
  const digits = digitsOnly(phone);
  return digits.length === 10 ? `91${digits}` : digits;
}

/** href for the "Call" button, for example tel:+919876543210 */
export function buildCallLink(phone: string) {
  return `tel:+${toInternationalNumber(phone)}`;
}

/**
 * href for the "WhatsApp" button. wa.me is the official click-to-chat link:
 * https://wa.me/<number>?text=<url encoded message>
 */
export function buildWhatsAppLink(phone: string, message: string) {
  return `https://wa.me/${toInternationalNumber(phone)}?text=${encodeURIComponent(message)}`;
}

/**
 * The message the agent receives on WhatsApp. It tells them straight away that
 * this is a real lead and which service the person needs help with.
 */
export function buildContactMessage(platformName: string, serviceName: string) {
  return `Hi, I found you via ${platformName} and need help with ${serviceName}.`;
}

/** Human readable phone number for the button label: 98765 43210 */
export function formatPhoneForDisplay(phone: string) {
  const digits = digitsOnly(phone);
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return local.length === 10 ? `${local.slice(0, 5)} ${local.slice(5)}` : digits;
}
