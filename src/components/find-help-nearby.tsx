"use client";

/**
 * "Find help nearby" - matches the visitor with local CSC / agent centers that
 * offer the service shown on the page.
 *
 * Design notes:
 *   - One text input (city or PIN code). No maps and no geolocation: the
 *     visitor knows their own city, and this keeps the page usable on slow
 *     phones.
 *   - The lookup runs through a server action (src/lib/center-actions.ts), so
 *     the query and the input sanitising stay on the server.
 *   - Call and WhatsApp are real links (`<a href="tel:...">` and
 *     `<a href="https://wa.me/...">`), not window.open calls, because real links
 *     work with long-press, screen readers, and "open in a new tab".
 */

import Link from "next/link";
import { useState } from "react";
import { findHelpCenters, trackCenterContactClick } from "@/lib/center-actions";
import {
  buildCallLink,
  buildContactMessage,
  buildWhatsAppLink,
  centerMessages,
  formatPhoneForDisplay,
  type HelpCenter,
} from "@/lib/center-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trustCopy } from "@/config/content";

type SearchState = "idle" | "loading" | "done" | "error";

/**
 * Shared button classes. min-h-11 is 44px, the smallest comfortable tap target
 * on a phone. The two buttons stack on small screens and sit side by side from
 * the `sm` breakpoint up.
 */
const actionButtonClass =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold shadow-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:translate-y-px";

export function FindHelpNearby({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [location, setLocation] = useState("");
  const [centers, setCenters] = useState<HelpCenter[]>([]);
  const [searchedFor, setSearchedFor] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [message, setMessage] = useState("");

  // One pre-filled message, reused by every WhatsApp button on the page.
  const contactMessage = buildContactMessage(trustCopy.platformName, serviceName);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = location.trim();
    if (!query) {
      setState("error");
      setMessage(centerMessages.locationRequired);
      return;
    }

    setState("loading");
    setMessage("");
    const result = await findHelpCenters(serviceId, query);

    if (result.error) {
      setCenters([]);
      setState("error");
      setMessage(result.error);
      return;
    }

    setCenters(result.centers);
    setSearchedFor(query);
    setState("done");
  }

  /**
   * Conversion tracking. The request is deliberately not awaited: recording the
   * click must never delay the phone or WhatsApp app from opening. The server
   * action swallows its own errors for the same reason.
   */
  function handleContact(center: HelpCenter) {
    void trackCenterContactClick(center.id, serviceId);
  }

  return (
    <section aria-labelledby="find-help-nearby-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Prefer help in person?</p>
      <h2 id="find-help-nearby-heading" className="mt-2 text-2xl font-semibold">
        Find help nearby
      </h2>
      <p className="mt-3 leading-7 text-slate-600">
        Enter your city or PIN code to see local CSC centers that can help you with this service in person.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5">
        <label htmlFor="center-location" className="mb-1.5 block text-sm font-medium text-slate-700">
          Your city or PIN code
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="center-location"
            name="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Guwahati or 781001"
            autoComplete="address-level2"
            enterKeyHint="search"
            className="flex-1"
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={state === "error" && message ? "center-location-error" : "center-location-help"}
          />
          <Button type="submit" disabled={state === "loading"} className="sm:w-32">
            {state === "loading" ? "Searching..." : "Search"}
          </Button>
        </div>
        <p id="center-location-help" className="mt-2 text-xs text-slate-500">
          Only centers we have reviewed and verified are shown.
        </p>
      </form>

      {/* aria-live announces the outcome to screen readers without moving focus. */}
      <div className="mt-4" aria-live="polite">
        {state === "loading" && <p className="text-sm text-slate-500">Searching for centers near you...</p>}
        {state === "error" && message && (
          <p id="center-location-error" role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {message}
          </p>
        )}
      </div>

      {state === "done" &&
        (centers.length > 0 ? (
          <>
            <p className="mt-6 text-sm font-medium text-slate-600">
              {centers.length} {centers.length === 1 ? "center" : "centers"} can help with this service in “{searchedFor}”
            </p>
            <ul className="mt-4 space-y-4">
              {centers.map((center) => (
                <li key={center.id}>
                  <CenterCard center={center} contactMessage={contactMessage} onContact={handleContact} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-900">No centers found yet for “{searchedFor}”</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Try the self-guide above instead — the steps and documents listed there are the same ones a center would follow. You can also try a
              nearby city or another PIN code.
            </p>
            <Link
              href="/register-agent"
              className="mt-3 inline-block text-sm font-semibold text-teal-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Are you a CSC agent? Get your center listed
            </Link>
          </div>
        ))}
    </section>
  );
}

/**
 * One result card. It lives in this file because nothing else uses it.
 *
 * Both buttons fire onContact (the tracking call) without awaiting it, so the
 * link opens immediately.
 */
function CenterCard({
  center,
  contactMessage,
  onContact,
}: {
  center: HelpCenter;
  contactMessage: string;
  onContact: (center: HelpCenter) => void;
}) {
  return (
    <article className="card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-xs ring-1 ring-teal-900/5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{center.name}</h3>
        {center.verified && (
          <span className="inline-flex shrink-0 items-center rounded-full border border-teal-700/15 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
            Verified
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">{center.address}</p>
      <p className="mt-1 text-sm text-slate-500">
        {center.city} — PIN {center.pincode}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={buildCallLink(center.phone)}
          onClick={() => onContact(center)}
          className={`${actionButtonClass} brand-gradient text-white hover:shadow-lg hover:brightness-110`}
        >
          Call {formatPhoneForDisplay(center.phone)}
        </a>
        <a
          href={buildWhatsAppLink(center.whatsapp ?? center.phone, contactMessage)}
          onClick={() => onContact(center)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${actionButtonClass} border border-emerald-600/20 bg-emerald-50 text-emerald-900 hover:border-emerald-600/40 hover:bg-emerald-100`}
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
