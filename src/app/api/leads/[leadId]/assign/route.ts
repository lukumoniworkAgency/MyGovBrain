import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  leadAssignSchema,
  parseBody,
  rateLimit,
  requireAdmin,
  requirePlatformUser,
} from "@/lib/platform/api";

type RouteContext = { params: Promise<{ leadId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const roleError = requireAdmin(auth.user!);
  if (roleError) return roleError;
  const { leadId } = await params;
  const body = await parseBody(request, leadAssignSchema);
  if (body.response) return body.response;
  const limitError = await rateLimit(`lead-assign:${auth.user!.id}`, 30);
  if (limitError) return limitError;
  const { data: center, error: centerError } = await auth.db
    .from("centers")
    .select("id")
    .eq("id", body.data!.cscId)
    .eq("verification_status", "verified")
    .eq("active", true)
    .maybeSingle();
  if (centerError || !center)
    return apiError(
      "Only active verified CSC centers can receive leads.",
      422,
      "CSC_UNAVAILABLE",
    );
  const { data, error } = await auth.db
    .from("service_leads")
    .update({ assigned_csc_id: body.data!.cscId, status: "assigned" })
    .eq("id", leadId)
    .select("id, lead_code, assigned_csc_id, status, updated_at")
    .single();
  if (error)
    return apiError("Unable to assign lead.", 503, "LEAD_ASSIGN_FAILED");
  await auth.db.from("lead_activity_log").insert({
    lead_id: leadId,
    action: "assigned",
    actor: auth.user!.id,
    metadata: { cscId: body.data!.cscId, reason: body.data!.reason ?? null },
  });
  return apiSuccess(data);
}
