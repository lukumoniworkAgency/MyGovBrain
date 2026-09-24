import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-slate-200/80 bg-white p-6 shadow-md ring-1 ring-teal-900/5 transition-shadow duration-200 hover:shadow-lg ${className}`} {...props} />;
}
