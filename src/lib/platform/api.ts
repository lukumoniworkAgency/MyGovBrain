import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRateLimitStore } from "@/lib/ai/rate-limit-store";

export const platformUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  role: z.enum(["citizen", "csc_operator", "admin", "super_admin"]),
});

export const applicationInputSchema = z.object({
  serviceId: z.string().uuid(),
  centerId: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const profileInputSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/)
    .optional(),
  avatarUrl: z.url().optional(),
});

export const documentInputSchema = z.object({
  kind: z.enum([
    "aadhaar",
    "pan",
    "voter_id",
    "driving_license",
    "certificate",
    "marksheet",
    "other",
  ]),
  displayName: z.string().trim().min(1).max(120),
});

export const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const leadCreateSchema = z.object({
  serviceId: z.string().uuid(),
  citizenName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/),
  district: z.string().trim().max(120).optional(),
  language: z.string().trim().min(2).max(12).default("en"),
  notes: z.string().trim().max(4000).optional(),
});

export const leadStatusSchema = z.object({
  status: z.enum([
    "new",
    "assigned",
    "contacted",
    "documents_pending",
    "in_progress",
    "submitted",
    "completed",
    "cancelled",
    "rejected",
  ]),
  notes: z.string().trim().max(2000).optional(),
});

export const leadNoteSchema = z.object({
  note: z.string().trim().min(1).max(4000),
});

export const leadAssignSchema = z.object({
  cscId: z.string().uuid(),
  reason: z.string().trim().max(1000).optional(),
});

export function apiError(message: string, status = 400, code = "BAD_REQUEST") {
  return NextResponse.json({ error: { message, code } }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

type PlatformDb = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

export async function getPlatformDb(): Promise<PlatformDb | null> {
  return (await createSupabaseServerClient()) as PlatformDb | null;
}

export async function requirePlatformUser() {
  const db = await getPlatformDb();
  if (!db)
    return {
      db: null,
      user: null,
      response: apiError(
        "Platform database is not configured.",
        503,
        "DATABASE_UNAVAILABLE",
      ),
    };
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user)
    return {
      db,
      user: null,
      response: apiError("Authentication required.", 401, "UNAUTHENTICATED"),
    };
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profileError || !profile)
    return {
      db,
      user: null,
      response: apiError("User profile unavailable.", 403, "PROFILE_REQUIRED"),
    };
  const parsed = platformUserSchema.safeParse({
    id: user.id,
    email: user.email,
    role: profile.role,
  });
  if (!parsed.success)
    return {
      db,
      user: null,
      response: apiError("User role is invalid.", 403, "ROLE_REQUIRED"),
    };
  return { db, user: parsed.data, response: null };
}

export function requireRole(user: { role: string }, roles: string[]) {
  return roles.includes(user.role) || user.role === "super_admin"
    ? null
    : apiError("Insufficient permissions.", 403, "FORBIDDEN");
}

export function requireCitizen(user: { role: string }) {
  return user.role === "citizen" || user.role === "super_admin"
    ? null
    : apiError("Citizen access required.", 403, "FORBIDDEN");
}

export function requireCscOperator(user: { role: string }) {
  return user.role === "csc_operator" || user.role === "super_admin"
    ? null
    : apiError("CSC operator access required.", 403, "FORBIDDEN");
}

export function requireAdmin(user: { role: string }) {
  return requireRole(user, ["admin"]);
}

export function requireSuperAdmin(user: { role: string }) {
  return user.role === "super_admin"
    ? null
    : apiError("Super admin access required.", 403, "FORBIDDEN");
}

export async function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const hit = await getRateLimitStore().increment(`platform:${key}`, windowMs);
  return hit.count > limit
    ? apiError(
        "Too many requests. Please try again later.",
        429,
        "RATE_LIMITED",
      )
    : null;
}

export async function parseBody<T>(request: Request, schema: z.ZodType<T>) {
  try {
    const result = schema.safeParse(await request.json());
    if (!result.success)
      return {
        data: null,
        response: apiError("Invalid request body.", 422, "VALIDATION_ERROR"),
      };
    return { data: result.data, response: null };
  } catch {
    return {
      data: null,
      response: apiError(
        "Request body must be valid JSON.",
        400,
        "INVALID_JSON",
      ),
    };
  }
}
