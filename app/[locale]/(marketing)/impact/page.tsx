import type { Metadata } from "next";

import { ImpactPageContent } from "@/components/marketing/impact-page-content";
import { getPublishedImpactCaseStudies } from "@/data/founder-stories";
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
          title: "Impact ASIP | Résultats vérifiés des fondateurs",
          description:
            "Découvrez des résultats ASIP fondés sur des preuves : croissance des entreprises, marchés, partenariats, emplois et usage réel des technologies.",
        }
      : {
          locale,
          path: "/impact",
          title: "ASIP Impact | Verified Founder Outcomes",
          description:
            "Explore evidence-led ASIP outcomes across company growth, markets, partnerships, jobs and real-world technology use.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const caseStudies = await getPublishedImpactCaseStudies();

  return (
    <ImpactPageContent locale={locale} caseStudies={caseStudies} />
  );
}
