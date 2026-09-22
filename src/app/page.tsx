import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { count, error } = supabase
    ? await supabase.from("languages").select("id", { count: "exact", head: true })
    : { count: null, error: new Error("Supabase environment variables are not configured") };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12">
      <Card className="w-full border-teal-900/10 bg-white/90 p-8 sm:p-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4">
            <Badge>Foundation check</Badge>
            <span className="text-sm text-slate-500">Week 1</span>
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Infrastructure is ready.</h1>
            <p className="text-lg leading-8 text-slate-500">This placeholder verifies that the application can reach its database layer without embedding domain records in the codebase.</p>
          </div>
          <div className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Database connection</p>
              <p className="mt-1 font-medium text-slate-900">{error ? "Configuration required" : "Connected"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Language records</p>
              <p className="mt-1 font-medium text-slate-900">{error ? "Unavailable" : (count ?? 0)}</p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
