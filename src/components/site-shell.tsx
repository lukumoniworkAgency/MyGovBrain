import type { ReactNode } from "react";
import type { Language } from "@/lib/data";
import { Footer } from "@/components/footer";
import { NavBar } from "@/components/nav-bar";

export function SiteShell({ children, languages, languageCode }: { children: ReactNode; languages: Language[]; languageCode: string }) {
  return <div className="min-h-screen bg-[#f4f7f6] text-slate-900">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <NavBar languages={languages} languageCode={languageCode} />
    {children}
    <Footer languages={languages} languageCode={languageCode} />
  </div>;
}
