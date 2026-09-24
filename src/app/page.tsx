import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getCategories } from "@/lib/data";
import { getPageLanguage } from "@/lib/language";
import { HeroSection } from "@/components/home/hero-section";
import { SearchBand } from "@/components/home/search-band";
import { CategoriesSection } from "@/components/home/categories-section";
import { PopularServicesSection } from "@/components/home/popular-services-section";
import { CscSection } from "@/components/home/csc-section";
import { AiSection } from "@/components/home/ai-section";
import { TrackingSection } from "@/components/home/tracking-section";
import { VaultSection } from "@/components/home/vault-section";
import { JobsSection } from "@/components/home/jobs-section";
import { WhyHowSection } from "@/components/home/why-how-section";
import {
  NewsletterSection,
  SocialSection,
} from "@/components/home/social-sections";
import { AppSection, CtaSection } from "@/components/home/closing-sections";
import { organizationSchema } from "@/config/home";

export const metadata: Metadata = {
  title: "GovGuide AI — One Platform For All Citizen Services",
  description:
    "Save Time. Save Money. Reduce Paperwork. Find government services, CSC centers, jobs, scholarships, AI guidance, tracking, and document checklists.",
  keywords: [
    "government services",
    "CSC",
    "PAN card",
    "Aadhaar",
    "scholarship",
    "government jobs",
    "income certificate",
  ],
  openGraph: {
    title: "GovGuide AI — One Platform For All Citizen Services",
    description:
      "Save Time. Save Money. Reduce Paperwork. Guidance, CSC centers, jobs, AI help, tracking & documents.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GovGuide AI — One Platform For All Citizen Services",
    description: "Save Time. Save Money. Reduce Paperwork.",
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const [{ languages, languageCode }, categoriesResult] = await Promise.all([
    getPageLanguage(params.lang),
    getCategories(),
  ]);

  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <main id="main-content">
        <HeroSection languageCode={languageCode} />
        <SearchBand languageCode={languageCode} />
        <CategoriesSection
          categories={categoriesResult.data}
          languageCode={languageCode}
        />
        <CscSection languageCode={languageCode} />
        <PopularServicesSection languageCode={languageCode} />
        <AiSection />
        <TrackingSection languageCode={languageCode} />
        <VaultSection languageCode={languageCode} />
        <JobsSection languageCode={languageCode} />
        <WhyHowSection languageCode={languageCode} />
        <SocialSection />
        <AppSection languageCode={languageCode} />
        <NewsletterSection />
        <CtaSection languageCode={languageCode} />
      </main>
    </SiteShell>
  );
}
