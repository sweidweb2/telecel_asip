import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeLatestInsightsFallback } from "@/components/marketing/home-latest-insights-fallback";
import { HomePageContent } from "@/components/marketing/home-page-content";
import { HomeLatestInsightsLoader } from "./home-latest-insights-loader";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getOpenApplications } from "@/data/settings";
import {
  getActiveStartupFilterOptions,
  getActiveStartupsPage,
} from "@/data/startups";
import { getCurrentUserProfile } from "@/data/users";
import { localeFromParams } from "@/lib/i18n/locale-params";
import {
  marketingAudienceFor,
  roleIntakeCtaFor,
  rolePrimaryCtaFor,
} from "@/lib/marketing/role-primary-cta";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return buildMarketingMetadata(
    locale === "fr"
      ? {
          locale,
          path: "/",
          title: "ASIP | Fondateurs africains, IA et croissance des startups",
          description:
            "Découvrez ASIP, le programme fondateurs du Groupe Telecel pour les entreprises technologiques africaines : expertise concrète, accès aux marchés, preuves du portefeuille et activité IA 2026.",
        }
      : {
          locale,
          path: "/",
          title: "ASIP | African Founders, AI & Startup Growth",
          description:
            "Explore ASIP, Telecel Group's founder program for African technology ventures, with practical expertise, market access, portfolio proof and 2026 AI activity.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [metrics, openApplications, profile, filterOptions, firstPage] =
    await Promise.all([
      getHomeImpactMetrics(),
      getOpenApplications(),
      getCurrentUserProfile(),
      // Map + investor counts are additive: a failed read hides them, not the page.
      getActiveStartupFilterOptions().catch(() => null),
      // Founder stories: published portfolio, featured first. Hidden if empty.
      getActiveStartupsPage(1).catch(() => null),
    ]);
  const intake = roleIntakeCtaFor({ locale, openApplications, profile });
  const primaryCta = rolePrimaryCtaFor({ locale, openApplications, profile });
  const audience = marketingAudienceFor(profile);
  const portfolioCountries = filterOptions?.countries ?? [];
  // Featured first; the section then prefers companies with real imagery.
  const featuredStartups = [...(firstPage?.items ?? [])].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );
  // Live counts of the published portfolio (not cleared impact claims).
  const portfolioStats =
    firstPage && filterOptions
      ? {
          companies: firstPage.total,
          markets: filterOptions.countries.length,
          sectors: filterOptions.sectors.length,
        }
      : null;

  return (
    <HomePageContent
      locale={locale}
      metrics={metrics}
      intake={intake}
      primaryCta={primaryCta}
      audience={audience}
      portfolioCountries={portfolioCountries}
      featuredStartups={featuredStartups}
      portfolioStats={portfolioStats}
      latestInsights={
        <Suspense fallback={<HomeLatestInsightsFallback locale={locale} />}>
          <HomeLatestInsightsLoader locale={locale} />
        </Suspense>
      }
    />
  );
}
