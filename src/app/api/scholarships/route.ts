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
    `scholarships:${request.headers.get("x-forwarded-for") ?? "anonymous"}`,
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
    return apiError("Invalid scholarship filters.", 422, "VALIDATION_ERROR");
  const { search, state, page, limit } = query.data;
  let requestQuery = db
    .from("scholarships")
    .select(
      "id, title, provider, description, eligibility, benefits, state_id, education_level, income_criteria, deadline, apply_url, status",
    )
    .eq("status", "published")
    .order("deadline", { ascending: true })
    .range((page - 1) * limit, page * limit - 1);
  if (state) requestQuery = requestQuery.eq("state_id", state);
  if (search)
    requestQuery = requestQuery.or(
      `title.ilike.%${search}%,provider.ilike.%${search}%`,
    );
  const { data, error, count } = await requestQuery;
  if (error)
    return apiError(
      "Unable to load scholarships.",
      503,
      "SCHOLARSHIP_QUERY_FAILED",
    );
  return apiSuccess({ items: data ?? [], page, limit, total: count ?? 0 });
}
