import { LabPageContent } from "@/components/marketing/lab-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/lab",
  title: "Sections lab — ASIP",
  description: "Temporary playground for marketing sections.",
  noIndex: true,
});

export default async function Page() {
  const [openApplications, metrics] = await Promise.all([
    getOpenApplications(),
    getHomeImpactMetrics(),
  ]);

  return (
    <LabPageContent
      locale="en"
      openApplications={openApplications}
      metrics={metrics}
    />
  );
}
