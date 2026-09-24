import type { NextRequest } from "next/server";
import { apiError, apiSuccess, requirePlatformUser } from "@/lib/platform/api";

export async function GET() {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const { data, error } = await auth.db
    .from("notifications")
    .select(
      "id, type, channel, title, body, data, is_read, is_important, sent_at, created_at",
    )
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error)
    return apiError(
      "Unable to load notifications.",
      503,
      "NOTIFICATION_QUERY_FAILED",
    );
  return apiSuccess({ items: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    isRead?: boolean;
  } | null;
  if (!body?.id) return apiError("id is required.", 422, "VALIDATION_ERROR");
  const { data, error } = await auth.db
    .from("notifications")
    .update({ is_read: body.isRead ?? true })
    .eq("id", body.id)
    .eq("user_id", auth.user!.id)
    .select("id, is_read")
    .single();
  if (error)
    return apiError(
      "Unable to update notification.",
      503,
      "NOTIFICATION_UPDATE_FAILED",
    );
  return apiSuccess(data);
}
