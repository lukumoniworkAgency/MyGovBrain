"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Circle,
  HelpCircle,
  Home,
  LayoutGrid,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Language } from "@/lib/data";
import { EasyModeToggle } from "@/components/easy-mode-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { AuthNav } from "@/components/auth-nav";
import { MobileMenu } from "@/components/mobile-menu";
import { trustCopy } from "@/config/content";

interface NavBarProps {
  languages: Language[];
  languageCode: string;
}

interface NavItem {
  label: string;
  /** Path plus optional hash. `?lang=` is appended at render time. */
  href: string;
  icon: typeof Home;
  /** True when the link should be announced as the current page. */
  isCurrent: (pathname: string) => boolean;
}

/**
 * Primary destinations. Hash targets exist as real section ids on the home
 * page (see src/app/page.tsx) so the nav never points at a dead anchor.
 */
const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: Home, isCurrent: (pathname) => pathname === "/" },
  {
    label: "Services",
    href: "/services",
    icon: LayoutGrid,
    isCurrent: (pathname) => pathname.startsWith("/services"),
  },
  { label: "How It Works", href: "/#how-it-works", icon: HelpCircle, isCurrent: () => false },
  { label: "Categories", href: "/#categories", icon: Circle, isCurrent: () => false },
];

/** Keeps the language query string while preserving any section hash. */
function buildHref(item: NavItem, languageCode: string) {
  const [path, hash] = item.href.split("#");
  const withLanguage = `${path}?lang=${languageCode}`;
  return hash ? `${withLanguage}#${hash}` : withLanguage;
}

function NavLink({
  item,
  languageCode,
  pathname,
}: {
  item: NavItem;
  languageCode: string;
  pathname: string;
}) {
  const isCurrent = item.isCurrent(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={buildHref(item, languageCode)}
      aria-current={isCurrent ? "page" : undefined}
      className={`group relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
        isCurrent
          ? "bg-white text-teal-800 shadow-sm ring-1 ring-teal-900/10"
          : "text-slate-600 hover:bg-white/70 hover:text-teal-800"
      }`}
    >
      <Icon
        className={`h-4 w-4 transition-colors duration-200 ${
          isCurrent ? "text-teal-700" : "text-slate-400 group-hover:text-teal-700"
        }`}
        aria-hidden="true"
      />
      <span className="relative">
        {item.label}
        <span
          aria-hidden="true"
          className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-gradient-to-r from-teal-700 to-teal-500 transition-all duration-300 ${
            isCurrent ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </span>
    </Link>
  );
}

export function NavBar({ languages, languageCode }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname() ?? "/";

  // Elevate the shell and drive the reading-progress hairline while scrolling.
  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 6);
      setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Navigating away should never leave the sheet open behind the new page.
  // Adjusting during render (rather than in an effect) avoids a cascading
  // re-render, per https://react.dev/learn/you-might-not-need-an-effect.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      {/* Trust bar — a slim credibility strip above the main navigation */}
      <div className="relative z-50 border-b border-slate-200/60 bg-[#eef4f2]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-1.5 sm:px-8">
          <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium tracking-wide text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden="true" />
            <span className="truncate">{trustCopy.platformTagline}</span>
          </p>
          <nav aria-label="Trust links" className="flex shrink-0 items-center gap-4">
            <Link
              href={`/about?lang=${languageCode}`}
              className="text-[11px] font-semibold tracking-wide text-slate-500 transition-colors duration-200 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              About
            </Link>
            <Link
              href={`/contact?lang=${languageCode}`}
              className="text-[11px] font-semibold tracking-wide text-slate-500 transition-colors duration-200 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Contact
            </Link>
            <Link
              href={`/register-agent?lang=${languageCode}`}
              className="hidden text-[11px] font-semibold tracking-wide text-teal-700 transition-colors duration-200 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:inline-flex"
            >
              {trustCopy.quickLinks.registerCenter}
            </Link>
          </nav>
        </div>
      </div>

      {/* Main navigation shell */}
      <header
        className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled
            ? "glass border-slate-200/70 shadow-[0_10px_30px_-12px_rgba(18,85,79,0.25)]"
            : "border-slate-200/50 bg-white/95 backdrop-blur-md"
        }`}
      >
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
          {/* Brand lockup */}
          <Link
            href={`/?lang=${languageCode}`}
            aria-label={`${trustCopy.platformName} home`}
            className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl brand-gradient shadow-md shadow-teal-900/20 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#f4b942]"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[17px] font-bold tracking-tight text-slate-900">
                GovGuide <span className="gradient-text">AI</span>
              </span>
              <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Service guidance
              </span>
            </span>
          </Link>

          {/* Desktop navigation — a floating pill for a premium, grouped feel.
              Below xl it folds into the sheet so the bar never crowds. */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 rounded-2xl border border-slate-200/60 bg-white/60 p-1 shadow-xs xl:flex"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink key={item.label} item={item} languageCode={languageCode} pathname={pathname} />
            ))}
          </nav>

          {/* Utility cluster */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href={`/services?lang=${languageCode}`}
              aria-label="Search services"
              title="Search services"
              className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-500 shadow-xs transition-all duration-200 hover:border-teal-700/30 hover:bg-white hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:inline-flex"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href={`/my-services?lang=${languageCode}`}
              aria-current={pathname.startsWith("/my-services") ? "page" : undefined}
              aria-label="My Services"
              title="My Services"
              className={`hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:inline-flex ${
                pathname.startsWith("/my-services")
                  ? "bg-white text-teal-800 shadow-sm ring-1 ring-teal-900/10"
                  : "text-slate-600 hover:bg-white/70 hover:text-teal-800"
              }`}
            >
              <Bookmark className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">My Services</span>
            </Link>

            <AuthNav languageCode={languageCode} />

            <span aria-hidden="true" className="hidden h-6 w-px bg-slate-200 xl:block" />

            {/* Secondary controls: compact below 2xl, labelled from 2xl up.
                Below xl they live in the sheet, which stays reachable until 2xl. */}
            <div className="hidden items-center gap-2 xl:flex">
              <EasyModeToggle variant="icon" />
              <LanguageSelector languages={languages} value={languageCode} />
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-xs transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-95 xl:hidden ${
                menuOpen
                  ? "border-teal-700/30 bg-white text-teal-800"
                  : "border-slate-200/80 bg-white/70 text-slate-600 hover:border-teal-700/30 hover:bg-white hover:text-teal-800"
              }`}
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Reading-progress hairline — a quiet premium flourish */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <div
            className="h-full origin-left bg-gradient-to-r from-teal-700 via-teal-500 to-teal-700 transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        languageCode={languageCode}
        languages={languages}
      />
    </>
  );
}