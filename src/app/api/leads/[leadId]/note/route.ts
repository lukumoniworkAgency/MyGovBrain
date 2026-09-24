import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  leadNoteSchema,
  parseBody,
  rateLimit,
  requirePlatformUser,
} from "@/lib/platform/api";

type RouteContext = { params: Promise<{ leadId: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const { leadId } = await params;
  const body = await parseBody(request, leadNoteSchema);
  if (body.response) return body.response;
  const limitError = await rateLimit(`lead-note:${auth.user!.id}`, 30);
  if (limitError) return limitError;
  const { data, error } = await auth.db
    .from("lead_notes")
    .insert({
      lead_id: leadId,
      author_id: auth.user!.id,
      note: body.data!.note,
    })
    .select("id, lead_id, note, created_at")
    .single();
  if (error)
    return apiError("Unable to save lead note.", 503, "LEAD_NOTE_FAILED");
  return apiSuccess(data, 201);
}
