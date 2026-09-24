import Link from "next/link";
import { AdminServiceForm } from "@/components/admin-service-form";
import { getAdminStatus, getAdminWorkspace } from "@/lib/admin";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  const { user, isAdmin } = await getAdminStatus();
  if (!user) return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="text-3xl font-semibold">Admin access required</h1><p className="mt-3 text-slate-600">Sign in with an administrator account to manage service content.</p><Link href="/auth?next=/admin" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-teal-700 px-5 py-2 font-medium text-white">Sign in</Link></main>;
  if (!isAdmin) return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="text-3xl font-semibold">Administrator access denied</h1><p className="mt-3 text-slate-600">This account is signed in but is not assigned the administrator role.</p></main>;
  const workspace = await getAdminWorkspace();
  if (!workspace) return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><h1 className="text-3xl font-semibold">Admin data is unavailable</h1><p className="mt-3 text-slate-600">Please try again shortly.</p></main>;
  const selectedService = workspace.services.find((service) => service.id === params.service);
  return <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Internal tools</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Service editor</h1></div><Link href="/services" className="min-h-11 inline-flex items-center text-sm font-medium text-teal-800 underline underline-offset-4">View public directory</Link></div><div className="mt-8"><AdminServiceForm workspace={workspace} selectedService={selectedService} /></div></main>;
}
