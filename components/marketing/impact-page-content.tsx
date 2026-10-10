import { ImpactCaseStudiesSection } from "@/components/marketing/impact-case-studies-section";
import { ImpactEvidenceRuleSection } from "@/components/marketing/impact-evidence-rule-section";
import { ImpactFanSection } from "@/components/marketing/impact-fan-section";
import { ImpactHero } from "@/components/marketing/impact-hero";
import { ImpactLensesSection } from "@/components/marketing/impact-lenses-section";
import { ImpactProgressSection } from "@/components/marketing/impact-progress-section";
import { ImpactProofNumbersSection } from "@/components/marketing/impact-proof-numbers-section";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import type { Locale } from "@/constants/locales";
import { impactCopyFor } from "@/constants/impact-copy";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";
import type { ImpactMetricPublicItem } from "@/types/impact-metric";

type ImpactPageContentProps = {
  locale: Locale;
  caseStudies?: ImpactCaseStudyPublic[];
  metrics?: ImpactMetricPublicItem[];
};

/**
 * Impact marketing page — static + dynamic (build spec §4).
 * Progress is narrative; case studies pull published founder stories;
 * Evidence Rule states the public publish gate.
 */
export function ImpactPageContent({
  locale,
  caseStudies = [],
  metrics = [],
}: ImpactPageContentProps) {
  const copy = impactCopyFor(locale);

  return (
    <main>
      <ImpactHero locale={locale} copy={copy.hero} />

      <ImpactProgressSection copy={copy.progress} />

      <ImpactProofNumbersSection copy={copy.proof} metrics={metrics} />

      <ImpactLensesSection lenses={copy.lenses} />

      <ImpactFanSection locale={locale} />

      <ImpactCaseStudiesSection
        locale={locale}
        copy={copy.caseStudy}
        stories={caseStudies}
      />

      <ImpactEvidenceRuleSection copy={copy.evidenceRule} />

      <PageCtaSection locale={locale} cta={copy.ctaSection} />
    </main>
  );
}
