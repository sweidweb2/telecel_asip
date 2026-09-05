import { HomePageContent } from "@/components/marketing/home-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getLatestInsights } from "@/data/insights";
import { getOpenApplications } from "@/data/settings";
import { getSpotlightStartups } from "@/data/startups";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/",
  title: "ASIP | Fondateurs africains, technologie et impact",
  description:
    "ASIP, par le Groupe Telecel, relie les fondateurs technologiques africains à l’expertise, aux voies de capital, aux marchés et aux partenaires pour bâtir et faire croître des entreprises solides.",
});

export default async function Page() {
  const [metrics, founders, articles, openApplications] = await Promise.all([
    getHomeImpactMetrics(),
    getSpotlightStartups(5),
    getLatestInsights("fr", 8),
    getOpenApplications(),
  ]);

  return (
    <HomePageContent
      locale="fr"
      metrics={metrics}
      founders={founders}
      articles={articles}
      openApplications={openApplications}
    />
  );
}
