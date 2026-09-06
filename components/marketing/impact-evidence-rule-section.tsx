import { Check } from "lucide-react";

import type { ImpactPageCopy } from "@/types/marketing-page";

type ImpactEvidenceRuleSectionProps = {
  copy: ImpactPageCopy["evidenceRule"];
};

/**
 * Impact Evidence Rule — public trust statement.
 * Lists the five publish checks; no fake metrics or CMS status UI.
 */
export function ImpactEvidenceRuleSection({
  copy,
}: ImpactEvidenceRuleSectionProps) {
  return (
    <section
      id="evidence-rule"
      aria-labelledby="impact-evidence-rule-heading"
      className="border-b border-border bg-white text-foreground"
    >
      <div
        data-reveal="fade"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
      >
        <div className="rounded-2xl border border-border bg-muted/40 px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-10 xl:gap-14">
            <div className="min-w-0">
              <span
                className="mb-4 block h-0.5 w-10 bg-[#dc395f] sm:mb-5"
                aria-hidden
              />

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {copy.eyebrow}
              </p>

              <h2
                id="impact-evidence-rule-heading"
                className="max-w-xl font-heading text-xl font-semibold tracking-tight text-balance sm:text-2xl lg:text-[1.65rem]"
              >
                {copy.title}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7">
                {copy.description}
              </p>
            </div>

            <ul className="flex flex-wrap gap-2 sm:gap-2.5 lg:justify-end">
              {copy.requirements.map((item) => (
                <li
                  key={item.id}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-border/80 bg-white px-3.5 py-2"
                >
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#179191]/12 text-[#179191]"
                    aria-hidden
                  >
                    <Check className="size-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-sm font-medium tracking-tight text-foreground">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
