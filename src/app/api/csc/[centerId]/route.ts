import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  getPlatformDb,
  rateLimit,
} from "@/lib/platform/api";

type RouteContext = { params: Promise<{ centerId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const limitError = await rateLimit("csc-detail", 120);
  if (limitError) return limitError;
  const db = await getPlatformDb();
  if (!db)
    return apiError(
      "Platform database is not configured.",
      503,
      "DATABASE_UNAVAILABLE",
    );
  const { centerId } = await params;
  const { data: center, error } = await db
    .from("centers")
    .select(
      "id, name, address, city, pincode, phone, email, supported_languages, verification_status, active, csc_services(service_id, is_available)",
    )
    .eq("id", centerId)
    .eq("verified", true)
    .maybeSingle();
  if (error) return apiError("Unable to load center.", 503, "CSC_QUERY_FAILED");
  if (!center) return apiError("Center not found.", 404, "CSC_NOT_FOUND");
  return apiSuccess(center);
}
