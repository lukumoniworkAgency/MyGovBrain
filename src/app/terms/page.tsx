import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { LegalPage } from "@/components/legal-page";
import { termsOfService } from "@/config/legal";

export const metadata: Metadata = {
  title: "Terms of Service — GovGuide AI",
  description: termsOfService.description,
};

function DocCheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M5 2.5A1.5 1.5 0 0 0 3.5 4v12A1.5 1.5 0 0 0 5 17.5h10a1.5 1.5 0 0 0 1.5-1.5V6.6L11.4 2.5H5Zm6 1.94L13.56 6.5H11V4.44ZM6 9a.75.75 0 0 1 .75-.75h6.5A.75.75 0 0 1 14 9v2a.75.75 0 0 1-.75.75h-6.5A.75.75 0 0 1 6 11V9Z" clipRule="evenodd" />
    </svg>
  );
}

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { languages, languageCode } = await getPageLanguage((await searchParams).lang);
  return <SiteShell languages={languages} languageCode={languageCode}><LegalPage doc={termsOfService} languageCode={languageCode} kicker="The rules" icon={<DocCheckIcon />} /></SiteShell>;
}
