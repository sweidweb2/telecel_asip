import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/portfolio",
  title: "Portfolio — ASIP",
  description:
    "Explore startups supported by the Africa Startup Initiative Program across cohorts, countries and sectors.",
});

export default function EnPortfolioPage() {
  return (
    <MarketingPageShell
      title="Portfolio"
      description="A living archive of ventures supported by ASIP — filterable by cohort, country and sector as the platform grows."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "insights"),
          label: "Read insights",
          variant: "outline",
        },
      ]}
    />
  );
}
