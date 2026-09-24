import {
  apiError,
  apiSuccess,
  requireAdmin,
  requirePlatformUser,
} from "@/lib/platform/api";

export async function GET() {
  const auth = await requirePlatformUser();
  if (auth.response) return auth.response;
  const roleError = requireAdmin(auth.user!);
  if (roleError) return roleError;
  const [users, applications, centers] = await Promise.all([
    auth.db.from("profiles").select("id", { count: "exact", head: true }),
    auth.db.from("applications").select("id", { count: "exact", head: true }),
    auth.db
      .from("centers")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
  ]);
  if (users.error || applications.error || centers.error)
    return apiError("Unable to load analytics.", 503, "ANALYTICS_QUERY_FAILED");
  return apiSuccess({
    totalUsers: users.count ?? 0,
    totalApplications: applications.count ?? 0,
    totalCenters: centers.count ?? 0,
  });
}
