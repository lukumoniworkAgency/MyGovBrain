import Link from "next/link";
import type { LegalDoc } from "@/config/legal";

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface LegalPageProps {
  doc: LegalDoc;
  languageCode: string;
  /** Section label shown above the title (each page passes its own). */
  kicker?: string;
  /** Decorative icon shown beside the kicker (each page passes its own). */
  icon?: React.ReactNode;
  /** Extra content rendered above the sections (e.g. contact form). */
  children?: React.ReactNode;
}

export function LegalPage({ doc, languageCode, kicker = "Legal", icon, children }: LegalPageProps) {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-14 anim-fade-up sm:px-8">
      <div className="flex items-center gap-2.5">
        {icon ? (
          <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-white shadow-xs">
            {icon}
          </span>
        ) : null}
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">{kicker}</p>
      </div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{doc.title}</h1>
      <p className="mt-3 text-sm text-slate-500">Last updated {doc.updated}</p>

      {languageCode !== "en" && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-xs">
          This document is currently available in English only. The rest of the site remains available in your
          selected language.
        </p>
      )}

      <p className="mt-6 text-lg leading-8 text-slate-600">{doc.intro}</p>

      {/* Table of contents */}
      <nav aria-label="On this page" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ring-1 ring-teal-900/5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700">On this page</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
          {doc.sections.map((section, index) => (
            <li key={section.heading}>
              <a
                href={`#${slugify(section.heading)}`}
                className="inline-block min-h-11 py-1.5 text-sm text-slate-600 underline-offset-4 transition-colors hover:text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {index + 1}. {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {children}

      {/* Sections */}
      <div className="mt-10 space-y-9">
        {doc.sections.map((section, index) => (
          <section key={section.heading} id={slugify(section.heading)} className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white shadow-xs align-middle">
                {index + 1}
              </span>
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-7 text-slate-600">
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul className="mt-4 space-y-2.5">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-slate-600 leading-7">
                    <svg className="mt-1.5 h-4 w-4 shrink-0 text-teal-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Contact prompt */}
      <div className="mt-12 rounded-2xl brand-gradient p-6 text-white shadow-lg">
        <h2 className="text-lg font-semibold">Still have questions?</h2>
        <p className="mt-1 text-sm text-white/85">
          We are an independent platform — for official matters, always use the official source listed on each
          service page.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/contact?lang=${languageCode}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-semibold text-teal-800 shadow-md transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact us
          </Link>
          <Link
            href={`/services?lang=${languageCode}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-white/40 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Browse services
          </Link>
        </div>
      </div>
    </main>
  );
}
