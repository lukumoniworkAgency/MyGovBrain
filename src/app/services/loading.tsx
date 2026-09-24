export default function Loading() {
  return <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8" aria-busy="true"><div className="h-10 w-64 animate-pulse rounded bg-slate-200" /><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white" />)}</div></main>;
}
