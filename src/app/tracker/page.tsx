import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { PageHeader } from "@/components/page-header";
import { TrackerClient } from "@/components/tracker/tracker-client";

export const metadata: Metadata = { title: "Application Tracker — GovGuide AI", description: "Track every submitted application with a five-stage timeline and receipts." };

export default async function TrackerPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);
  return <SiteShell languages={languages} languageCode={languageCode}><main id="main-content" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8"><PageHeader kicker="Application tracker" title="Every request, one timeline" lead="Counts by status, a five-stage timeline for each application, search and filters, and downloadable receipts." /><TrackerClient /></main></SiteShell>;
}
