import Link from "next/link";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { popularSearches } from "@/config/home";

/** Smart search band: deep-links into the existing /services directory. */
export function SearchBand({ languageCode }: { languageCode: string }) {
  const filters = [
    "All",
    "Identity",
    "Certificates",
    "Jobs",
    "Education",
    "Health",
  ];
  return (
    <SectionShell labelledBy="smart-search-heading" className="pt-12 sm:pt-16">
      <div className="overflow-hidden rounded-2xl border border-teal-700/15 bg-gradient-to-b from-teal-700 to-teal-800 p-6 shadow-lg sm:p-10">
        <SectionHeading
          id="smart-search-heading"
          kicker="Smart service search"
          title="What do you need help with today?"
        />
        <Reveal delay={0.08}>
          <form
            action="/services"
            method="get"
            className="mt-6 flex w-full flex-col gap-3 sm:flex-row"
            role="search"
          >
            <input type="hidden" name="lang" value={languageCode} />
            <label className="sr-only" htmlFor="home-smart-search">
              Search services, jobs, scholarships
            </label>
            <input
              id="home-smart-search"
              name="q"
              placeholder="Try PAN Card, Aadhaar Update, Scholarship…"
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-5 py-3.5 text-base text-slate-900 shadow-inner transition-all outline-none placeholder:text-slate-500 focus:border-white focus:shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-bold text-teal-800 shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-px"
            >
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-teal-100 uppercase">
              Popular:
            </span>
            {popularSearches.map((item) => (
              <Link
                key={item.label}
                href={`/services?lang=${languageCode}&q=${encodeURIComponent(item.query)}`}
                className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div
            className="mt-4 flex flex-wrap gap-2"
            aria-label="Category filters"
          >
            {filters.map((filter) => (
              <Link
                key={filter}
                href={
                  filter === "All"
                    ? `/services?lang=${languageCode}`
                    : `/services?lang=${languageCode}&q=${encodeURIComponent(filter)}`
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-50 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <HomeIcon name="Search" className="h-3.5 w-3.5" />
                {filter}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
