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
        className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20"
      >
        <div className="rounded-2xl border border-border bg-muted/40 px-5 py-10 sm:px-10 sm:py-12 lg:px-12">
          <span
            className="mb-6 block h-0.5 w-10 bg-[#dc395f] sm:mb-8"
            aria-hidden
          />

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {copy.eyebrow}
          </p>

          <h2
            id="impact-evidence-rule-heading"
            className="max-w-xl font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
          >
            {copy.title}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            {copy.description}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2.5 sm:mt-10 sm:gap-3">
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
    </section>
  );
}
