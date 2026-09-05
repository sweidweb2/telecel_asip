import { ImpactPageContent } from "@/components/marketing/impact-page-content";
import { getImpactPageMetrics } from "@/data/impact-metrics";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/impact",
  title: "Impact ASIP | Sept ans de progrès des fondateurs",
  description:
    "Découvrez les résultats d’ASIP, appuyés par des preuves : fondateurs, marchés, emplois, partenariats et impact porté par la technologie.",
});

export default async function Page() {
  const metrics = await getImpactPageMetrics();

  return <ImpactPageContent locale="fr" metrics={metrics} />;
}
