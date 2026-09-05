import { ImpactPageContent } from "@/components/marketing/impact-page-content";
import { getImpactPageMetrics } from "@/data/impact-metrics";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/impact",
  title: "ASIP Impact | Seven Years of Founder Progress",
  description:
    "See evidence-led ASIP outcomes across founders, markets, jobs, partnerships and technology-led impact.",
});

export default async function Page() {
  const metrics = await getImpactPageMetrics();

  return <ImpactPageContent locale="en" metrics={metrics} />;
}
