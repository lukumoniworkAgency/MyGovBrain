import type { ReactNode } from "react";

/** Shared page header used by inner platform routes. */
export function PageHeader({ kicker, title, lead, children }: { kicker?: string; title: string; lead?: string; children?: ReactNode }) {
  return <header className="border-b border-slate-200/70 bg-[#f4f7f6]"><div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">{kicker ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{kicker}</p> : null}<h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl"><span className="gradient-text">{title}</span></h1>{lead ? <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{lead}</p> : null}{children ? <div className="mt-6">{children}</div> : null}</div></header>;
}
