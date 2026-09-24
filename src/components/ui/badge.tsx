import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full border border-teal-700/15 bg-gradient-to-b from-teal-50 to-teal-100/60 px-2.5 py-1 text-xs font-semibold tracking-wide text-teal-800 shadow-xs ${className}`} {...props} />;
}
