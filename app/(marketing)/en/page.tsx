import { HomePageContent } from "@/components/marketing/home-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getLatestInsights } from "@/data/insights";
import { getOpenApplications } from "@/data/settings";
import { getSpotlightStartups } from "@/data/startups";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/",
  title: "ASIP | African Founders, Technology & Impact",
  description:
    "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
});

export default async function Page() {
  const [metrics, founders, articles, openApplications] = await Promise.all([
    getHomeImpactMetrics(),
    getSpotlightStartups(5),
    getLatestInsights("en", 8),
    getOpenApplications(),
  ]);

  return (
    <HomePageContent
      locale="en"
      metrics={metrics}
      founders={founders}
      articles={articles}
      openApplications={openApplications}
    />
  );
}
