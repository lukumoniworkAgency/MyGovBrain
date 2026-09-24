import type { NextResponse } from "next/server";
import { describe, expect, it } from "vitest";
import {
  applicationInputSchema,
  documentInputSchema,
  requireAdmin,
  requireCitizen,
  requireCscOperator,
  requireSuperAdmin,
} from "@/lib/platform/api";

describe("platform authorization guards", () => {
  it("allows each operational role and retains super-admin access", () => {
    expect(requireCitizen({ role: "citizen" })).toBeNull();
    expect(requireCscOperator({ role: "csc_operator" })).toBeNull();
    expect(requireAdmin({ role: "admin" })).toBeNull();
    expect(requireSuperAdmin({ role: "super_admin" })).toBeNull();
    expect(requireCitizen({ role: "super_admin" })).toBeNull();
  });

  it("rejects unrelated roles", () => {
    const response = requireAdmin({ role: "citizen" });
    expect(response).not.toBeNull();
    expect((response as NextResponse).status).toBe(403);
  });
});

describe("platform request schemas", () => {
  it("accepts a valid application request and rejects invalid UUIDs", () => {
    const valid = {
      serviceId: "6b5b79d7-df09-47c5-9e62-6a38a35659af",
      centerId: null,
      notes: "Please contact after noon.",
    };
    expect(applicationInputSchema.safeParse(valid).success).toBe(true);
    expect(
      applicationInputSchema.safeParse({ serviceId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("centralizes supported document kinds and display-name bounds", () => {
    expect(
      documentInputSchema.safeParse({ kind: "pan", displayName: "PAN card" })
        .success,
    ).toBe(true);
    expect(
      documentInputSchema.safeParse({ kind: "unknown", displayName: "File" })
        .success,
    ).toBe(false);
    expect(
      documentInputSchema.safeParse({
        kind: "other",
        displayName: "x".repeat(121),
      }).success,
    ).toBe(false);
  });
});
