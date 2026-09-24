import Link from "next/link";
import { notFound } from "next/navigation";
import { AiChat } from "@/components/ai-chat";
import { Checklist } from "@/components/checklist";
import { EligibilityChecker } from "@/components/eligibility-checker";
import { FindHelpNearby } from "@/components/find-help-nearby";
import { CscLeadForm } from "@/components/csc-lead-form";
import { SiteShell } from "@/components/site-shell";
import { getChecklistState, getService, selectTranslation } from "@/lib/data";
import { getPageLanguage } from "@/lib/language";
import { AnalyticsTracker } from "@/components/analytics-tracker";

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ state: string; slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const route = await params;
  const query = await searchParams;
  const [{ languages, languageCode }, result] = await Promise.all([
    getPageLanguage(query.lang),
    getService(route.state, route.slug),
  ]);
  if (result.error)
    return (
      <SiteShell languages={languages} languageCode={languageCode}>
        <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-7">
            <h1 className="text-2xl font-semibold text-rose-900">
              We could not load this service right now
            </h1>
            <p className="mt-2 text-rose-800">Please try again shortly.</p>
          </div>
        </main>
      </SiteShell>
    );
  if (!result.data) notFound();
  const service = result.data;
  const { translation, isFallback } = selectTranslation(
    service.translations,
    languageCode,
  );
  if (!translation) notFound();
  const requiredDocuments =
    service.documents?.filter((document) => document.is_required) ?? [];
  const optionalDocuments =
    service.documents?.filter((document) => !document.is_required) ?? [];
  const checklistState = await getChecklistState(service.id);
  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main
        id="main-content"
        className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
      >
        <AnalyticsTracker eventName="service_view" path="/services" />
        <Link
          href={`/services?lang=${languageCode}`}
          className="text-sm font-medium text-teal-800 underline-offset-4 hover:underline"
        >
          Back to services
        </Link>
        <article className="anim-fade-up mt-8">
          <p className="text-sm font-semibold tracking-[0.16em] text-teal-700 uppercase">
            {service.category.name}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {translation.name}
          </h1>
          {isFallback && (
            <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This page is shown in English because a {languageCode} translation
              is not available yet.
            </p>
          )}
          <p className="mt-6 text-lg leading-8 text-slate-600">
            {translation.short_description}
          </p>
          <div className="mt-12 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold">About this service</h2>
              <p className="mt-3 leading-8 whitespace-pre-line text-slate-600">
                {translation.full_description}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold">Who can apply</h2>
              <p className="mt-3 leading-8 whitespace-pre-line text-slate-600">
                {translation.eligibility_text}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold">How to apply</h2>
              <p className="mt-3 leading-8 whitespace-pre-line text-slate-600">
                {translation.how_to_apply_text}
              </p>
            </section>
            <EligibilityChecker
              serviceId={service.id}
              rules={service.eligibilityRules ?? []}
              languageCode={languageCode}
            />
            <Checklist
              service={service}
              languageCode={languageCode}
              initialChecked={checklistState.checked}
            />
            <section>
              <h2 className="text-2xl font-semibold">Required documents</h2>
              {requiredDocuments.length ? (
                <ul className="mt-4 space-y-3">
                  {requiredDocuments.map((document) => (
                    <li
                      key={document.id}
                      className="card-hover rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
                    >
                      <span className="font-medium">{document.name}</span>
                      {document.description && (
                        <span className="mt-1 block text-sm text-slate-500">
                          {document.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-slate-600">
                  No required documents are listed yet.
                </p>
              )}
            </section>
            <section aria-labelledby="ask-ai-heading">
              <h2 id="ask-ai-heading" className="text-2xl font-semibold">
                Ask about this service
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Get AI-assisted explanations based on the verified information
                on this page.
              </p>
              <AiChat
                serviceId={service.slug}
                stateCode={service.state_code}
                languageCode={languageCode}
                initialSuggestions={[
                  translation.eligibility_text
                    ? "Who can apply?"
                    : "What is this service?",
                  requiredDocuments.length
                    ? "What documents do I need?"
                    : "How do I apply?",
                  "How do I apply?",
                  "What is the fee?",
                  "Where do I apply?",
                ].filter((value, index, list) => list.indexOf(value) === index)}
                className="mt-4"
              />
            </section>
            {optionalDocuments.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold">Optional documents</h2>
                <ul className="mt-4 space-y-3">
                  {optionalDocuments.map((document) => (
                    <li
                      key={document.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                      {document.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="text-2xl font-semibold">Official sources</h2>
              {service.sources?.length ? (
                <div className="mt-4 space-y-4">
                  {service.sources.map((source) => (
                    <div
                      key={source.source_url}
                      className="card-hover rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ring-1 ring-teal-900/5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-semibold">{source.source_title}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${source.status === "verified" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}
                        >
                          {source.status}
                        </span>
                      </div>
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block text-sm break-all text-teal-800 underline underline-offset-4"
                      >
                        {source.source_url}
                      </a>
                      {source.verified_at && (
                        <p className="mt-3 text-sm text-slate-500">
                          Verified{" "}
                          {new Date(source.verified_at).toLocaleDateString(
                            "en-CA",
                            { timeZone: "UTC" },
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-600">
                  No official source is available for this service yet.
                </p>
              )}
            </section>
            {/* In-person help: CSCs that offer this service. Placed after the
              self-guide so people who want to do it themselves read the steps
              first, and people who want help find it at the end. */}
            <CscLeadForm
              serviceId={service.id}
              serviceName={translation.name}
              languageCode={languageCode}
            />
            <FindHelpNearby
              serviceId={service.id}
              serviceName={translation.name}
            />
          </div>
        </article>
      </main>
    </SiteShell>
  );
}
