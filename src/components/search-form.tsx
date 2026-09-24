import Link from "next/link";

export function SearchForm({ value = "", languageCode }: { value?: string; languageCode: string }) {
  return <form action="/services" method="get" className="flex w-full flex-col gap-3 sm:flex-row">
    <input type="hidden" name="lang" value={languageCode} />
    <label className="sr-only" htmlFor="service-search">Search government services</label>
    <input id="service-search" name="q" defaultValue={value} placeholder="Tell us what you need..." className="h-12 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]" />
    <button type="submit" className="min-h-11 rounded-lg brand-gradient px-6 font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px">Search</button>
    {value && <Link href={`/services?lang=${languageCode}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-700 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">Clear</Link>}
  </form>;
}
