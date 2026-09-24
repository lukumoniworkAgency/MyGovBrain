import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";
import { NotificationsCenter } from "@/components/notifications/notifications-center";

export const metadata: Metadata = {
  title: "Notifications — GovGuide AI",
  description: "Job updates, application status, scholarship alerts, and government scheme updates in one place.",
};

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);

  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content" className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 py-12 sm:px-8 sm:py-16">
        <NotificationsCenter languageCode={languageCode} />
      </main>
    </SiteShell>
  );
}
