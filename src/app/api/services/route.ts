import type { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  getPlatformDb,
  listQuerySchema,
  rateLimit,
} from "@/lib/platform/api";

export async function GET(request: NextRequest) {
  const limitError = await rateLimit(
    `services:${request.headers.get("x-forwarded-for") ?? "anonymous"}`,
    120,
  );
  if (limitError) return limitError;
  const db = await getPlatformDb();
  if (!db)
    return apiError(
      "Platform database is not configured.",
      503,
      "DATABASE_UNAVAILABLE",
    );
  const query = listQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!query.success)
    return apiError("Invalid service filters.", 422, "VALIDATION_ERROR");
  const { search, category, state, page, limit } = query.data;
  let requestQuery = db
    .from("services")
    .select(
      "id, slug, status, category_id, state_id, service_translations(name, short_description)",
    )
    .eq("status", "published")
    .range((page - 1) * limit, page * limit - 1)
    .order("slug");
  if (category) requestQuery = requestQuery.eq("category_id", category);
  if (state) requestQuery = requestQuery.eq("state_id", state);
  if (search)
    requestQuery = requestQuery.ilike(
      "service_translations.name",
      `%${search}%`,
    );
  const { data, error, count } = await requestQuery;
  if (error)
    return apiError("Unable to load services.", 503, "SERVICE_QUERY_FAILED");
  return apiSuccess({ items: data ?? [], page, limit, total: count ?? 0 });
}
