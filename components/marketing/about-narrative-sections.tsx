import { AboutBeliefSection } from "@/components/marketing/about-belief-section";
import { AboutCeoMessageSection } from "@/components/marketing/about-ceo-message-section";
import { AboutJourneyTimeline } from "@/components/marketing/about-journey-timeline";
import { AboutNarrativeSplitSection } from "@/components/marketing/about-narrative-split-section";
import { AboutOurStorySection } from "@/components/marketing/about-our-story-section";
import type { Locale } from "@/constants/locales";
import type { MarketingPageCopy } from "@/types/marketing-page";

type AboutNarrative = NonNullable<
  MarketingPageCopy["aboutNarrative"]
>;

export function AboutNarrativeSections({
  locale,
  narrative,
}: {
  locale: Locale;
  narrative: AboutNarrative;
}) {
  return (
    <div className="flex flex-col gap-14 sm:gap-16 lg:gap-20">
      <AboutOurStorySection locale={locale} story={narrative.story} />
      <AboutBeliefSection belief={narrative.belief} />
      <AboutNarrativeSplitSection
        id="mission"
        eyebrow={narrative.mission.eyebrow}
        title={narrative.mission.title}
        paragraphs={narrative.mission.paragraphs}
        imagePosition="right"
        imageVariant="mission"
        imageLabel={narrative.mission.imageLabel}
      />
      <AboutNarrativeSplitSection
        id="vision"
        eyebrow={narrative.vision.eyebrow}
        title={narrative.vision.title}
        paragraphs={narrative.vision.paragraphs}
        imagePosition="left"
        imageVariant="vision"
        imageLabel={narrative.vision.imageLabel}
      />
      <AboutJourneyTimeline timeline={narrative.timeline} />
      {narrative.ceoMessage ? (
        <AboutCeoMessageSection message={narrative.ceoMessage} />
      ) : null}
      <AboutNarrativeSplitSection
        id="telecel"
        eyebrow={narrative.telecel.eyebrow}
        title={narrative.telecel.title}
        paragraphs={narrative.telecel.paragraphs}
        imagePosition="right"
        imageVariant="telecel"
        imageLabel={narrative.telecel.imageLabel}
      />
    </div>
  );
}
