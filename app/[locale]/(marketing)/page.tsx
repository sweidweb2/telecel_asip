import type { Metadata } from "next";

import { HomePageContent } from "@/components/marketing/home-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getOpenApplications } from "@/data/settings";
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
            "ASIP, par le Groupe Telecel, soutient les fondateurs technologiques africains avec l’expertise, les voies de capital, l’accès aux marchés et les partenaires pour bâtir et faire croître des entreprises solides.",
        }
      : {
          locale,
          path: "/",
          title: "ASIP | African Founders, Technology & Impact",
          description:
            "ASIP by Telecel Group backs African technology founders with expertise, capital pathways, market access and partners to build and scale strong businesses.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [metrics, openApplications] = await Promise.all([
    getHomeImpactMetrics(),
    getOpenApplications(),
  ]);

  return (
    <HomePageContent
      locale={locale}
      metrics={metrics}
      openApplications={openApplications}
    />
  );
}
