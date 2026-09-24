import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`inline-flex h-10 items-center justify-center rounded-lg brand-gradient px-4 text-sm font-semibold tracking-tight text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${className}`} {...props} />;
}
