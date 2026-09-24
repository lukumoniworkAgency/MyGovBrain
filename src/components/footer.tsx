import Link from "next/link";
import type { Language } from "@/lib/data";
import { trustCopy } from "@/config/content";

interface FooterProps {
  languages: Language[];
  languageCode: string;
}

export function Footer({ languages, languageCode }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-slate-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {/* Brand & about */}
        <div className="space-y-4">
          <Link
            href={`/?lang=${languageCode}`}
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-teal-400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {trustCopy.platformName}
          </Link>
          <p className="text-sm font-medium text-teal-300">{trustCopy.platformTagline}</p>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">{trustCopy.aboutDescription}</p>
        </div>

        {/* Quick links */}
        <nav aria-label="Quick links">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-300">Quick links</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href={`/services?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.quickLinks.services}
              </Link>
            </li>
            <li>
              <Link href={`/my-services?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.quickLinks.myServices}
              </Link>
            </li>
            <li>
              <Link href={`/services?lang=${languageCode}#categories`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.quickLinks.categories}
              </Link>
            </li>
            <li>
              <Link href={`/auth?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                Sign in
              </Link>
            </li>
            <li>
              <Link href={`/register-agent?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.quickLinks.registerCenter}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer links */}
        <nav aria-label="Footer links">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-300">Company</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href={`/about?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.footerLinks.about}
              </Link>
            </li>
            <li>
              <Link href={`/privacy?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.footerLinks.privacy}
              </Link>
            </li>
            <li>
              <Link href={`/terms?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.footerLinks.terms}
              </Link>
            </li>
            <li>
              <Link href={`/contact?lang=${languageCode}`} className="text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500">
                {trustCopy.footerLinks.contact}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Important notes */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-300">Important notes</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
            <li>{trustCopy.independentDisclaimer}</li>
            <li>{trustCopy.officialSourceNote}</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Available languages">
            {languages.map((language) => (
              <li key={language.id}>
                <Link
                  href={`/?lang=${language.code}`}
                  aria-current={language.code === languageCode ? "true" : undefined}
                  className={`text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 ${
                    language.code === languageCode ? "font-semibold text-teal-300" : "text-white/60 hover:text-white"
                  }`}
                >
                  {language.native_name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-white/60">
            {trustCopy.copyright.replace("{year}", String(year))}
          </p>
        </div>
      </div>
    </footer>
  );
}
