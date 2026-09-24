import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { faqs } from "@/config/home";

export const metadata: Metadata = {
  title: "Help Center — GovGuide AI",
  description: "FAQs, step-by-step service guides, and tutorials for GovGuide AI.",
};

const tutorials = [
  { title: "Search a service in seconds", description: "Use the smart search band or category chips to jump straight to any government service.", icon: "Search" },
  { title: "Find a verified CSC near you", description: "Filter centers by village, town, district, or PIN code, then call or get directions.", icon: "MapPin" },
  { title: "Track your application", description: "Save a service to My Services and follow the five-stage timeline to completion.", icon: "ClipboardCheck" },
  { title: "Ask the AI assistant first", description: "Check eligibility, documents, fees, and processing time before you leave home.", icon: "Compass" },
];

const guides = [
  { title: "PAN Card guide", description: "New PAN, corrections, and reprint — documents, fees, and official links.", query: "PAN" },
  { title: "Aadhaar update guide", description: "Mobile number & address updates at enrolment centers.", query: "Aadhaar" },
  { title: "Income Certificate guide", description: "State portal steps, affidavit format, and verification.", query: "Income Certificate" },
  { title: "Scholarship (NSP) guide", description: "Pre/post-matric applications, deadlines, and DBT status.", query: "Scholarship" },
];

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);

  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content">
        <SectionShell labelledBy="help-heading" className="pt-10 sm:pt-14">
          <SectionHeading
            id="help-heading"
            kicker="Help center"
            title="How can we help?"
            lead="FAQs, tutorials, and service guides — everything you need to get unstuck fast."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {tutorials.map((item, index) => (
              <Reveal key={item.title} delay={Math.min(index, 3) * 0.05}>
                <div className="card-hover h-full rounded-xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-teal-900/5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800">
                    <HomeIcon name={item.icon} />
                  </span>
                  <h2 className="mt-4 text-base font-bold text-slate-900">{item.title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Service guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {guides.map((guide) => (
              <a
                key={guide.title}
                href={`/services?q=${encodeURIComponent(guide.query)}&lang=${languageCode}`}
                className="card-hover rounded-xl border border-slate-200/80 bg-[#f4f7f6] p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <span className="block text-sm font-bold text-slate-900">{guide.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{guide.description}</span>
              </a>
            ))}
          </div>

          <h2 className="mt-12 text-xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-xl border border-slate-200/80 bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-slate-900 hover:text-teal-800 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700/10 text-teal-800 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-2xl brand-gradient p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Still stuck?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50">
              Our support team replies within one business day. Include your service name and state for a faster answer.
            </p>
            <a
              href={`/contact?lang=${languageCode}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-bold text-teal-800 shadow-md transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Contact support
            </a>
          </div>
        </SectionShell>
      </main>
    </SiteShell>
  );
}
