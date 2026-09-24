import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { ServiceCard } from "@/components/service-card";
import { SiteShell } from "@/components/site-shell";
import { getCategories, getServices } from "@/lib/data";
import { getPageLanguage } from "@/lib/language";
import { AnalyticsTracker } from "@/components/analytics-tracker";

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ lang?: string; q?: string; category?: string }> }) {
  const params = await searchParams;
  const [{ languages, languageCode }, categoriesResult, servicesResult] = await Promise.all([getPageLanguage(params.lang), getCategories(), getServices({ categoryId: params.category, query: params.q })]);
  const selectedCategory = categoriesResult.data.find((category) => category.id === params.category);
  return <SiteShell languages={languages} languageCode={languageCode}>
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"><AnalyticsTracker eventName="service_search" path="/services" metadata={{ has_query: params.q ? "true" : "false" }} />
      <div className="max-w-3xl anim-fade-up"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Directory</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Government services</h1><p className="mt-4 text-lg leading-8 text-slate-600">Search the published services available in the directory.</p><div className="mt-7"><SearchForm languageCode={languageCode} value={params.q} /></div></div>
      <div className="mt-10 flex flex-wrap gap-2" aria-label="Filter by category"><Link href={`/services?lang=${languageCode}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} aria-pressed={!params.category} className={`rounded-full border px-4 py-2 text-sm shadow-xs transition-all duration-200 ${!params.category ? "border-teal-700 brand-gradient text-white shadow-md" : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-teal-700 hover:shadow-md"}`}>All</Link>{categoriesResult.data.map((category) => <Link key={category.id} href={`/services?category=${category.id}&lang=${languageCode}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} aria-pressed={params.category === category.id} className={`rounded-full border px-4 py-2 text-sm shadow-xs transition-all duration-200 ${params.category === category.id ? "border-teal-700 brand-gradient text-white shadow-md" : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-teal-700 hover:shadow-md"}`}>{category.name}</Link>)}</div>
      {servicesResult.error ? null : servicesResult.data.length > 0 ? <p className="mt-6 text-sm font-medium text-slate-500" aria-live="polite">{servicesResult.data.length} service{servicesResult.data.length === 1 ? "" : "s"} available{selectedCategory ? ` in ${selectedCategory.name}` : ""}{params.q ? ` for “${params.q}”` : ""}</p> : null}
      {servicesResult.error ? <p className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800 shadow-xs">We could not load services right now. Please try again.</p> : <section className="mt-10" aria-live="polite">{selectedCategory && <h2 className="mb-5 text-2xl font-semibold">{selectedCategory.name}</h2>}{servicesResult.data.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md ring-1 ring-teal-900/5"><h2 className="text-xl font-semibold">No services listed yet</h2><p className="mt-2 text-slate-600">Try another search or browse the available categories.</p><Link href={`/services?lang=${languageCode}`} className="mt-5 inline-flex h-10 items-center rounded-lg brand-gradient px-4 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110">Browse all services</Link></div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{servicesResult.data.map((service, index) => <div key={service.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}><ServiceCard service={service} languageCode={languageCode} isFallback={false} /></div>)}</div>}</section>}
    </main>
  </SiteShell>;
}
