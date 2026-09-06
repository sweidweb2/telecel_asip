import { LabPageContent } from "@/components/marketing/lab-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/lab",
  title: "Labo de sections — ASIP",
  description: "Espace temporaire pour sections marketing.",
  noIndex: true,
});

export default async function Page() {
  const [openApplications, metrics] = await Promise.all([
    getOpenApplications(),
    getHomeImpactMetrics(),
  ]);

  return (
    <LabPageContent
      locale="fr"
      openApplications={openApplications}
      metrics={metrics}
    />
  );
}
