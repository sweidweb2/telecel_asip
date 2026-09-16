import dynamic from "next/dynamic";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HomeEcosystemSection } from "@/components/marketing/home-ecosystem-section";
import { HomeFounderSpotlightSection } from "@/components/marketing/home-founder-spotlight-section";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeImpactYearsSection } from "@/components/marketing/home-impact-years-section";
import { HomeNextChapterSection } from "@/components/marketing/home-next-chapter-section";
import { HomeOutcomesSection } from "@/components/marketing/home-outcomes-section";
import { HomeTelecelConnectionSection } from "@/components/marketing/home-telecel-connection-section";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { localeUrl } from "@/lib/seo/alternates";
import type { ArticleListItem } from "@/types/article";
import type { StartupCountryReach } from "@/data/startups";

const HomePlatformModelSection = dynamic(() =>
  import("@/components/marketing/home-platform-model-section").then(
    (m) => m.HomePlatformModelSection,
  ),
);

const HomeLatestInsightsSection = dynamic(() =>
  import("@/components/marketing/home-latest-insights-section").then(
    (m) => m.HomeLatestInsightsSection,
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
  articles: ArticleListItem[];
  openApplications: boolean;
  countryReach: StartupCountryReach[];
};

export function HomePageContent({
  locale,
  metrics,
  articles,
  openApplications,
  countryReach,
}: HomePageContentProps) {
  const copy = homeCopyFor(locale);

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
            "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners.",
          parentOrganization: {
            "@type": "Organization",
            name: "Telecel Group",
            url: TELECEL_GROUP_URL,
          },
        }}
      />

      <HomeHero
        locale={locale}
        copy={copy.hero}
        openApplications={openApplications}
      />

      <HomeImpactYearsSection copy={copy.impactYears} metrics={metrics} />

      <HomePlatformModelSection copy={copy.platform} />

      <HomeFounderSpotlightSection
        locale={locale}
        copy={copy.founders}
        countryReach={countryReach}
      />

      <HomeOutcomesSection
        locale={locale}
        copy={copy.outcomes}
        openApplications={openApplications}
      />

      <HomeEcosystemSection locale={locale} copy={copy.ecosystem} />

      <HomeTelecelConnectionSection copy={copy.telecel} />

      <HomeNextChapterSection
        locale={locale}
        copy={copy.nextChapter}
        openApplications={openApplications}
      />

      <HomeLatestInsightsSection
        locale={locale}
        copy={copy.latest}
        articles={articles}
      />
    </main>
  );
}
