"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";

type Notification = {
  id: string;
  title: string;
  body: string;
  kind: "Job" | "Application" | "Scholarship" | "Scheme";
  important: boolean;
  read: boolean;
  time: string;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "SSC CGL 2026 notification released", body: "14,582 vacancies announced. Last date to apply: 15 Mar 2026.", kind: "Job", important: true, read: false, time: "2h ago" },
  { id: "n2", title: "Income Certificate approved", body: "Application APP-1042 moved to Processing. Collect from Sharma Digital Seva Kendra.", kind: "Application", important: true, read: false, time: "5h ago" },
  { id: "n3", title: "Post-Matric Scholarship deadline", body: "Applications close 28 Feb 2026. Check eligibility before applying.", kind: "Scholarship", important: false, read: false, time: "1d ago" },
  { id: "n4", title: "PM-KISAN instalment credited", body: "16th instalment of Rs 2,000 credited to verified beneficiaries.", kind: "Scheme", important: false, read: true, time: "2d ago" },
  { id: "n5", title: "Application APP-1039 approved", body: "PAN Card application approved. Dispatch expected within 7 days.", kind: "Application", important: false, read: true, time: "4d ago" },
];

type Filter = "All" | "Unread" | "Read" | "Important";
const FILTERS: Filter[] = ["All", "Unread", "Read", "Important"];

export function NotificationsCenter({ languageCode: _languageCode }: { languageCode?: string }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [items, setItems] = useState(DEMO_NOTIFICATIONS);

  const visible = items.filter((item) => {
    if (filter === "Unread") return !item.read;
    if (filter === "Read") return item.read;
    if (filter === "Important") return item.important;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter notifications">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${filter === item ? "brand-gradient text-white shadow-md" : "border border-slate-300 bg-white text-slate-600 hover:border-teal-700 hover:text-teal-800"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setItems((prev) => prev.map((item) => ({ ...item, read: true })))} className="text-xs font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
          Mark all as read
        </button>
      </div>

      <ul className="space-y-3">
        {visible.map((item) => (
          <li key={item.id} className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${item.read ? "border-slate-200 bg-white" : "border-teal-700/25 bg-teal-50/40"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {!item.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-teal-600" aria-label="Unread" /> : null}
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <StatusBadge status={item.kind === "Application" ? "Processing" : item.kind} />
                <span className="text-[11px] text-slate-400">{item.time}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 ? <EmptyState title="Nothing here" description="No notifications match this filter right now." /> : null}
    </div>
  );
}

