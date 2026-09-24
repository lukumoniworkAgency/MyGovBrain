"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { serviceId: string; serviceName: string; languageCode?: string };

export function CscLeadForm({
  serviceId,
  serviceName,
  languageCode = "en",
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [leadCode, setLeadCode] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serviceId,
        citizenName: name,
        phone,
        district: district || undefined,
        language: languageCode,
        notes: message || undefined,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setState("error");
      return;
    }
    setLeadCode(payload?.data?.lead_code ?? "GGA-REQUEST");
    setState("success");
  }

  if (state === "success")
    return (
      <section
        aria-labelledby="lead-success-heading"
        className="rounded-xl border border-emerald-200 bg-emerald-50 p-6"
      >
        <h2
          id="lead-success-heading"
          className="text-xl font-semibold text-emerald-950"
        >
          Request created
        </h2>
        <p className="mt-2 text-emerald-900">
          Your lead code is <strong>{leadCode}</strong>. Our partner CSC will
          contact you soon.
        </p>
        <p className="mt-2 text-sm text-emerald-800">Service: {serviceName}</p>
      </section>
    );

  return (
    <section
      aria-labelledby="lead-form-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
    >
      <p className="text-xs font-semibold tracking-[0.14em] text-teal-700 uppercase">
        Need a person to help?
      </p>
      <h2 id="lead-form-heading" className="mt-2 text-2xl font-semibold">
        Get CSC assistance
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Create a request and an admin will connect you with a verified CSC
        partner.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4" noValidate>
        <div>
          <label
            htmlFor="lead-name"
            className="mb-1.5 block text-sm font-medium"
          >
            Name
          </label>
          <Input
            id="lead-name"
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="lead-phone"
            className="mb-1.5 block text-sm font-medium"
          >
            Phone
          </label>
          <Input
            id="lead-phone"
            required
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
          />
        </div>
        <div>
          <label
            htmlFor="lead-district"
            className="mb-1.5 block text-sm font-medium"
          >
            District{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <Input
            id="lead-district"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="lead-message"
            className="mb-1.5 block text-sm font-medium"
          >
            Message{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="lead-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={4000}
            className="min-h-24 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]"
          />
        </div>
        <Button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Sending..." : "Request assistance"}
        </Button>
        {state === "error" && (
          <p
            role="alert"
            className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            Please sign in and check your details, then try again.
          </p>
        )}
      </form>
    </section>
  );
}
