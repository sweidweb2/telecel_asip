import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { ProgrammeAudienceSection } from "@/components/marketing/programme-audience-section";
import { ProgrammeEligibilitySection } from "@/components/marketing/programme-eligibility-section";
import { ProgrammeHero } from "@/components/marketing/programme-hero";
import { ProgrammeJourneySection } from "@/components/marketing/programme-journey-section";
import { ProgrammePastChaptersSection } from "@/components/marketing/programme-past-chapters-section";
import { ProgrammeValueSection } from "@/components/marketing/programme-value-section";
import type { Locale } from "@/constants/locales";
import { programmeCopyFor } from "@/constants/programme-copy";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import type { CohortPublicListItem } from "@/types/cohort";

type ProgrammePageContentProps = {
  locale: Locale;
  cohorts: CohortPublicListItem[];
  openApplications: boolean;
};

/**
 * Programme marketing page — mostly static (build spec §4).
 * Published cohorts fill the past-chapters section.
 */
export function ProgrammePageContent({
  locale,
  cohorts,
  openApplications,
}: ProgrammePageContentProps) {
  const copy = programmeCopyFor(locale);
  const intake = intakeCtaFor(locale, openApplications);

  return (
    <main>
      <ProgrammeHero
        locale={locale}
        copy={copy.hero}
        openApplications={openApplications}
      />

      <ProgrammeAudienceSection
        locale={locale}
        copy={copy.audience}
        openApplications={openApplications}
      />

      <ProgrammeJourneySection copy={copy.journey} />

      <ProgrammeValueSection copy={copy.value} />

      <ProgrammeEligibilitySection copy={copy.eligibility} />

      <ProgrammePastChaptersSection locale={locale} cohorts={cohorts} />

      <PageCtaSection
        locale={locale}
        cta={{
          ...copy.ctaSection,
          slug: intake.slug,
          label: intake.label,
          description: openApplications
            ? locale === "fr"
              ? "Les candidatures sont ouvertes. Explorez aussi les fondateurs qui ont déjà construit avec ASIP."
              : "Applications are open. You can also explore founders who have already built through ASIP."
            : copy.ctaSection.description,
        }}
      />
    </main>
  );
}
