import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-400 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)] ${className}`} {...props} />;
}
