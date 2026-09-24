"use client";

/**
 * Public self-registration form for CSC agents.
 *
 * Flow:
 *   1. The browser validates the draft so the visitor gets instant feedback.
 *   2. `registerCenter` (a server action) validates the same draft again and
 *      writes the listing through one SQL function.
 *   3. The listing is stored with verified = false, so nothing is published.
 *      An admin reviews it later in the Supabase dashboard.
 */

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerCenter } from "@/lib/center-actions";
import { draftFromFormData, validateCenterDraft, type RegisterCenterState, type ServiceOption } from "@/lib/center-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** useActionState needs a stable initial value, so it lives outside the component. */
const initialState: RegisterCenterState = { status: "idle", message: "" };

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const optionalClass = "font-normal text-slate-500";
const textAreaClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-400 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]";

export function RegisterAgentForm({ services, servicesUnavailable = false }: { services: ServiceOption[]; servicesUnavailable?: boolean }) {
  const [state, formAction, pending] = useActionState(registerCenter, initialState);
  const [clientError, setClientError] = useState("");

  /**
   * Runs before the server action. Calling preventDefault() cancels the
   * submission, which is how we show an instant message without a round trip.
   */
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const problem = validateCenterDraft(draftFromFormData(new FormData(event.currentTarget)));
    if (problem) {
      event.preventDefault();
      setClientError(problem);
      return;
    }
    setClientError("");
  }

  // Success replaces the form completely, so a visitor cannot submit twice by
  // accident. A whole new panel is clearer than a banner above the fields,
  // because the submission is finished - there is nothing left to edit here.
  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-emerald-900">{state.message}</h2>
        <p className="mt-3 text-sm leading-6 text-emerald-900/80">
          Your details are saved as <strong>pending review</strong>. Nothing is public yet: every submission is checked by hand, and only then does
          your center appear in the “Find help nearby” results.
        </p>
        <Link
          href="/services"
          className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Browse services
        </Link>
      </div>
    );
  }

  const errorMessage = clientError || (state.status === "error" ? state.message : "");

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="space-y-6">
      {errorMessage && (
        <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {errorMessage}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="agent-name" className={labelClass}>
            Center name <span aria-hidden="true" className="text-teal-800">*</span>
          </label>
          <Input id="agent-name" name="name" required autoComplete="organization" placeholder="e.g. Pragati CSC Center" />
        </div>

        <div>
          <label htmlFor="agent-city" className={labelClass}>
            City or town <span aria-hidden="true" className="text-teal-800">*</span>
          </label>
          <Input id="agent-city" name="city" required autoComplete="address-level2" placeholder="e.g. Guwahati" />
        </div>

        <div>
          <label htmlFor="agent-pincode" className={labelClass}>
            PIN code <span aria-hidden="true" className="text-teal-800">*</span>
          </label>
          <Input id="agent-pincode" name="pincode" required inputMode="numeric" autoComplete="postal-code" maxLength={6} placeholder="781001" />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="agent-address" className={labelClass}>
            Full address <span aria-hidden="true" className="text-teal-800">*</span>
          </label>
          <textarea
            id="agent-address"
            name="address"
            required
            rows={3}
            autoComplete="street-address"
            placeholder="Shop or building name, street, landmark, area"
            className={textAreaClass}
          />
        </div>

        <div>
          <label htmlFor="agent-phone" className={labelClass}>
            Phone number <span aria-hidden="true" className="text-teal-800">*</span>
          </label>
          <Input id="agent-phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="9876543210" />
        </div>

        <div>
          <label htmlFor="agent-whatsapp" className={labelClass}>
            WhatsApp number <span className={optionalClass}>(optional)</span>
          </label>
          <Input id="agent-whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="Leave blank to use the phone number" />
        </div>
      </div>

      <fieldset className="rounded-xl border border-slate-200 p-5">
        <legend className="px-2 text-sm font-semibold text-slate-900">
          Which services can you help with? <span aria-hidden="true" className="text-teal-800">*</span>
        </legend>
        <p className="mt-1 text-sm text-slate-600">Tick every service you actually handle. Visitors only see your center on those pages.</p>
        {servicesUnavailable ? (
          <p role="alert" className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            The service list could not be loaded, so this form is disabled. Please try again in a few minutes.
          </p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm hover:border-teal-700 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal-700"
              >
                <input type="checkbox" name="service_ids" value={service.id} className="size-5 accent-teal-700" />
                <span className="text-slate-800">
                  {service.name}
                  {/* The same service exists once per state, so the state code
                      keeps two identical names apart. */}
                  {service.stateCode && <span className="ml-2 text-xs font-medium text-slate-500">({service.stateCode})</span>}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <div className="space-y-4">
        <p className="rounded-md border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm leading-6 text-amber-900">
          Only the details above are published, and only after review. Never send Aadhaar, PAN, bank, or password details through this form.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending || servicesUnavailable}>
            {pending ? "Sending..." : "Submit for review"}
          </Button>
          <p className="text-xs text-slate-500">Your listing is hidden until an administrator verifies it.</p>
        </div>
      </div>
    </form>
  );
}
