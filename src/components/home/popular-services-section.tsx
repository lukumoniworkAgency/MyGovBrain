import Link from "next/link";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { popularServices } from "@/config/home";

/** Popular services grid — every card deep-links into /services search. */
export function PopularServicesSection({
  languageCode,
}: {
  languageCode: string;
}) {
  return (
    <SectionShell
      id="services"
      labelledBy="popular-services-heading"
      className="border-t border-slate-200/70 bg-white"
    >
      <SectionHeading
        id="popular-services-heading"
        kicker="Popular services"
        title="Most requested right now"
        lead="Real services citizens search for daily, with realistic processing estimates."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {popularServices.map((service, index) => (
          <Reveal key={service.title} delay={Math.min(index, 7) * 0.05}>
            <article className="card-hover flex h-full flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-teal-900/5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800">
                <HomeIcon name={service.icon} />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {service.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-600">
                {service.description}
              </p>
              <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                <HomeIcon name="Timer" className="h-3.5 w-3.5" />
                {service.time}
              </p>
              <Link
                href={`/services?lang=${languageCode}&q=${encodeURIComponent(service.query)}`}
                className="brand-gradient mt-4 inline-flex w-fit rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px"
              >
                View service
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
