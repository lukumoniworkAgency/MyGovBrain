import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { PageHeader } from "@/components/page-header";
import { VaultClient } from "@/components/vault/vault-client";

export const metadata: Metadata = { title: "Document Vault — GovGuide AI", description: "Store, organize, and retrieve your documents securely." };

export default async function VaultPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);
  return <SiteShell languages={languages} languageCode={languageCode}><main id="main-content" className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8"><PageHeader kicker="Document vault" title="Your papers, organized and ready" lead="Categorize Aadhaar, PAN, Voter ID, licenses, certificates, and marksheets with privacy-first controls." /><VaultClient /></main></SiteShell>;
}
