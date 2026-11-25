import type { ReactNode } from "react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HomeAfricaMap } from "@/components/marketing/home-africa-map";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeImpactYearsSection } from "@/components/marketing/home-impact-years-section";
import {
  HomeAiAdvantageSection,
  HomeClosingSection,
  HomeEcosystemValueSection,
  HomeFounderStoriesSection,
  HomePathwaysSection,
  type PortfolioStats,
} from "@/components/marketing/home-v2-sections";
import { MobilePathwayBar } from "@/components/marketing/mobile-pathway-bar";
import { JsonLd } from "@/components/seo/json-ld";
import { homeV2CopyFor } from "@/constants/home-v2-copy";
import type { Locale } from "@/constants/locales";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { localeUrl } from "@/lib/seo/alternates";
import type { ImpactMetricPublicItem } from "@/types/impact-metric";
import type { StartupPublicListItem } from "@/types/startup";

type HomeImpactMetric = Pick<
  ImpactMetricPublicItem,
  "id" | "claim_label" | "value" | "unit"
> & {
  period_start?: string | null;
  period_end?: string | null;
};

type HomePageContentProps = {
  locale: Locale;
  metrics: HomeImpactMetric[];
  intake: IntakeCta;
  /** ISO country codes with active portfolio startups (verified presence). */
  portfolioCountries: string[];
  /** Featured, published portfolio companies for founder stories. */
  featuredStartups: StartupPublicListItem[];
  /** Live counts of the published portfolio for the investor pathway. */
  portfolioStats: PortfolioStats | null;
  /** Below-fold insights — owned by the home route so `data/` stays out of components. */
  latestInsights: ReactNode;
};

/**
 * Homepage order:
 * hero → impact years (kite + escalator) → 2026 AI Advantage →
 * founder / investor pathways → founder stories → footprint map →
 * ecosystem → current activity → closing status CTA.
 */
export function HomePageContent({
  locale,
  metrics,
  intake,
  portfolioCountries,
  featuredStartups,
  portfolioStats,
  latestInsights,
}: HomePageContentProps) {
  const copy = homeV2CopyFor(locale);

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
            "ASIP helps ambitious technology founders build stronger companies through practical expertise, market access and an ecosystem of investors, operators and partners.",
          parentOrganization: {
            "@type": "Organization",
            name: "Telecel Group",
            url: TELECEL_GROUP_URL,
          },
        }}
      />

      <HomeHero copy={copy.hero} continuumAlts={copy.hero.continuumAlts} />

      <HomeImpactYearsSection
        locale={locale}
        copy={copy.impact}
        metrics={metrics}
      />

      <HomeAiAdvantageSection locale={locale} copy={copy.ai} intake={intake} />

      <HomePathwaysSection
        locale={locale}
        founder={copy.founder}
        investor={copy.investor}
        intake={intake}
        stats={portfolioStats}
      />

      <HomeFounderStoriesSection
        locale={locale}
        copy={copy.stories}
        startups={featuredStartups}
      />

      <HomeAfricaMap
        locale={locale}
        copy={copy.map}
        portfolioCountries={portfolioCountries}
      />

      <HomeEcosystemValueSection locale={locale} copy={copy.ecosystem} />

      {latestInsights}

      <HomeClosingSection locale={locale} copy={copy.closing} intake={intake} />

      <MobilePathwayBar
        prompt={copy.hero.prompt}
        investor={{ href: "#investors", label: copy.hero.investor.label }}
        startup={{ href: "#founders", label: copy.hero.founder.label }}
      />
    </main>
  );
}
