import Link from "next/link";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { howItWorks, whyChooseUs } from "@/config/home";

/** Benefits + 3-step process. Keeps the legacy #how-it-works anchor. */
export function WhyHowSection({ languageCode }: { languageCode: string }) {
  return (
    <SectionShell
      id="why"
      labelledBy="why-heading"
      className="border-t border-slate-200/70 bg-white"
    >
      <SectionHeading
        id="why-heading"
        kicker="Why choose us"
        title="Built to save time, money, paperwork"
        lead="Everything a first-time applicant needs — guidance, nearby help, tracking, and reminders."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {whyChooseUs.map((item, index) => (
          <Reveal key={item.title} delay={Math.min(index, 5) * 0.05}>
            <div className="card-hover h-full rounded-xl border border-slate-200/80 bg-[#f4f7f6] p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-800 shadow-sm ring-1 ring-teal-900/10">
                <HomeIcon name={item.icon} />
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <div
        className="mt-12 rounded-2xl border border-teal-700/15 bg-gradient-to-b from-teal-50 to-white p-6 sm:p-8"
        id="how-it-works"
      >
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          How it works — three steps
        </h3>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {howItWorks.map((step, index) => (
            <Reveal key={step.title} delay={Math.min(index, 2) * 0.06}>
              <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md">
                  <HomeIcon name={step.icon} className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-bold tracking-widest text-teal-700 uppercase">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal delay={0.08}>
          <Link
            href={`/services?lang=${languageCode}`}
            className="brand-gradient mt-6 inline-flex rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Get started →
          </Link>
        </Reveal>
      </div>
    </SectionShell>
  );
}
