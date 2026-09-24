import Link from "next/link";
import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { vaultBenefits, vaultDocuments } from "@/config/home";

/** Document vault teaser — checklists today, storage roadmap. */
export function VaultSection({ languageCode }: { languageCode: string }) {
  return (
    <SectionShell
      id="vault"
      labelledBy="vault-heading"
      className="border-t border-slate-200/70 bg-white"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="vault-heading"
            kicker="Document vault"
            title="Every paper, ready before you queue"
            lead="Checklists for the documents offices actually ask for — organized by service."
          />
          <div className="mt-5 flex flex-wrap gap-2">
            {vaultDocuments.map((doc) => (
              <span
                key={doc}
                className="rounded-full border border-teal-700/15 bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800"
              >
                {doc}
              </span>
            ))}
          </div>
          <ul className="mt-6 space-y-3">
            {vaultBenefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={Math.min(index, 2) * 0.05}>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800">
                    <HomeIcon name={benefit.icon} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      {benefit.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">
                      {benefit.description}
                    </span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-slate-200/80 bg-[#f4f7f6] p-6 shadow-md">
            <p className="text-xs font-bold tracking-widest text-teal-700 uppercase">
              Income Certificate — checklist
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Aadhaar card — ready",
                "Address proof — ready",
                "Affidavit — pending",
                "Passport photo — ready",
              ].map((row) => (
                <li
                  key={row}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-xs"
                >
                  <span
                    aria-hidden="true"
                    className={
                      row.includes("pending")
                        ? "text-amber-500"
                        : "text-teal-700"
                    }
                  >
                    {row.includes("pending") ? "○" : "●"}
                  </span>
                  {row}
                </li>
              ))}
            </ul>
            <Link
              href={`/services?lang=${languageCode}&q=${encodeURIComponent("Income Certificate")}`}
              className="brand-gradient mt-5 inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Start my checklist
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
