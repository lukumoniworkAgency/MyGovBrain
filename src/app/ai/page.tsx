import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { AiAssistant } from "@/components/ai-assistant";
import { getPageLanguage } from "@/lib/language";
import { Reveal } from "@/components/home/reveal";

export const metadata: Metadata = {
  title: "Ask AI — GovGuide AI",
  description: "Ask about eligibility, required documents, fees, and processing time before visiting any government office.",
};

const suggested = [
  "How to apply for PAN Card?",
  "How to get Income Certificate?",
  "What documents are needed for Scholarship?",
];

export default async function AiPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);

  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content" className="mx-auto w-full max-w-4xl scroll-mt-28 px-5 py-12 sm:px-8 sm:py-16">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">AI assistant</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ask AI before visiting any office
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Eligibility checks, document checklists, fees, and processing-time estimates — answered from verified
            service records with official sources. Free to use.
          </p>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Suggested questions">
            {suggested.map((question) => (
              <span
                key={question}
                className="rounded-full border border-teal-700/20 bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-800"
              >
                {question}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-8">
            <AiAssistant languageCode={languageCode} />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            GovGuide AI is an independent guidance assistant — not a government authority. It never asks for Aadhaar,
            PAN, bank, or password details, and official fees are only ever paid on government portals.
          </div>
        </Reveal>
      </main>
    </SiteShell>
  );
}
