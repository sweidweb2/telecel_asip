import type { HomeImpactYearsMetric } from "@/components/marketing/home-impact-years-section";
import { HomeImpactYearsSection } from "@/components/marketing/home-impact-years-section";
import { HomeMapFlipperSection } from "@/components/marketing/home-map-flipper-section";
import { HomeNextChapterSection } from "@/components/marketing/home-next-chapter-section";
import { HomePlatformModelSection } from "@/components/marketing/home-platform-model-section";
import { HomeTelecelConnectionSection } from "@/components/marketing/home-telecel-connection-section";
import { ImpactFanSection } from "@/components/marketing/impact-fan-section";
import { InstitutionalHero } from "@/components/marketing/institutional-hero";
import { LabAfricaBlueprintSection } from "@/components/marketing/lab-africa-blueprint-section";
import { LabPartnersHoneycombSection } from "@/components/marketing/lab-partners-honeycomb-section";
import { ProgrammeAudienceSection } from "@/components/marketing/programme-audience-section";
import { ProgrammeEligibilitySection } from "@/components/marketing/programme-eligibility-section";
import { ProgrammeHero } from "@/components/marketing/programme-hero";
import { ProgrammeJourneySection } from "@/components/marketing/programme-journey-section";
import { ProgrammeValueSection } from "@/components/marketing/programme-value-section";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { programmeCopyFor } from "@/constants/programme-copy";

type LabPageContentProps = {
  locale: Locale;
  openApplications: boolean;
  metrics?: HomeImpactYearsMetric[];
};

/**
 * Temporary playground for marketing sections parked for later reuse.
 * Not indexed; linked in the navbar while iterating.
 */
export function LabPageContent({
  locale,
  openApplications,
  metrics = [],
}: LabPageContentProps) {
  const homeCopy = homeCopyFor(locale);
  const programmeCopy = programmeCopyFor(locale);
  const title = locale === "fr" ? "Labo de sections" : "Sections lab";
  const intro =
    locale === "fr"
      ? "Sections marketing en réserve - à réutiliser plus tard."
      : "Parked marketing sections - reuse later.";

  return (
    <main>
      <InstitutionalHero
        eyebrow="Dev · Temporary"
        title={title}
        description={intro}
        headingId="lab-hero-heading"
        patternId="lab-hero"
        composition="blueprint"
        size="compact"
      />

      <ProgrammeHero
        locale={locale}
        copy={programmeCopy.hero}
        openApplications={openApplications}
      />
      <ProgrammeAudienceSection
        locale={locale}
        copy={programmeCopy.audience}
        openApplications={openApplications}
      />
      <ProgrammeValueSection copy={programmeCopy.value} />
      <ProgrammeJourneySection copy={programmeCopy.journey} />
      <ProgrammeEligibilitySection copy={programmeCopy.eligibility} />

      <ImpactFanSection locale={locale} />
      <LabAfricaBlueprintSection locale={locale} />
      <LabAfricaBlueprintSection locale={locale} tone="light" />
      <LabPartnersHoneycombSection locale={locale} />
      <HomeMapFlipperSection />

      <HomeImpactYearsSection copy={homeCopy.impactYears} metrics={metrics} />
      <HomePlatformModelSection copy={homeCopy.platform} />
      <HomeTelecelConnectionSection copy={homeCopy.telecel} />
      <HomeNextChapterSection
        locale={locale}
        copy={homeCopy.nextChapter}
        openApplications={openApplications}
      />
    </main>
  );
}
