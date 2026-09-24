import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, MapPin, Phone, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { centerPreviews, getCenterPreview } from "@/config/csc";
import { getPageLanguage } from "@/lib/language";

type CenterPageProps = {
  params: Promise<{ centerId: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export function generateStaticParams() {
  return centerPreviews.map(({ id }) => ({ centerId: id }));
}

export async function generateMetadata({
  params,
}: Pick<CenterPageProps, "params">): Promise<Metadata> {
  const center = getCenterPreview((await params).centerId);
  return center
    ? {
        title: `${center.name} — GovGuide`,
        description: `Services, hours, contact details, and reviews for ${center.name}.`,
      }
    : { title: "CSC Center Not Found — GovGuide" };
}

export default async function CenterProfilePage({
  params,
  searchParams,
}: CenterPageProps) {
  const [{ centerId }, query] = await Promise.all([params, searchParams]);
  const center = getCenterPreview(centerId);
  if (!center) notFound();
  const { languages, languageCode } = await getPageLanguage(query.lang);
  const callHref = `tel:${center.phone.replace(/\s/g, "")}`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address}, ${center.city}, ${center.pincode}`)}`;

  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main id="main-content">
        <PageHeader
          kicker="CSC center profile"
          title={center.name}
          lead={`${center.address}, ${center.area}, ${center.city}`}
        />
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin aria-hidden="true" className="size-4" />
                      {center.district}, PIN {center.pincode}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-blue-700">
                      <Star
                        aria-hidden="true"
                        className="mr-1 inline size-4 fill-current"
                      />
                      {center.rating} from {center.reviewCount} ratings ·{" "}
                      {center.distance} away
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${center.status === "Open" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                  >
                    {center.status}
                  </span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <a
                    href={callHref}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    Call CSC
                  </a>
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold"
                  >
                    <MapPin aria-hidden="true" className="size-4" />
                    Directions
                  </a>
                </div>
              </section>

              <section
                className="rounded-xl border border-slate-200 bg-white p-6"
                aria-labelledby="services-offered"
              >
                <h2 id="services-offered" className="text-xl font-semibold">
                  Services offered
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {center.services.map((service) => (
                    <li
                      key={service}
                      className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/services"
                  className="mt-5 inline-block text-sm font-semibold text-blue-700 underline underline-offset-4"
                >
                  Explore service guidance
                </Link>
              </section>
              <section
                className="rounded-xl border border-slate-200 bg-white p-6"
                aria-labelledby="center-hours"
              >
                <h2
                  id="center-hours"
                  className="flex items-center gap-2 text-xl font-semibold"
                >
                  <Clock3 aria-hidden="true" className="size-5 text-blue-600" />
                  Working hours
                </h2>
                <dl className="mt-4 divide-y divide-slate-100">
                  {center.hours.map((item) => (
                    <div
                      key={item.day}
                      className="flex justify-between gap-4 py-3 text-sm"
                    >
                      <dt className="text-slate-600">{item.day}</dt>
                      <dd className="font-medium">{item.time}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section
                className="rounded-xl border border-slate-200 bg-white p-6"
                aria-labelledby="center-reviews"
              >
                <h2 id="center-reviews" className="text-xl font-semibold">
                  Citizen reviews
                </h2>
                <div className="mt-4 space-y-4">
                  {center.reviews.map((review) => (
                    <article
                      key={review.name}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <div className="flex justify-between gap-3">
                        <h3 className="font-semibold">{review.name}</h3>
                        <p
                          aria-label={`${review.rating} out of 5 stars`}
                          className="text-sm text-amber-600"
                        >
                          {"★".repeat(review.rating)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
            <aside
              className="h-fit space-y-4 lg:sticky lg:top-28"
              aria-label="Center actions"
            >
              <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                <h2 className="font-semibold">Plan your visit</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Request a service or ask the center to confirm an appointment
                  before visiting.
                </p>
                <div className="mt-4 grid gap-3">
                  <Link
                    href={`/contact?service=${encodeURIComponent(center.name)}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
                  >
                    Book appointment
                  </Link>
                  <Link
                    href="/auth?next=/csc"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-800"
                  >
                    Request service
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-800"
                  >
                    Save CSC
                  </Link>
                </div>
              </section>
              <p className="rounded-lg border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
                Profile details are preview data. Confirm fees, availability,
                and appointments directly with the center.
              </p>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
