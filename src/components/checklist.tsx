"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveChecklistItem } from "@/lib/actions";
import type { Service } from "@/lib/data";

export function Checklist({ service, languageCode, initialChecked = [] }: { service: Service; languageCode: string; initialChecked?: string[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => Object.fromEntries(initialChecked.map((id) => [id, true])));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const documents = service.documents ?? [];
  function toggle(documentId: string, value: boolean) {
    setChecked((current) => ({ ...current, [documentId]: value }));
    startTransition(async () => { const result = await saveChecklistItem(service.id, documentId, value); if (!result.ok) setMessage(result.reason === "unauthenticated" ? "Sign in to save your checklist and come back to it later." : "We could not save that change right now."); else setMessage("Checklist progress saved."); });
  }
  return <section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Your checklist</p><h2 className="mt-2 text-2xl font-semibold">Documents to prepare</h2></div><span className="text-sm text-slate-500" aria-live="polite">{Object.values(checked).filter(Boolean).length} of {documents.length}</span></div><p className="mt-3 text-sm text-slate-600">You can mark documents now. Sign in when you want to save your progress.</p><div className="mt-5 space-y-3">{documents.map((document) => <label key={document.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:border-teal-700 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal-700"><input type="checkbox" checked={Boolean(checked[document.id])} onChange={(event) => toggle(document.id, event.target.checked)} disabled={pending} className="mt-1 size-5 accent-teal-700" /><span><span className="font-medium text-slate-900">{document.name}</span>{!document.is_required && <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">Optional</span>}{document.description && <span className="mt-1 block text-sm leading-6 text-slate-500">{document.description}</span>}</span></label>)}</div>{message && <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm text-amber-800" role="status">{message} {message.startsWith("Sign in") && <Link href={`/auth?next=/services/${service.state_code}/${service.slug}&lang=${languageCode}`} className="font-semibold underline underline-offset-4">Sign in</Link>}</div>}</section>;
}
