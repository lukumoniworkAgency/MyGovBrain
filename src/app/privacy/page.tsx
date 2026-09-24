import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { LegalPage } from "@/components/legal-page";
import { privacyPolicy } from "@/config/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — GovGuide AI",
  description: privacyPolicy.description,
};

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1.5 3.5 4v4.2c0 4 2.7 7.7 6.5 8.8 3.8-1.1 6.5-4.8 6.5-8.8V4L10 1.5Zm0 4a1.75 1.75 0 0 1 1.75 1.75v1.5h1.5A.75.75 0 0 1 14 9.5v4a.75.75 0 0 1-.75.75h-6.5A.75.75 0 0 1 6 13.5v-4a.75.75 0 0 1 .75-.75h1.5v-1.5A1.75 1.75 0 0 1 10 5.5Z" clipRule="evenodd" />
    </svg>
  );
}

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { languages, languageCode } = await getPageLanguage((await searchParams).lang);
  return <SiteShell languages={languages} languageCode={languageCode}><LegalPage doc={privacyPolicy} languageCode={languageCode} kicker="Your data" icon={<ShieldIcon />} /></SiteShell>;
}
