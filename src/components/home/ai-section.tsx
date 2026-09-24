import { Reveal } from "@/components/home/reveal";
import { SectionHeading, SectionShell } from "@/components/home/section";
import { HomeIcon } from "@/components/home/home-icon";
import { aiCapabilities } from "@/config/home";

/** AI assistant preview — capability list + static chat mock. */
export function AiSection() {
  return (
    <SectionShell
      id="ai"
      labelledBy="ai-heading"
      className="border-t border-slate-200/70 bg-white"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="ai-heading"
            kicker="AI assistant"
            title="Ask AI Before Visiting Any Office"
            lead="Eligibility, documents, fees, and timelines — answered from verified service records, never guessed."
          />
          <ul className="mt-6 space-y-3">
            {aiCapabilities.map((item, index) => (
              <Reveal key={item.title} delay={Math.min(index, 4) * 0.05}>
                <li className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-[#f4f7f6] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700/10 text-teal-800">
                    <HomeIcon name={item.icon} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-600">
                      {item.description}
                    </span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}>
          <div
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl ring-1 ring-teal-900/10"
            role="img"
            aria-label="Preview of the AI assistant chat"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 bg-[#f4f7f6] px-5 py-3.5">
              <span
                className="h-2.5 w-2.5 rounded-full bg-teal-600"
                aria-hidden="true"
              />
              <span
                className="h-2.5 w-2.5 rounded-full bg-amber-400"
                aria-hidden="true"
              />
              <span className="ml-2 text-xs font-bold text-slate-600">
                GovGuide AI — always cites sources
              </span>
            </div>
            <div className="space-y-3 p-5">
              <p className="brand-gradient w-fit max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white shadow-md">
                Am I eligible for the income certificate?
              </p>
              <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm leading-6 text-slate-800 shadow-xs">
                Likely yes, if you are an Indian resident with address proof.
                You will need Aadhaar, address proof, and an affidavit. Official
                fee: Rs 20–50.
              </p>
              <p className="brand-gradient w-fit max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white shadow-md">
                What documents do I need?
              </p>
              <div className="flex flex-wrap gap-2">
                {["Who can apply?", "How do I apply?", "What is the fee?"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-teal-700/20 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
