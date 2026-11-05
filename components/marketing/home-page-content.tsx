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
import { MarqueeStrip } from "@/components/marketing/marquee-strip";
import { MobilePathwayBar } from "@/components/marketing/mobile-pathway-bar";
import { JsonLd } from "@/components/seo/json-ld";
import { homeCopyFor } from "@/constants/home-copy";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import type { IntakeCta } from "@/lib/marketing/intake-cta";
import { localeUrl } from "@/lib/seo/alternates";
import type { ImpactMetricPublicItem } from "@/types/impact-metric";

const HomePlatformModelSection = dynamic(() =>
  import("@/components/marketing/home-platform-model-section").then(
    (m) => m.HomePlatformModelSection,
  ),
);

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
  /** ISO country codes with active portfolio startups, for the ticker. */
  portfolioCountries: string[];
  /** Below-fold insights — owned by the home route so `data/` stays out of components. */
  latestInsights: ReactNode;
};

export function HomePageContent({
  locale,
  metrics,
  intake,
  portfolioCountries,
  latestInsights,
}: HomePageContentProps) {
  const copy = homeCopyFor(locale);
  const countryNames = new Intl.DisplayNames([locale], { type: "region" });
  const countries = portfolioCountries
    .map((code) => countryNames.of(code) ?? code)
    .sort((a, b) => a.localeCompare(b, locale));

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

      <HomeHero
        locale={locale}
        copy={copy.hero}
        pathways={copy.pathways}
        intake={intake}
      />

      <HomeCohortFilmSection copy={copy.cohortFilm} />

      <MarqueeStrip items={countries} label={copy.portfolioMarqueeLabel} />

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
        pathways={copy.pathways}
        intake={intake}
      />

      {latestInsights}

      <MobilePathwayBar
        prompt={copy.pathways.prompt}
        investor={{
          href: publicPath(locale, copy.pathways.investor.slug),
          label: copy.pathways.investor.label,
        }}
        startup={{ href: intake.href, label: copy.pathways.startupLabel }}
      />
    </main>
  );
}
