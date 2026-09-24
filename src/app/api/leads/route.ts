import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  leadCreateSchema,
  parseBody,
  rateLimit,
  requireCitizen,
  requirePlatformUser,
} from "@/lib/platform/api";

export async function GET() {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const limitError = await rateLimit(`leads:${auth.user!.id}`, 60);
  if (limitError) return limitError;
  const { data, error } = await auth.db
    .from("service_leads")
    .select(
      "id, lead_code, service_id, assigned_csc_id, status, priority, language, citizen_name, phone, district, notes, expected_contact_at, created_at, updated_at",
    )
    .or(`user_id.eq.${auth.user!.id},assigned_csc_id.not.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return apiError("Unable to load leads.", 503, "LEAD_QUERY_FAILED");
  return apiSuccess({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const roleError = requireCitizen(auth.user!);
  if (roleError) return roleError;
  const limitError = await rateLimit(
    `lead-create:${auth.user!.id}`,
    10,
    60 * 60 * 1000,
  );
  if (limitError) return limitError;
  const body = await parseBody(request, leadCreateSchema);
  if (body.response) return body.response;
  const { data: service, error: serviceError } = await auth.db
    .from("services")
    .select("id")
    .eq("id", body.data!.serviceId)
    .eq("status", "published")
    .maybeSingle();
  if (serviceError || !service)
    return apiError("Service is unavailable.", 422, "SERVICE_UNAVAILABLE");
  const { data, error } = await auth.db
    .from("service_leads")
    .insert({
      user_id: auth.user!.id,
      service_id: body.data!.serviceId,
      citizen_name: body.data!.citizenName,
      phone: body.data!.phone,
      district: body.data!.district ?? null,
      language: body.data!.language,
      notes: body.data!.notes ?? null,
    })
    .select("id, lead_code, status, service_id, created_at")
    .single();
  if (error)
    return apiError(
      "Unable to create assistance request.",
      503,
      "LEAD_CREATE_FAILED",
    );
  return apiSuccess(data, 201);
}
