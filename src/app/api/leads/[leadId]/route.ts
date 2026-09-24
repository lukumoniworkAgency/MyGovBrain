import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  leadStatusSchema,
  parseBody,
  rateLimit,
  requireAdmin,
  requireCscOperator,
  requirePlatformUser,
} from "@/lib/platform/api";

type RouteContext = { params: Promise<{ leadId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const { leadId } = await params;
  const { data, error } = await auth.db
    .from("service_leads")
    .select(
      "id, lead_code, user_id, service_id, assigned_csc_id, status, priority, language, citizen_name, phone, district, notes, expected_contact_at, created_at, updated_at",
    )
    .eq("id", leadId)
    .maybeSingle();
  if (error || !data) return apiError("Lead not found.", 404, "LEAD_NOT_FOUND");
  return apiSuccess(data);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const { leadId } = await params;
  const adminError = requireAdmin(auth.user!);
  const operatorError = requireCscOperator(auth.user!);
  if (adminError && operatorError) return operatorError;
  const body = await parseBody(request, leadStatusSchema);
  if (body.response) return body.response;
  const limitError = await rateLimit(`lead-status:${auth.user!.id}`, 60);
  if (limitError) return limitError;
  const { data, error } = await auth.db
    .from("service_leads")
    .update({ status: body.data!.status, notes: body.data!.notes ?? null })
    .eq("id", leadId)
    .select("id, lead_code, status, updated_at")
    .single();
  if (error)
    return apiError(
      "Unable to update lead status.",
      503,
      "LEAD_STATUS_UPDATE_FAILED",
    );
  return apiSuccess(data);
}
