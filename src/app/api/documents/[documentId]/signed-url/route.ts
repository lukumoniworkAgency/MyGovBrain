import { z } from "zod";
import {
  apiError,
  apiSuccess,
  rateLimit,
  requirePlatformUser,
} from "@/lib/platform/api";

type Props = { params: Promise<{ documentId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const limitError = await rateLimit(
    `document-signed-url:${auth.user!.id}`,
    60,
    60 * 60 * 1000,
  );
  if (limitError) return limitError;
  const { documentId } = await params;
  if (!z.string().uuid().safeParse(documentId).success)
    return apiError("Invalid document id.", 422, "VALIDATION_ERROR");

  const isAdmin = ["admin", "super_admin"].includes(auth.user!.role);
  const query = auth.db
    .from("documents")
    .select("id, storage_bucket, storage_path, mime_type")
    .eq("id", documentId);
  const { data: document, error } = isAdmin
    ? await query.single()
    : await query.eq("owner_id", auth.user!.id).single();
  if (error || !document)
    return apiError("Document not found.", 404, "NOT_FOUND");

  const { data: signed, error: signedError } = await auth.db.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.storage_path, 60, {
      download: false,
    });
  if (signedError)
    return apiError(
      "Unable to create document link.",
      503,
      "SIGNED_URL_FAILED",
    );

  const { error: auditError } = await auth.db
    .from("document_access_logs")
    .insert({
      document_id: document.id,
      user_id: auth.user!.id,
      action: "signed_url",
    });
  if (auditError)
    return apiError(
      "Unable to audit document access.",
      503,
      "DOCUMENT_AUDIT_FAILED",
    );

  return apiSuccess({ url: signed.signedUrl, expiresIn: 60 });
}
