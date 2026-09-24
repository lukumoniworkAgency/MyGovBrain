import type { ReactNode } from "react";

/** Shared empty state for dashboard, tracker, vault, and job lists. */
export function EmptyState({ title, description, children, action }: { title: string; description: string; children?: ReactNode; icon?: string; action?: { label: string; href: string } }) {
  return <div className="rounded-xl border border-dashed border-teal-700/30 bg-white p-8 text-center"><p className="text-base font-bold text-slate-900">{title}</p><p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-600">{description}</p>{action ? <a href={action.href} className="mt-5 inline-flex rounded-lg bg-teal-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-teal-900">{action.label}</a> : null}{children ? <div className="mt-5 flex justify-center">{children}</div> : null}</div>;
}
