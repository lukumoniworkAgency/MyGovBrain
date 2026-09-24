import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  documentInputSchema,
  requirePlatformUser,
  rateLimit,
} from "@/lib/platform/api";

const MAX_BYTES = 10 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function GET() {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const { data, error } = await auth.db
    .from("documents")
    .select("id, kind, display_name, mime_type, size_bytes, created_at")
    .eq("owner_id", auth.user!.id)
    .order("created_at", { ascending: false });
  if (error)
    return apiError("Unable to load documents.", 503, "DOCUMENT_QUERY_FAILED");
  return apiSuccess({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const limitError = await rateLimit(
    `document-upload:${auth.user!.id}`,
    20,
    60 * 60 * 1000,
  );
  if (limitError) return limitError;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const metadata = documentInputSchema.safeParse({
    kind: form?.get("kind") ?? "other",
    displayName: form?.get("displayName") ?? "Citizen document",
  });
  if (!metadata.success)
    return apiError("Invalid document metadata.", 422, "VALIDATION_ERROR");
  if (
    !(file instanceof File) ||
    !allowedTypes.has(file.type) ||
    file.size <= 0 ||
    file.size > MAX_BYTES
  )
    return apiError(
      "Only PDF, JPEG, PNG, or WebP files up to 10 MB are accepted.",
      422,
      "FILE_VALIDATION_ERROR",
    );
  const path = `${auth.user!.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: storageError } = await auth.db.storage
    .from("private-documents")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (storageError)
    return apiError("Document upload failed.", 503, "DOCUMENT_UPLOAD_FAILED");
  const { data, error } = await auth.db
    .from("documents")
    .insert({
      owner_id: auth.user!.id,
      kind: metadata.data.kind,
      display_name: metadata.data.displayName,
      storage_bucket: "private-documents",
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("id, kind, display_name, mime_type, size_bytes, created_at")
    .single();
  if (error) {
    await auth.db.storage.from("private-documents").remove([path]);
    return apiError(
      "Unable to save document metadata.",
      503,
      "DOCUMENT_SAVE_FAILED",
    );
  }
  return apiSuccess(data, 201);
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return apiError("id is required.", 422, "VALIDATION_ERROR");
  const { data, error } = await auth.db
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("owner_id", auth.user!.id)
    .select("storage_path")
    .single();
  if (error) return apiError("Document not found.", 404, "NOT_FOUND");
  await auth.db.storage.from("private-documents").remove([data.storage_path]);
  return apiSuccess({ id });
}
