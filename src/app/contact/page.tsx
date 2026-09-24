import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { ContactForm } from "@/components/contact-form";
import { contactPage, siteConfig } from "@/config/legal";

export const metadata: Metadata = {
  title: `Contact us — GovGuide AI`,
  description: contactPage.lead,
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { languages, languageCode } = await getPageLanguage((await searchParams).lang);
  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content" className="anim-fade-in">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
          <header className="anim-fade-up stagger-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">{contactPage.kicker}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{contactPage.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{contactPage.lead}</p>
          </header>

          <div className="anim-fade-up stagger-2 mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md ring-1 ring-teal-900/5 sm:p-8">
              <ContactForm contactEmail={siteConfig.contactEmail} />
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-b from-teal-50 to-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-teal-900">Direct email</h2>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="mt-1.5 inline-block font-medium text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {siteConfig.contactEmail}
                </a>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Response time</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{siteConfig.responseTime}</p>
              </div>
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-amber-900">Please note</h2>
                <p className="mt-1.5 text-sm leading-6 text-amber-900/80">
                  We never ask for Aadhaar, PAN, bank, or password details. Official fees are paid only on
                  government portals.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
