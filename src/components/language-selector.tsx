"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Language } from "@/lib/data";
import { trackEvent } from "@/lib/actions";

export function LanguageSelector({ languages, value }: { languages: Language[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function changeLanguage(language: string) {
    document.cookie = `govguide-language=${language}; path=/; max-age=31536000; samesite=lax`;
    void trackEvent("language_changed", pathname, { language });
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", language);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="sr-only">Language</span>
      <select aria-label="Language" value={value} disabled={pending} onChange={(event) => changeLanguage(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-xs outline-none transition-all duration-200 hover:border-slate-400 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]">
        {languages.map((language) => <option key={language.id} value={language.code}>{language.native_name}</option>)}
      </select>
    </label>
  );
}
