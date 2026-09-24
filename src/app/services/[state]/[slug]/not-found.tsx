import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-5 py-16 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Not found</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">We couldn&apos;t find this service.</h1><p className="mt-4 text-lg text-slate-600">The service link may be outdated or the service may not be listed yet.</p><Link href="/services" className="mt-7 rounded-md bg-teal-700 px-5 py-3 font-medium text-white hover:bg-teal-800">Back to services</Link></main>;
}
