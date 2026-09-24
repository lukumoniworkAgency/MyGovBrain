import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { AiAssistant } from "@/components/ai-assistant";
import { Reveal } from "@/components/home/reveal";
import { HomeIcon } from "@/components/home/home-icon";
import { heroHighlights, heroStats, popularSearches } from "@/config/home";

/** Hero + stats + highlights. Server component; AI chat stays floating. */
export function HeroSection({ languageCode }: { languageCode: string }) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden border-b border-slate-200 bg-[#dfece8]"
    >
      <div
        className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-teal-700/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <Reveal>
          <p className="mb-4 text-xs font-bold tracking-[0.18em] text-teal-800 uppercase">
            Citizen Service Platform
          </p>
          <h1
            id="home-hero-heading"
            className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl"
          >
            <span className="gradient-text">
              One Platform For All Citizen Services
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 font-medium text-slate-700">
            Save Time. Save Money. Reduce Paperwork.
          </p>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Find clear information about government services and the official
            source behind each one.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-8 max-w-3xl">
            <SearchForm languageCode={languageCode} />
          </div>
          <div
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Popular searches"
          >
            {popularSearches.map((item) => (
              <Link
                key={item.label}
                href={`/services?lang=${languageCode}&q=${encodeURIComponent(item.query)}`}
                className="rounded-full border border-teal-700/20 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-teal-800 shadow-xs transition-all duration-200 hover:-translate-y-px hover:border-teal-700/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/services?lang=${languageCode}`}
              className="brand-gradient inline-flex h-12 items-center justify-center rounded-lg px-8 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px"
            >
              Get Started
            </Link>
            <Link
              href="#csc"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-8 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Find Nearby CSC
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {heroStats.map((stat, index) => (
            <Reveal key={stat.label} delay={Math.min(index, 3) * 0.06}>
              <p className="rounded-xl border border-slate-200/80 bg-white/80 p-5 text-center shadow-sm backdrop-blur">
                <span className="block text-2xl font-bold tracking-tight text-teal-800 sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs font-semibold tracking-widest text-slate-500 uppercase">
                  {stat.label}
                </span>
              </p>
            </Reveal>
          ))}
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroHighlights.map((item, index) => (
            <Reveal key={item.title} delay={Math.min(index, 3) * 0.06}>
              <li className="card-hover flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-teal-900/5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800">
                  <HomeIcon name={item.icon} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-600">
                    {item.description}
                  </span>
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
      <AiAssistant languageCode={languageCode} variant="floating" />
    </section>
  );
}
