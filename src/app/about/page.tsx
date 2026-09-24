import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { LegalPage } from "@/components/legal-page";
import { aboutDoc } from "@/config/legal";

export const metadata: Metadata = {
  title: "About — GovGuide AI",
  description: aboutDoc.description,
};

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M10 2.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 2a1 1 0 0 1 1 1v.25a.75.75 0 0 0 1.5 0V5.5a2.5 2.5 0 0 0-2 2.45V9a1 1 0 1 0 0 2v.5a.75.75 0 0 0 1.5 0v-2.25A2.5 2.5 0 0 0 9 6.95V5.5a1 1 0 0 1 1-1Zm0 8a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { languages, languageCode } = await getPageLanguage((await searchParams).lang);
  return <SiteShell languages={languages} languageCode={languageCode}><LegalPage doc={aboutDoc} languageCode={languageCode} kicker="About us" icon={<InfoIcon />} /></SiteShell>;
}
