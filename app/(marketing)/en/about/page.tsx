import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/about",
  title: "About ASIP",
  description:
    "Learn how the Africa Startup Initiative Program supports founders across the continent.",
});

export default function EnAboutPage() {
  return (
    <MarketingPageShell
      title="About ASIP"
      description="ASIP brings Telecel Group’s network, expertise and market reach to ambitious African startups building the next chapter of the digital economy."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "impact"),
          label: "See our impact",
          variant: "outline",
        },
      ]}
    />
  );
}
