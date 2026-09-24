import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { centerPreviews } from "@/config/csc";

import { getPageLanguage } from "@/lib/language";
export const metadata: Metadata = {
  title: "Find a CSC Center — GovGuide",
  description: "Find verified Citizen Service Centers near you.",
};
const centers = centerPreviews;
export default async function CscPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { languages, languageCode } = await getPageLanguage(
    (await searchParams).lang,
  );
  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content">
        <PageHeader
          kicker="Citizen Service Centers"
          title="Find help nearby"
          lead="Search by village, town, district, or PIN code. Center records below are preview data until the public directory API is connected."
        />
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
            <input
              className="min-h-11 rounded-md border border-slate-300 px-3"
              placeholder="Enter village, town, district, or PIN code"
              aria-label="Location"
            />
            <button className="rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white">
              Search centers
            </button>
          </form>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {centers.map((center) => (
              <article
                key={center.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{center.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {center.address}
                    </p>
                  </div>
                  <span
                    className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${center.status === "Open" ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-600"}`}
                  >
                    {center.status}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-blue-700">
                  ★ {center.rating} · {center.distance}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {center.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                    >
                      {service}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/csc/${center.id}`}
                    className="text-sm font-semibold text-teal-800 underline underline-offset-4"
                  >
                    View details
                  </Link>
                  <a
                    href="tel:+911234567890"
                    className="text-sm font-semibold text-slate-700 underline underline-offset-4"
                  >
                    Call center
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
