import { HomePageContent } from "@/components/marketing/home-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getLatestInsights } from "@/data/insights";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/",
  title: "ASIP | Fondateurs africains, technologie et impact",
  description:
    "ASIP, par le Groupe Telecel, relie les fondateurs technologiques africains à l’expertise, aux voies de capital, aux marchés et aux partenaires pour bâtir et faire croître des entreprises solides.",
});

export default async function Page() {
  const [metrics, articles, openApplications] = await Promise.all([
    getHomeImpactMetrics(),
    getLatestInsights("fr", 8),
    getOpenApplications(),
  ]);

  return (
    <HomePageContent
      locale="fr"
      metrics={metrics}
      articles={articles}
      openApplications={openApplications}
    />
  );
}
