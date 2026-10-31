import { AboutCeoMessageSection } from "@/components/marketing/about-ceo-message-section";
import { AboutJourneyTimeline } from "@/components/marketing/about-journey-timeline";
import { AboutNarrativeSplitSection } from "@/components/marketing/about-narrative-split-section";
import { AboutOurStorySection } from "@/components/marketing/about-our-story-section";
import type { Locale } from "@/constants/locales";
import type { MarketingPageCopy } from "@/types/marketing-page";

type AboutNarrative = NonNullable<MarketingPageCopy["aboutNarrative"]>;

const NARRATIVE_SPLITS = [
  {
    id: "mission",
    key: "mission",
    imagePosition: "right",
    imageVariant: "mission",
  },
  {
    id: "vision",
    key: "vision",
    imagePosition: "left",
    imageVariant: "vision",
  },
  {
    id: "telecel",
    key: "telecel",
    imagePosition: "right",
    imageVariant: "telecel",
  },
] as const;

export function AboutNarrativeSections({
  locale,
  narrative,
}: {
  locale: Locale;
  narrative: AboutNarrative;
}) {
  const [mission, vision, telecel] = NARRATIVE_SPLITS;
  const beforeTimeline = [mission, vision];
  const afterTimeline = [telecel];

  return (
    <div className="flex flex-col gap-14 sm:gap-16 lg:gap-20">
      <AboutOurStorySection locale={locale} story={narrative.story} />
      {beforeTimeline.map((split) => {
        const block = narrative[split.key];
        return (
          <AboutNarrativeSplitSection
            key={split.id}
            id={split.id}
            eyebrow={block.eyebrow}
            title={block.title}
            paragraphs={block.paragraphs}
            imagePosition={split.imagePosition}
            imageVariant={split.imageVariant}
            imageLabel={block.imageLabel}
          />
        );
      })}
      <AboutJourneyTimeline timeline={narrative.timeline} />
      {narrative.ceoMessage ? (
        <AboutCeoMessageSection message={narrative.ceoMessage} />
      ) : null}
      {afterTimeline.map((split) => {
        const block = narrative[split.key];
        return (
          <AboutNarrativeSplitSection
            key={split.id}
            id={split.id}
            eyebrow={block.eyebrow}
            title={block.title}
            paragraphs={block.paragraphs}
            imagePosition={split.imagePosition}
            imageVariant={split.imageVariant}
            imageLabel={block.imageLabel}
          />
        );
      })}
    </div>
  );
}
