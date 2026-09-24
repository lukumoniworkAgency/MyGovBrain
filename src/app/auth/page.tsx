import { AuthPanel } from "@/components/auth-panel";
import { SiteShell } from "@/components/site-shell";
import { getPageLanguage } from "@/lib/language";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{
    lang?: string;
    next?: string;
    mode?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const { languages, languageCode } = await getPageLanguage(params.lang);
  const initialMode =
    params.mode === "update-password"
      ? ("update-password" as const)
      : undefined;
  const nextPath = params.next?.startsWith("/")
    ? params.next
    : `/my-services?lang=${languageCode}`;
  return (
    <SiteShell languages={languages} languageCode={languageCode}>
      <main
        id="main-content"
        className="anim-fade-up mx-auto max-w-xl px-5 py-16 sm:px-8"
      >
        {params.error === "confirmation" && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-800"
          >
            We could not confirm your sign-in link. Please request a new email
            and try again.
          </p>
        )}
        <AuthPanel
          nextPath={nextPath}
          initialMode={initialMode}
          passwordOnly={params.mode === "password"}
        />
      </main>
    </SiteShell>
  );
}
