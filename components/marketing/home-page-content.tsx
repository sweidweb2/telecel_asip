import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HomeCohortFilmSection } from "@/components/marketing/home-cohort-film-section";
import { HomeEcosystemSection } from "@/components/marketing/home-ecosystem-section";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeImpactYearsSection } from "@/components/marketing/home-impact-years-section";
import { HomeNextChapterSection } from "@/components/marketing/home-next-chapter-section";
import { HomeOutcomesSection } from "@/components/marketing/home-outcomes-section";
import { HomeTelecelConnectionSection } from "@/components/marketing/home-telecel-connection-section";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import { localeUrl } from "@/lib/seo/alternates";

const HomePlatformModelSection = dynamic(() =>
  import("@/components/marketing/home-platform-model-section").then(
    (m) => m.HomePlatformModelSection,
  ),
);

type HomeImpactMetric = {
  id: string;
  claim_label: string;
  value: string;
  unit: string | null;
  period_start?: string | null;
  period_end?: string | null;
};

type HomePageContentProps = {
  locale: Locale;
  metrics: HomeImpactMetric[];
  openApplications: boolean;
  /** Below-fold insights — owned by the home route so `data/` stays out of components. */
  latestInsights: ReactNode;
};

export function HomePageContent({
  locale,
  metrics,
  openApplications,
  latestInsights,
}: HomePageContentProps) {
  const copy = homeCopyFor(locale);
  const intake = intakeCtaFor(locale, openApplications);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Africa Startup Initiative Program",
          alternateName: "ASIP",
          url: localeUrl(locale),
          description:
            "ASIP by Telecel Group backs African technology founders with expertise, capital pathways, market access and partners.",
          parentOrganization: {
            "@type": "Organization",
            name: "Telecel Group",
            url: TELECEL_GROUP_URL,
          },
        }}
      />

      <HomeHero locale={locale} copy={copy.hero} intake={intake} />

      <HomeCohortFilmSection copy={copy.cohortFilm} />

      <HomeImpactYearsSection copy={copy.impactYears} metrics={metrics} />

      <HomePlatformModelSection copy={copy.platform} />

      <HomeOutcomesSection
        locale={locale}
        copy={copy.outcomes}
        intake={intake}
      />

      <HomeEcosystemSection locale={locale} copy={copy.ecosystem} />

      <HomeTelecelConnectionSection copy={copy.telecel} />

      <HomeNextChapterSection
        locale={locale}
        copy={copy.nextChapter}
        intake={intake}
      />

      {latestInsights}
    </main>
  );
}
