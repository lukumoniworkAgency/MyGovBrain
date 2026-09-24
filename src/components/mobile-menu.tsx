"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  HelpCircle,
  Home,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { Language } from "@/lib/data";
import { AuthNav } from "@/components/auth-nav";
import { EasyModeToggle } from "@/components/easy-mode-toggle";
import { trustCopy } from "@/config/content";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  languageCode: string;
  languages: Language[];
}

interface MobileNavItem {
  label: string;
  href: string;
  icon: typeof Home;
  description: string;
  /** True when the destination should be announced as the current page. */
  isCurrent: (pathname: string) => boolean;
}

const NAV_ITEMS: MobileNavItem[] = [
  { label: "Home", href: "/", icon: Home, description: "Start here", isCurrent: (p) => p === "/" },
  {
    label: "Services",
    href: "/services",
    icon: LayoutGrid,
    description: "Browse every scheme",
    isCurrent: (p) => p.startsWith("/services"),
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
    icon: HelpCircle,
    description: "Four simple steps",
    isCurrent: () => false,
  },
  {
    label: "Categories",
    href: "/#categories",
    icon: Compass,
    description: "Filter by life event",
    isCurrent: () => false,
  },
  {
    label: "My Services",
    href: "/my-services",
    icon: Bookmark,
    description: "Your saved shortlist",
    isCurrent: (p) => p.startsWith("/my-services"),
  },
];

/** Keeps the language query string while preserving any section hash. */
function buildHref(href: string, languageCode: string) {
  const [path, hash] = href.split("#");
  const withLanguage = `${path}?lang=${languageCode}`;
  return hash ? `${withLanguage}#${hash}` : withLanguage;
}



export function MobileMenu({ isOpen, onClose, languageCode, languages }: MobileMenuProps) {
  const pathname = usePathname() ?? "/";
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes the sheet, body scroll is locked, and focus moves into the
  // dialog so keyboard and screen-reader users land somewhere meaningful.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentLanguage = languages.find((language) => language.code === languageCode);

  return (
    <div className="fixed inset-0 z-[80] xl:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-md anim-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        id="mobile-menu"
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-[22rem] flex-col overflow-hidden bg-white shadow-2xl outline-none anim-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-5 py-3.5 backdrop-blur-xl">
          <Link
            href={`/?lang=${languageCode}`}
            onClick={onClose}
            className="group flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl brand-gradient shadow-md shadow-teal-900/20 ring-1 ring-inset ring-white/25">
              <Sparkles className="h-[18px] w-[18px] text-white" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="gradient-text text-base font-extrabold tracking-tight">
                {trustCopy.platformName}
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {trustCopy.platformTagline}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-500 shadow-xs transition-all duration-200 hover:border-teal-700/30 hover:bg-white hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-95"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>


        {/* Body */}
        <nav
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto overscroll-contain px-3.5 py-5"
        >
          <p className="px-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Navigate
          </p>
          <ul className="mt-2.5 space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const isCurrent = item.isCurrent(pathname);
              const Icon = item.icon;

              return (
                <li
                  key={item.label}
                  className={`anim-fade-up stagger-${Math.min(index + 1, 5)}`}
                >
                  <Link
                    href={buildHref(item.href, languageCode)}
                    onClick={onClose}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-2 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                      isCurrent
                        ? "bg-teal-50/80 ring-1 ring-inset ring-teal-700/15"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {isCurrent ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full brand-gradient"
                      />
                    ) : null}
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                        isCurrent
                          ? "brand-gradient text-white shadow-sm shadow-teal-900/20"
                          : "bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-700"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span
                        className={`text-[15px] font-semibold tracking-tight ${
                          isCurrent ? "text-teal-800" : "text-slate-700"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="truncate text-xs text-slate-400">{item.description}</span>
                    </span>
                    <ChevronRight
                      className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                        isCurrent ? "text-teal-600" : "text-slate-300"
                      }`}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>


          {/* Account */}
          <div className="mt-6 border-t border-slate-200/70 px-2.5 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Account
            </p>
            <div className="mt-2.5">
              <AuthNav languageCode={languageCode} variant="mobile" />
            </div>
          </div>

          {/* Language */}
          <div className="mt-6 border-t border-slate-200/70 px-2.5 pt-5">
            <p className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              <span>Language</span>
              <span className="font-semibold normal-case tracking-normal text-teal-700">
                {currentLanguage?.native_name ?? "English"}
              </span>
            </p>
            <ul className="mt-2.5 grid grid-cols-2 gap-2">
              {languages.map((language) => {
                const isActive = language.code === languageCode;

                return (
                  <li key={language.id}>
                    <Link
                      href={`/?lang=${language.code}`}
                      onClick={onClose}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.98] ${
                        isActive
                          ? "border-transparent brand-gradient text-white shadow-md shadow-teal-900/15"
                          : "border-slate-200/80 bg-white text-slate-600 hover:border-teal-700/30 hover:text-teal-800"
                      }`}
                    >
                      <span className="truncate">{language.native_name}</span>
                      {isActive ? (
                        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Accessibility utilities */}
          <div className="mt-6 border-t border-slate-200/70 px-2.5 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Accessibility
            </p>
            <div className="mt-2.5">
              <EasyModeToggle />
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200/70 bg-[#f8faf9] px-5 py-4">
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden="true" />
            <span>{trustCopy.independentDisclaimer}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
