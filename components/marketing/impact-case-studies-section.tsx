import { ImpactCaseStudiesScroller } from "@/components/marketing/impact-case-studies-scroller";
import type { Locale } from "@/constants/locales";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactPageCopy } from "@/types/marketing-page";

type ImpactCaseStudiesSectionProps = {
  locale: Locale;
  copy: ImpactPageCopy["caseStudy"];
  stories: ImpactCaseStudyPublic[];
};

function reservedSeats(): ImpactCaseStudyPublic[] {
  return [0, 1, 2].map((index) => ({
    id: `pending-slot-${index}`,
    startupId: null,
    name: "",
    slug: "",
    founderNames: [],
    sector: null,
    country: null,
    coverImageUrl: null,
    imageFocalX: 50,
    imageFocalY: 50,
    barrier: null,
    support: null,
    outcome: null,
    stat: null,
    status: "pending" as const,
  }));
}

/**
 * Impact case studies — live cards plus reserved pending seats so the
 * grid does not jump when a story is cleared.
 */
export function ImpactCaseStudiesSection({
  locale,
  copy,
  stories,
}: ImpactCaseStudiesSectionProps) {
  const slots = stories.length > 0 ? stories : reservedSeats();

  return (
    <section
      id="case-studies"
      aria-labelledby="impact-case-studies-heading"
      className="border-b border-border bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {copy.eyebrow}
          </p>
          <h2
            id="impact-case-studies-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            {copy.title}
          </h2>
        </header>

        <div className="mt-8 sm:mt-10">
          <ImpactCaseStudiesScroller
            locale={locale}
            copy={copy}
            stories={slots}
          />
        </div>
      </div>
    </section>
  );
}
