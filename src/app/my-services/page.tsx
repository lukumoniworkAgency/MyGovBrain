import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getUserDashboard } from "@/lib/data";
import { getPageLanguage } from "@/lib/language";

export default async function MyServicesPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);
  const dashboard = await getUserDashboard(languageCode);
  return <SiteShell languages={languages} languageCode={languageCode}>
    <main id="main-content" className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Saved progress</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">My services</h1>
      {!dashboard.authenticated ? <div className="mt-8 rounded-xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-semibold">Sign in to see your saved services</h2><p className="mt-3 text-slate-600">Your checklist and eligibility results are private to your account.</p><Link href={`/auth?next=/my-services&lang=${languageCode}`} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">Sign in</Link></div> : dashboard.data.length === 0 ? <div className="mt-8 rounded-xl border border-slate-200 bg-white p-7"><h2 className="text-2xl font-semibold">No saved services yet</h2><p className="mt-3 text-slate-600">Start a checklist or save an eligibility result from the service directory.</p><Link href={`/services?lang=${languageCode}`} className="mt-5 inline-flex min-h-11 items-center rounded-md bg-teal-700 px-4 py-2 font-medium text-white hover:bg-teal-800">Browse services</Link></div> : <div className="mt-8 grid gap-5 md:grid-cols-2">{dashboard.data.map((item) => <article key={item.serviceId} className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">{item.serviceName}</h2><p className="mt-3 text-sm text-slate-600">{item.checked} of {item.total} documents checked</p>{item.result && <p className="mt-4 border-l-2 border-amber-400 pl-3 text-sm leading-6 text-slate-600">{item.result}</p>}<Link href={`/services/${item.stateCode}/${item.slug}?lang=${languageCode}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-teal-800 underline underline-offset-4">Open service</Link></article>)}</div>}
    </main>
  </SiteShell>;
}
