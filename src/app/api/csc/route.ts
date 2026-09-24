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
    `csc:${request.headers.get("x-forwarded-for") ?? "anonymous"}`,
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
    return apiError("Invalid center filters.", 422, "VALIDATION_ERROR");
  const { search, page, limit } = query.data;
  let requestQuery = db
    .from("centers")
    .select(
      "id, name, address, city, pincode, verified, rating, review_count, status",
    )
    .eq("verified", true)
    .range((page - 1) * limit, page * limit - 1)
    .order("name");
  if (search)
    requestQuery = requestQuery.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,pincode.ilike.%${search}%`,
    );
  const { data, error, count } = await requestQuery;
  if (error)
    return apiError("Unable to load centers.", 503, "CSC_QUERY_FAILED");
  return apiSuccess({ items: data ?? [], page, limit, total: count ?? 0 });
}
