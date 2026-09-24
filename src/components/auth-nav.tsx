"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

interface AuthNavProps {
  languageCode: string;
  variant?: "desktop" | "mobile";
}

/**
 * Authentication entry point for the navigation. Renders a "Sign in" link for
 * anonymous visitors and a "Sign out" button once a session exists, keeping
 * the state in sync with AuthProvider.
 */
export function AuthNav({ languageCode, variant = "desktop" }: AuthNavProps) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    // Reserve space to avoid layout shift while the session resolves
    return <span className={variant === "desktop" ? "inline-block min-h-11 min-w-16" : "block min-h-11"} aria-hidden="true" />;
  }

  if (user) {
    return variant === "mobile" ? (
      <button
        type="button"
        onClick={signOut}
        className="block w-full min-h-11 rounded-md px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Sign out
      </button>
    ) : (
      <button
        type="button"
        onClick={signOut}
        className="min-h-11 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 transition-colors"
      >
        Sign out
      </button>
    );
  }

  return variant === "mobile" ? (
    <Link
      href={`/auth?lang=${languageCode}`}
      className="block min-h-11 rounded-md px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
    >
      Sign in
    </Link>
  ) : (
    <Link
      href={`/auth?lang=${languageCode}`}
      className="min-h-11 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 transition-colors"
    >
      Sign in
    </Link>
  );
}
