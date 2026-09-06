import { HomePageContent } from "@/components/marketing/home-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getLatestInsights } from "@/data/insights";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/",
  title: "ASIP | African Founders, Technology & Impact",
  description:
    "ASIP by Telecel Group connects African technology founders to expertise, capital pathways, markets and partners to build and scale strong businesses.",
});

export default async function Page() {
  const [metrics, articles, openApplications] = await Promise.all([
    getHomeImpactMetrics(),
    getLatestInsights("en", 8),
    getOpenApplications(),
  ]);

  return (
    <HomePageContent
      locale="en"
      metrics={metrics}
      articles={articles}
      openApplications={openApplications}
    />
  );
}
