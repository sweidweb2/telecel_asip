import { ImpactCaseStudiesLoadMore } from "@/components/marketing/impact-case-studies-load-more";
import { ImpactCaseStudyCard } from "@/components/marketing/impact-case-study-card";
import type { Locale } from "@/constants/locales";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactPageCopy } from "@/types/marketing-page";

/** First paint: 3 cards. Load more adds 3 until the section cap. */
const INITIAL_VISIBLE = 3;
/** Hard cap for this Impact section (matches data fetch limit). */
export const IMPACT_CASE_STUDIES_MAX = 9;

type ImpactCaseStudiesSectionProps = {
  locale: Locale;
  copy: ImpactPageCopy["caseStudy"];
  stories: ImpactCaseStudyPublic[];
};

function reservedSeats(): ImpactCaseStudyPublic[] {
  return [0, 1, 2].map((index) => ({
    id: `pending-slot-${index}`,
    startupId: null,
    title: "",
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
 * Impact case studies — first 3 cards SSR; remaining via client load-more.
 */
export function ImpactCaseStudiesSection({
  locale,
  copy,
  stories,
}: ImpactCaseStudiesSectionProps) {
  const slots = stories.length > 0 ? stories : reservedSeats();
  const cappedStories = slots.slice(0, IMPACT_CASE_STUDIES_MAX);
  const initialStories = cappedStories.slice(0, INITIAL_VISIBLE);
  const remainingStories = cappedStories.slice(INITIAL_VISIBLE);

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
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {initialStories.map((story) => (
              <li key={story.id} className="min-w-0">
                <ImpactCaseStudyCard
                  locale={locale}
                  copy={copy}
                  story={story}
                />
              </li>
            ))}
          </ul>

          <ImpactCaseStudiesLoadMore
            locale={locale}
            copy={copy}
            remaining={remainingStories}
          />
        </div>
      </div>
    </section>
  );
}
