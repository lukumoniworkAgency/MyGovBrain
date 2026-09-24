"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><div className="rounded-xl border border-rose-200 bg-rose-50 p-7"><h1 className="text-2xl font-semibold text-rose-900">Admin tools are unavailable</h1><p className="mt-2 text-rose-800">No changes were made. Please try again shortly.</p><button type="button" onClick={reset} className="mt-5 min-h-11 rounded-md bg-teal-700 px-4 py-2 font-medium text-white">Try again</button></div></main>;
}
