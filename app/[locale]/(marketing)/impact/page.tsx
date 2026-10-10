import type { Metadata } from "next";

import { ImpactPageContent } from "@/components/marketing/impact-page-content";
import { getPublishedImpactCaseStudies } from "@/data/founder-stories";
import { getImpactPageMetrics } from "@/data/impact-metrics";
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
          path: "/impact",
          title: "Impact ASIP | Sept ans de progrès des fondateurs",
          description:
            "Découvrez les résultats d’ASIP, appuyés par des preuves : fondateurs, marchés, emplois, partenariats et impact porté par la technologie.",
        }
      : {
          locale,
          path: "/impact",
          title: "ASIP Impact | Seven Years of Founder Progress",
          description:
            "See evidence-led ASIP outcomes across founders, markets, jobs, partnerships and technology-led impact.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [caseStudies, metrics] = await Promise.all([
    getPublishedImpactCaseStudies(),
    getImpactPageMetrics(),
  ]);

  return (
    <ImpactPageContent
      locale={locale}
      caseStudies={caseStudies}
      metrics={metrics}
    />
  );
}
