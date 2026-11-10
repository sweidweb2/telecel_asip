import type { ReactNode } from "react";

import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";
import { HomeAfricaMap } from "@/components/marketing/home-africa-map";
import { HomeHero } from "@/components/marketing/home-hero";
import {
  HomeAiAdvantageSection,
  HomeClosingSection,
  HomeEcosystemValueSection,
  HomeFounderStoriesSection,
  HomeImpactBand,
  HomePathwaysSection,
  HomeProofStrip,
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
 * Homepage order from the Final Design Brief / Text Pack v2 (08.11.2026):
 * hero + two routes → 2026 AI Advantage → proof → founder / investor
 * pathways → founder stories → impact → footprint map → ecosystem →
 * current activity → closing status CTA.
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

      <HomeAiAdvantageSection locale={locale} copy={copy.ai} intake={intake} />

      <HomeProofStrip copy={copy.proof} metrics={metrics} />

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

      <HomeImpactBand locale={locale} copy={copy.impact} />

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
