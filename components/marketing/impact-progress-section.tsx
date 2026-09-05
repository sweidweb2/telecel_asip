import type { ImpactPageCopy } from "@/types/marketing-page";

type ImpactProgressSectionProps = {
  copy: ImpactPageCopy["progress"];
};

/**
 * Impact “Seven Years of Impact” framing — narrative only.
 * Metrics belong in the Lens table; this block sets the evidence rule in type.
 */
export function ImpactProgressSection({ copy }: ImpactProgressSectionProps) {
  return (
    <section
      id="progress"
      aria-labelledby="impact-progress-heading"
      className="border-b border-border bg-white text-foreground"
    >
      <div
        data-reveal="fade"
        className="mx-auto w-full max-w-[43.75rem] px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24"
      >
        <span
          className="mx-auto mb-6 block h-0.5 w-10 bg-[#dc395f] sm:mb-8"
          aria-hidden
        />

        {copy.eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {copy.eyebrow}
          </p>
        ) : null}

        <h2
          id="impact-progress-heading"
          className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
        >
          {copy.title}
        </h2>

        <p className="mt-6 text-lg leading-[1.7] text-muted-foreground sm:mt-7 sm:text-xl sm:leading-[1.75]">
          {copy.description}
        </p>
      </div>
    </section>
  );
}
