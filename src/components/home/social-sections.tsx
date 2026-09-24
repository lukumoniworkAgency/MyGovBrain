"use client";

import { useState } from "react";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { faqs, testimonials } from "@/config/home";

/** Testimonials + FAQ accordion (details/summary, no JS needed). */
export function SocialSection() {
  return (
    <SectionShell id="stories" labelledBy="stories-heading">
      <SectionHeading
        id="stories-heading"
        kicker="Testimonials"
        title="Citizens who skipped the queue"
        lead="Real stories from first-time applicants and CSC visitors."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.map((story, index) => (
          <Reveal key={story.name} delay={Math.min(index, 2) * 0.06}>
            <figure className="card-hover flex h-full flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-teal-900/5">
              <div className="flex items-center gap-3">
                <span
                  className="brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                  aria-hidden="true"
                >
                  {story.initials}
                </span>
                <figcaption>
                  <p className="text-sm font-bold text-slate-900">
                    {story.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {story.location} · {story.service}
                  </p>
                </figcaption>
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                “{story.feedback}”
              </blockquote>
              <p
                className="mt-3 text-xs font-bold tracking-wide text-amber-500"
                aria-label="Rated 5 out of 5"
              >
                ★★★★★
              </p>
            </figure>
          </Reveal>
        ))}
      </div>
      <div className="mt-12">
        <SectionHeading
          id="faq-heading"
          kicker="FAQ"
          title="Questions, answered honestly"
        />
        <div className="mt-6 space-y-3" id="faq">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={Math.min(index, 4) * 0.04}>
              <details className="group rounded-xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-teal-900/5 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-slate-900 transition-colors hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700/10 text-teal-800 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/** Newsletter subscribe (mailto-free, client-side confirm). */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <SectionShell
      id="newsletter"
      labelledBy="newsletter-heading"
      className="pt-0"
    >
      <Reveal>
        <div className="brand-gradient overflow-hidden rounded-2xl p-6 shadow-lg sm:p-10">
          <p className="text-xs font-bold tracking-[0.18em] text-teal-100 uppercase">
            Newsletter
          </p>
          <h2
            id="newsletter-heading"
            className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Job updates, schemes & service alerts
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50">
            One short email a week. Govt jobs, scholarships, and new services —
            unsubscribe anytime.
          </p>
          {done ? (
            <p
              className="mt-5 rounded-xl bg-white/15 px-5 py-3.5 text-sm font-semibold text-white"
              role="status"
            >
              Thanks — you are on the list. Watch your inbox for the next
              update.
            </p>
          ) : (
            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                if (email.trim()) setDone(true);
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 min-w-0 flex-1 rounded-xl border border-white/25 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:shadow-[0_0_0_4px_rgba(255,255,255,0.25)]"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-teal-800 shadow-md transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </Reveal>
    </SectionShell>
  );
}
