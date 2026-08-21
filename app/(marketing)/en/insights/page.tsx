import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/insights",
  title: "Insights — ASIP",
  description:
    "Articles, updates and case studies from the Africa Startup Initiative Program.",
});

export default function EnInsightsPage() {
  return (
    <MarketingPageShell
      title="Insights"
      description="Articles, programme updates and case studies from across the ASIP community."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "portfolio"),
          label: "Browse the portfolio",
          variant: "outline",
        },
      ]}
    />
  );
}
