/** Shared status pill for applications, jobs, CSC availability, notifications. */
export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  let classes = "bg-slate-100 text-slate-700";
  if (["approved", "completed", "open", "open now", "verified", "read"].includes(key)) classes = "bg-emerald-50 text-emerald-800";
  else if (["processing", "verification", "pending", "in review"].includes(key)) classes = "bg-amber-50 text-amber-800";
  else if (["rejected", "failed", "urgent"].includes(key)) classes = "bg-red-50 text-red-800";
  else if (["submitted", "new", "unread"].includes(key)) classes = "bg-teal-50 text-teal-800";
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${classes}`}>
      {status}
    </span>
  );
}
