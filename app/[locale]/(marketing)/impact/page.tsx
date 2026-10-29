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
          title: "Impact ASIP | Le progrès des fondateurs, avec un dossier",
          description:
            "Découvrez les résultats d’ASIP, appuyés par des preuves : fondateurs, marchés, emplois, partenariats et impact porté par la technologie.",
        }
      : {
          locale,
          path: "/impact",
          title: "ASIP Impact | Founder progress, with a paper trail",
          description:
            "See evidence-led ASIP outcomes across founders, markets, jobs, partnerships and technology-led impact.",
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
