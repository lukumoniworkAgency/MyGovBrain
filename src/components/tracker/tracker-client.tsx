"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

const DEMO_APPLICATIONS = [
  { id: "APP-1042", service: "Income Certificate", state: "Assam", status: "Processing", date: "18 Feb 2026" },
  { id: "APP-1039", service: "PAN Card (New)", state: "India", status: "Approved", date: "11 Feb 2026" },
  { id: "APP-1031", service: "Birth Certificate", state: "Bihar", status: "Rejected", date: "02 Feb 2026" },
  { id: "APP-1028", service: "Aadhaar Update", state: "India", status: "Completed", date: "27 Jan 2026" },
  { id: "APP-1024", service: "Ration Card", state: "Rajasthan", status: "Submitted", date: "21 Jan 2026" },
] as const;

const STEPS = ["Submitted", "Verification", "Processing", "Approval", "Completed"] as const;

const STEP_PROGRESS: Record<string, number> = {
  Submitted: 1,
  Rejected: 2,
  Processing: 3,
  Approved: 4,
  Completed: 5,
};

export function TrackerClient() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading your applications…</p>;
  }
  if (!user) {
    return (
      <EmptyState
        icon="Lock"
        title="Sign in to track applications"
        description="Log in to see live status, timelines, and downloadable receipts for every request you have submitted."
        action={{ label: "Log in / Sign up", href: "/auth" }}
      />
    );
  }

  const applications = DEMO_APPLICATIONS;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Requests" value={applications.length} />
        <StatCard label="Pending" value={applications.filter((a) => a.status === "Submitted").length} tone="amber" />
        <StatCard label="Processing" value={applications.filter((a) => a.status === "Processing").length} tone="blue" />
        <StatCard label="Approved" value={applications.filter((a) => a.status === "Approved").length} tone="emerald" />
        <StatCard label="Rejected" value={applications.filter((a) => a.status === "Rejected").length} tone="rose" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md ring-1 ring-teal-900/5">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-900">Your applications</h2>
          <p className="text-xs text-slate-500">Demo data — live tracking arrives with the submission pipeline.</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {applications.map((app) => (
            <li key={app.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{app.service}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {app.id} · {app.state} · {app.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <Link
                    href="/services"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    Receipt
                  </Link>
                </div>
              </div>
              <ol className="mt-4 grid grid-cols-5 gap-1" aria-label={`Status timeline for ${app.id}`}>
                {STEPS.map((step, index) => {
                  const reached = index < (STEP_PROGRESS[app.status] ?? 1);
                  return (
                    <li key={step} className="min-w-0">
                      <span
                        className={`block h-1.5 rounded-full ${reached ? "brand-gradient" : "bg-slate-200"}`}
                        aria-hidden="true"
                      />
                      <span className={`mt-1.5 block truncate text-[10px] font-semibold ${reached ? "text-teal-800" : "text-slate-400"}`}>
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
