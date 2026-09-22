import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ${className}`} {...props} />;
}
