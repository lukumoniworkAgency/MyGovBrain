import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { RegisterAgentForm } from "@/components/register-agent-form";
import { getServiceOptions } from "@/lib/centers";
import { getPageLanguage } from "@/lib/language";

export const metadata: Metadata = {
  title: "Register your center — GovGuide AI",
  description: "CSC and agent centers: get listed so people nearby can find in-person help with government services.",
};

/**
 * A server component, so it can read the service list straight from the database
 * and hand plain data to the client form. No auth, no payment: anyone running a
 * center can submit, and every submission waits for manual review.
 */
export default async function RegisterAgentPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const query = await searchParams;
  const [{ languages, languageCode }, serviceOptions] = await Promise.all([getPageLanguage(query.lang), getServiceOptions()]);

  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content" className="anim-fade-in">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
          <header className="anim-fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">For CSC agents</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Register your center</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              People using this guide can ask for help in person. Add your center to the “Find help nearby” list so they can call or message you
              when they need assistance with a service.
            </p>
          </header>

          <div className="anim-fade-up stagger-2 mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md ring-1 ring-teal-900/5 sm:p-8">
              <RegisterAgentForm services={serviceOptions.data} servicesUnavailable={serviceOptions.error} />
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-b from-teal-50 to-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-teal-900">How review works</h2>
                <ol className="mt-2 space-y-2 text-sm leading-6 text-teal-900/80">
                  <li>1. You submit this form.</li>
                  <li>2. Your listing is saved as hidden.</li>
                  <li>3. An administrator checks the details.</li>
                  <li>4. Only then does it appear in search results.</li>
                </ol>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">What gets published</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  Center name, address, city, PIN code, phone number, and the WhatsApp number you provide.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-amber-900">Before you list</h2>
                <p className="mt-1.5 text-sm leading-6 text-amber-900/80">
                  This platform is an independent guide. It does not charge fees, collect payments, or share application data with centers.
                </p>
              </div>

              <p className="text-sm text-slate-600">
                Looking for a service?{" "}
                <Link href={`/services?lang=${languageCode}`} className="font-medium text-teal-800 underline underline-offset-4">
                  Browse the guide
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
