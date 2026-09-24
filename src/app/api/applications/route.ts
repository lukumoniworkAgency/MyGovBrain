import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  applicationInputSchema,
  parseBody,
  requireCitizen,
  requirePlatformUser,
  rateLimit,
} from "@/lib/platform/api";

export async function GET() {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const limitError = await rateLimit(`applications:${auth.user!.id}`, 60);
  if (limitError) return limitError;
  const { data, error } = await auth.db
    .from("applications")
    .select(
      "id, reference_number, service_id, center_id, status, remarks, submitted_at, updated_at, completed_at",
    )
    .or(`citizen_id.eq.${auth.user!.id},center_id.not.is.null`)
    .order("submitted_at", { ascending: false })
    .limit(50);
  if (error)
    return apiError(
      "Unable to load applications.",
      503,
      "APPLICATION_QUERY_FAILED",
    );
  return apiSuccess({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const roleError = requireCitizen(auth.user!);
  if (roleError) return roleError;
  const limitError = await rateLimit(
    `application-create:${auth.user!.id}`,
    10,
    60 * 60 * 1000,
  );
  if (limitError) return limitError;
  const body = await parseBody(request, applicationInputSchema);
  if (body.response) return body.response;
  const { data, error } = await auth.db
    .from("applications")
    .insert({
      citizen_id: auth.user!.id,
      service_id: body.data!.serviceId,
      center_id: body.data!.centerId ?? null,
      notes: body.data!.notes ?? null,
    })
    .select("id, reference_number, status")
    .single();
  if (error)
    return apiError(
      "Unable to create application.",
      503,
      "APPLICATION_CREATE_FAILED",
    );
  return apiSuccess(data, 201);
}
