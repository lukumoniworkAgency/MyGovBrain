import { describe, expect, it } from "vitest";
import {
  buildCallLink,
  buildContactMessage,
  buildWhatsAppLink,
  centerMessages,
  digitsOnly,
  draftFromFormData,
  formatPhoneForDisplay,
  sanitizeLocationQuery,
  toInternationalNumber,
  validateCenterDraft,
} from "@/lib/center-links";

// This file has no DOM and no database: it only proves the pure helper
// functions behave as documented, which is where the tricky edge cases live.

describe("sanitizeLocationQuery", () => {
  it("keeps ordinary city names and PIN codes usable", () => {
    expect(sanitizeLocationQuery("  Guwahati  ")).toBe("Guwahati");
    expect(sanitizeLocationQuery("781001")).toBe("781001");
    expect(sanitizeLocationQuery("New Delhi")).toBe("New Delhi");
  });

  it("keeps non-English city names", () => {
    expect(sanitizeLocationQuery("गुवाहाटी")).toBe("गुवाहाटी");
  });

  it("removes characters that would let input escape the PostgREST filter", () => {
    // Without this, "X,city.ilike.%Y%" could inject a second filter condition.
    expect(sanitizeLocationQuery("X,city.ilike.%Y%")).toBe("X city ilike Y");
    expect(sanitizeLocationQuery("foo)*bar")).toBe("foo bar");
    expect(sanitizeLocationQuery('say "hi"')).toBe("say hi");
  });

  it("caps the length so a huge query is never forwarded", () => {
    expect(sanitizeLocationQuery("a".repeat(200))).toHaveLength(60);
  });
});

describe("phone helpers", () => {
  it("reduces a number to digits", () => {
    expect(digitsOnly("+91 98765-43210")).toBe("919876543210");
    expect(digitsOnly(null)).toBe("");
  });

  it("adds the India country code only for local ten digit numbers", () => {
    expect(toInternationalNumber("9876543210")).toBe("919876543210");
    expect(toInternationalNumber("919876543210")).toBe("919876543210");
  });

  it("builds a tel link for calling", () => {
    expect(buildCallLink("9876543210")).toBe("tel:+919876543210");
  });

  it("builds a wa.me link with the service pre-filled in the message", () => {
    const link = buildWhatsAppLink("9876543210", "Hi there");
    expect(link.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    // Take the link apart again to prove the message survives URL encoding.
    expect(new URL(link).searchParams.get("text")).toBe("Hi there");
  });

  it("names the platform and the service in the pre-filled message", () => {
    expect(buildContactMessage("GovGuide AI", "Aadhaar PVC Reprint")).toBe(
      "Hi, I found you via GovGuide AI and need help with Aadhaar PVC Reprint."
    );
  });

  it("formats the number for the button label", () => {
    expect(formatPhoneForDisplay("919876543210")).toBe("98765 43210");
  });
});

describe("draftFromFormData", () => {
  it("trims text, keeps digits only, and de-duplicates service ids", () => {
    const formData = new FormData();
    formData.set("name", "  Pragati CSC  ");
    formData.set("address", "  Main Road, Ward 4  ");
    formData.set("city", " Guwahati ");
    formData.set("pincode", "781 001");
    formData.set("phone", "+91 98765 43210");
    formData.set("whatsapp", "");
    formData.append("service_ids", "6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa");
    formData.append("service_ids", "6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa");
    formData.append("service_ids", "not-a-uuid");

    expect(draftFromFormData(formData)).toEqual({
      name: "Pragati CSC",
      address: "Main Road, Ward 4",
      city: "Guwahati",
      pincode: "781001",
      phone: "919876543210",
      whatsapp: "",
      serviceIds: ["6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa"],
    });
  });
});

describe("validateCenterDraft", () => {
  const validDraft = {
    name: "Pragati CSC",
    address: "Main Road, Ward 4",
    city: "Guwahati",
    pincode: "781001",
    phone: "9876543210",
    whatsapp: "",
    serviceIds: ["6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa"],
  };

  it("accepts a complete draft and treats WhatsApp as optional", () => {
    expect(validateCenterDraft(validDraft)).toBeNull();
  });

  it("rejects a PIN code that is not six digits", () => {
    expect(validateCenterDraft({ ...validDraft, pincode: "78100" })).toBe(centerMessages.pincodeInvalid);
    expect(validateCenterDraft({ ...validDraft, pincode: "012345" })).toBe(centerMessages.pincodeInvalid);
  });

  it("rejects a short phone number", () => {
    expect(validateCenterDraft({ ...validDraft, phone: "98765" })).toBe(centerMessages.phoneInvalid);
  });

  it("rejects a malformed WhatsApp number but allows a blank one", () => {
    expect(validateCenterDraft({ ...validDraft, whatsapp: "123" })).toBe(centerMessages.whatsappInvalid);
    expect(validateCenterDraft({ ...validDraft, whatsapp: "" })).toBeNull();
  });

  it("requires at least one service", () => {
    expect(validateCenterDraft({ ...validDraft, serviceIds: [] })).toBe(centerMessages.servicesRequired);
  });

  it("requires the name, address, and city", () => {
    expect(validateCenterDraft({ ...validDraft, name: "" })).toBe(centerMessages.nameRequired);
    expect(validateCenterDraft({ ...validDraft, address: "abc" })).toBe(centerMessages.addressRequired);
    expect(validateCenterDraft({ ...validDraft, city: "" })).toBe(centerMessages.cityRequired);
  });
});
