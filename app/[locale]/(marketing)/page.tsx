import type { Metadata } from "next";

import { HomePageContent } from "@/components/marketing/home-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getLatestInsights } from "@/data/insights";
import { getOpenApplications } from "@/data/settings";
import { getActiveStartupCountryReach } from "@/data/startups";
import { localeFromParams } from "@/lib/i18n/locale-params";
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
          title: "ASIP | Fondateurs africains, technologie et impact",
          description:
            "ASIP, par le Groupe Telecel, relie les fondateurs technologiques africains à l’expertise, aux voies de capital, aux marchés et aux partenaires pour bâtir et faire croître des entreprises solides.",
        }
      : {
          locale,
          path: "/",
          title: "ASIP | African Founders, Technology & Impact",
          description:
            "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [metrics, articles, openApplications, countryReach] = await Promise.all([
    getHomeImpactMetrics(),
    getLatestInsights(locale, 8),
    getOpenApplications(),
    getActiveStartupCountryReach(),
  ]);

  return (
    <HomePageContent
      locale={locale}
      metrics={metrics}
      articles={articles}
      openApplications={openApplications}
      countryReach={countryReach}
    />
  );
}
