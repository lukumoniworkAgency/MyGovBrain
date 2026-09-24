import Link from "next/link";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";

/** App download band with QR placeholder (no new assets). */
export function AppSection({ languageCode }: { languageCode: string }) {
  return (
    <SectionShell id="app" labelledBy="app-heading" className="pt-0">
      <div className="grid items-center gap-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md ring-1 ring-teal-900/5 sm:p-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="app-heading"
            kicker="Mobile app"
            title="GovGuide in your pocket"
            lead="Save services, get job alerts, and open checklists offline. Coming soon to Android and iOS."
          />
          <Reveal delay={0.08}>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/contact?lang=${languageCode}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <HomeIcon name="Smartphone" className="h-4 w-4" />
                Google Play — notify me
              </Link>
              <Link
                href={`/contact?lang=${languageCode}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 shadow-sm transition-all hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <HomeIcon name="Smartphone" className="h-4 w-4" />
                App Store — notify me
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="mx-auto flex max-w-sm items-center gap-5 rounded-2xl bg-[#f4f7f6] p-6">
            <div
              className="grid h-32 w-32 shrink-0 place-items-center rounded-xl border-2 border-dashed border-teal-700/30 bg-white text-center"
              role="img"
              aria-label="QR code placeholder — app link coming soon"
            >
              <span className="px-2 text-[11px] font-bold tracking-widest text-teal-700 uppercase">
                QR code soon
              </span>
            </div>
            <div
              className="mx-auto h-56 w-28 overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-lg"
              role="img"
              aria-label="Phone preview of the GovGuide app home"
            >
              <div className="brand-gradient px-3 py-2.5 text-[10px] font-bold text-white">
                GovGuide AI
              </div>
              <div className="space-y-2 p-3">
                <div
                  className="h-8 rounded-lg bg-teal-700/10"
                  aria-hidden="true"
                />
                <div
                  className="h-8 rounded-lg bg-slate-100"
                  aria-hidden="true"
                />
                <div
                  className="h-8 rounded-lg bg-slate-100"
                  aria-hidden="true"
                />
                <div
                  className="brand-gradient h-8 rounded-lg"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/** Final CTA reusing existing routes only. */
export function CtaSection({ languageCode }: { languageCode: string }) {
  return (
    <SectionShell labelledBy="cta-heading" className="pt-0">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            <span className="gradient-text">Ready to find what you need?</span>
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Search the directory of government services or browse by category.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={`/services?lang=${languageCode}`}
              className="brand-gradient inline-flex h-12 w-full items-center justify-center rounded-lg px-8 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px"
            >
              Browse all services
            </Link>
            <Link
              href={`/my-services?lang=${languageCode}`}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-8 text-base font-medium text-slate-700 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              My saved services
            </Link>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
