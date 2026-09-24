"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";

type DocumentRecord = { id: string; name: string; category: string; updated: string; size: string; secure: boolean };
const DEMO_DOCUMENTS: DocumentRecord[] = [
  { id: "aadhaar", name: "Aadhaar card", category: "Identity", updated: "12 Feb 2026", size: "1.2 MB", secure: true },
  { id: "pan", name: "PAN card", category: "Identity", updated: "10 Feb 2026", size: "840 KB", secure: true },
  { id: "marksheet", name: "Class 10 marksheet", category: "Education", updated: "02 Feb 2026", size: "2.1 MB", secure: true },
];

export function VaultClient() {
  const [documents, setDocuments] = useState(DEMO_DOCUMENTS);
  const [query, setQuery] = useState("");
  const visible = documents.filter((document) => `${document.name} ${document.category}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="mt-8 space-y-6" aria-label="Document vault"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">Your documents</h2><p className="mt-1 text-sm text-slate-600">Files are encrypted at rest and protected by OTP verification.</p></div><button type="button" className="rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-900">Upload document</button></div><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><label className="sr-only" htmlFor="vault-search">Search documents</label><input id="vault-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by document or category" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15" /></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((document) => <article key={document.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{document.name}</p><p className="mt-1 text-sm text-slate-500">{document.category} · {document.size}</p></div><StatusBadge status={document.secure ? "Verified" : "Pending"} /></div><p className="mt-5 text-xs text-slate-500">Updated {document.updated}</p><div className="mt-4 flex gap-2"><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-700 hover:text-teal-800">View</button><button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-teal-700 hover:text-teal-800">Download</button></div></article>)}</div>{visible.length === 0 ? <EmptyState title="No documents found" description="Try a different search term or upload a new document." /> : null}<div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900"><p className="font-bold">Privacy controls</p><p className="mt-1 leading-6">Encryption, OTP verification, and activity logging are ready for connection to the existing Supabase storage and audit tables.</p></div><button type="button" onClick={() => setDocuments((current) => [...current, { id: `demo-${current.length + 1}`, name: "New document", category: "Uncategorized", updated: "Today", size: "Pending", secure: false }])} className="sr-only">Add demo document</button></section>;
}
