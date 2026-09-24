import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  parseBody,
  profileInputSchema,
  requirePlatformUser,
  rateLimit,
} from "@/lib/platform/api";

export async function GET() {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const { data, error } = await auth.db
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, created_at, updated_at")
    .eq("id", auth.user!.id)
    .single();
  if (error)
    return apiError("Unable to load profile.", 503, "PROFILE_QUERY_FAILED");
  return apiSuccess(data);
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const limitError = await rateLimit(
    `profile:${auth.user!.id}`,
    20,
    60 * 60 * 1000,
  );
  if (limitError) return limitError;
  const body = await parseBody(request, profileInputSchema);
  if (body.response) return body.response;
  const { data, error } = await auth.db
    .from("profiles")
    .update({
      full_name: body.data?.fullName,
      phone: body.data?.phone,
      avatar_url: body.data?.avatarUrl,
    })
    .eq("id", auth.user!.id)
    .select("id, full_name, phone, avatar_url, role")
    .single();
  if (error)
    return apiError("Unable to update profile.", 503, "PROFILE_UPDATE_FAILED");
  return apiSuccess(data);
}
