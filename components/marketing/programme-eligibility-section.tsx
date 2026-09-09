import { Check } from "lucide-react";

import { ProgrammeBridgeConnectionIllustration } from "@/components/marketing/programme-bridge-connection-illustration";
import type { ProgrammePageCopy } from "@/types/marketing-page";

type ProgrammeEligibilitySectionProps = {
  copy: ProgrammePageCopy["eligibility"];
};

/**
 * Programme “General eligibility” — checklist with a right-side
 * Bridge of Connection / Mentorship illustration (global & corporate reach).
 * Cohort-swap notice stays out of the public render (internal implementation only).
 */
export function ProgrammeEligibilitySection({
  copy,
}: ProgrammeEligibilitySectionProps) {
  return (
    <section
      id="eligibility"
      aria-labelledby="programme-eligibility-heading"
      className="scroll-mt-24 border-b border-border bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="min-w-0 max-w-[40.625rem] lg:max-w-none">
            <h2
              id="programme-eligibility-heading"
              className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl"
            >
              {copy.title}
            </h2>

            <ul className="mt-8 space-y-3.5 sm:mt-10 sm:space-y-4">
              {copy.items.map((item) => (
                <li key={item} className="flex gap-3 sm:gap-3.5">
                  <Check
                    className="mt-1 size-4 shrink-0 text-muted-foreground sm:mt-1.5 sm:size-[1.125rem]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="text-base leading-7 text-foreground sm:text-lg sm:leading-8">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden
            className="pointer-events-none mx-auto w-full max-w-md min-w-0 sm:max-w-lg lg:mx-0 lg:max-w-none"
          >
            <ProgrammeBridgeConnectionIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
