"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";

/**
 * CSC finder preview. Client-side because it filters a small sample + links
 * to the real per-service finder. No new routes: details reuse /services.
 */
export function CscSection({ languageCode }: { languageCode: string }) {
  const [filter, setFilter] = useState("");
  const centers = [
    {
      name: "Sharma Digital Seva Kendra",
      area: "Nagaon, Assam — 782001",
      rating: "4.8",
      distance: "0.8 km",
      services: ["PAN", "Aadhaar", "Income Certificate"],
      status: "Open now",
    },
    {
      name: "Verma CSC Point",
      area: "Patna, Bihar — 800001",
      rating: "4.7",
      distance: "1.2 km",
      services: ["Voter ID", "Scholarship", "Land Records"],
      status: "Open now",
    },
    {
      name: "Jan Seva Digital Center",
      area: "Jaipur, Rajasthan — 302001",
      rating: "4.9",
      distance: "2.1 km",
      services: ["Birth Certificate", "Pension", "Insurance"],
      status: "Closes 7 PM",
    },
  ];
  const visible = centers.filter(
    (center) =>
      !filter.trim() ||
      `${center.name} ${center.area}`
        .toLowerCase()
        .includes(filter.trim().toLowerCase()),
  );

  return (
    <SectionShell id="csc" labelledBy="csc-heading">
      <SectionHeading
        id="csc-heading"
        kicker="Find nearby CSC"
        title="Help around the corner"
        lead="Search by village, town, district, or PIN code. Verified centers show rating, distance, services, and live status."
      />
      <Reveal delay={0.08}>
        <form
          role="search"
          aria-label="Filter CSC centers"
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-md ring-1 ring-teal-900/5 sm:flex-row"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="csc-filter">
            Village, town, district or PIN code
          </label>
          <input
            id="csc-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Village, town, district or PIN code…"
            className="h-12 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-xs transition-all outline-none placeholder:text-slate-500 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]"
          />
          <span className="brand-gradient inline-flex min-h-12 items-center justify-center rounded-lg px-6 font-semibold text-white shadow-md">
            Search centers
          </span>
        </form>
      </Reveal>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {visible.map((center, index) => (
          <Reveal key={center.name} delay={Math.min(index, 2) * 0.06}>
            <li className="card-hover flex h-full flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-teal-900/5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {center.name}
                </h3>
                <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  {center.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{center.area}</p>
              <p className="mt-2 text-sm font-semibold text-slate-700">
                ★ {center.rating}{" "}
                <span className="font-normal text-slate-500">
                  · {center.distance}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {center.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-teal-700/15 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800"
                  >
                    {service}
                  </span>
                ))}
              </div>
              <Link
                href={`/services?lang=${languageCode}`}
                className="mt-4 inline-flex w-fit text-sm font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                View details →
              </Link>
            </li>
          </Reveal>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No sample centers match “{filter}”. Try a nearby town — or open any
          service page for the live verified finder.
        </p>
      ) : null}
      <Reveal delay={0.05}>
        <p className="mt-6 text-sm text-slate-600">
          Are you a CSC agent?{" "}
          <Link
            href={`/register-agent?lang=${languageCode}`}
            className="font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Get your center listed
          </Link>
        </p>
      </Reveal>
    </SectionShell>
  );
}
