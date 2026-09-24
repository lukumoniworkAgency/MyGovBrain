import type { ReactNode } from "react";

/** KPI stat tile used by dashboard, tracker, and partner pages. */
export function StatCard({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: string; tone?: "default" | "success" | "warning" | "danger" | "info" | "amber" | "blue" | "emerald" | "rose" }) {
  const tones: Record<string, string> = { default: "text-slate-900", success: "text-emerald-700", warning: "text-amber-700", danger: "text-red-700", info: "text-teal-800", amber: "text-amber-700", blue: "text-blue-700", emerald: "text-emerald-700", rose: "text-rose-700" };
  return <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-teal-900/5"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p><p className={`mt-2 text-3xl font-bold tracking-tight ${tones[tone] ?? tones.default}`}>{value}</p>{hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}</div>;
}
