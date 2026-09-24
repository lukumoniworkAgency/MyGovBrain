import Link from "next/link";
import { selectTranslation, type Service } from "@/lib/data";

export function ServiceCard({ service, languageCode, isFallback }: { service: Service; languageCode: string; isFallback: boolean }) {
  const { translation, isFallback: translationFallback } = selectTranslation(service.translations, languageCode);
  return <article className="card-hover flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-md ring-1 ring-teal-900/5">
    <div className="flex-1 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">{service.category.name}</p>
      <h2 className="text-xl font-semibold text-slate-900">{translation?.name}</h2>
      <p className="text-sm leading-6 text-slate-500">{translation?.short_description}</p>
      {(isFallback || translationFallback) && <p className="text-xs text-amber-700">Showing English because this service is not yet translated.</p>}
    </div>
    <Link href={`/services/${service.state_code}/${service.slug}?lang=${languageCode}`} className="mt-5 inline-flex w-fit rounded-lg brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px">View service</Link>
  </article>;
}
