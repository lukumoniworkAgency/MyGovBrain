"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUBJECT_OPTIONS = [
  { id: "general", label: "General question" },
  { id: "service_correction", label: "Service information correction" },
  { id: "bug_report", label: "Website problem" },
  { id: "accessibility", label: "Accessibility" },
  { id: "privacy", label: "Privacy request" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Accessible contact form. Submissions open the visitor's mail app via
 * mailto: — deliberately no server-side storage of personal information.
 */
export function ContactForm({ contactEmail }: { contactEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(SUBJECT_OPTIONS[0].id);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: { email?: string; message?: string } = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Enter a valid email address so we can reply to you.";
    }
    if (message.trim().length < 10) {
      nextErrors.message = "Please describe your message in at least 10 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const subjectLabel =
      SUBJECT_OPTIONS.find((option) => option.id === category)?.label ?? "General question";
    const subject = `[${subjectLabel}] from ${name.trim() || "GovGuide visitor"}`;
    const body = [
      message.trim(),
      "",
      "———",
      `Name: ${name.trim() || "-"}`,
      `Reply to: ${email.trim()}`,
    ].join("\n");

    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Your name <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Your email <span aria-hidden="true" className="text-teal-800">*</span>
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
        {errors.email ? (
          <p id="contact-email-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-category" className="mb-1.5 block text-sm font-medium text-slate-700">
          What is this about?
        </label>
        <select
          id="contact-category"
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 hover:border-slate-400 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]"
        >
          {SUBJECT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Message <span aria-hidden="true" className="text-teal-800">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us how we can help. Please do not include Aadhaar, PAN, bank, or other sensitive numbers."
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-xs outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-slate-400 focus:border-teal-700 focus:shadow-[0_0_0_4px_rgba(23,107,99,0.12)]"
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit">Send message</Button>
        <p className="text-xs text-slate-500">
          Opens your email app — we never store your message on this website.
        </p>
      </div>
    </form>
  );
}
