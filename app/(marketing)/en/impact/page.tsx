import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/impact",
  title: "Impact — ASIP",
  description:
    "Outcomes and stories from the Africa Startup Initiative Program across Africa’s technology ecosystem.",
});

export default function EnImpactPage() {
  return (
    <MarketingPageShell
      title="Impact"
      description="Measured outcomes and founder stories that show how ASIP strengthens Africa’s technology ecosystem."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "partners"),
          label: "Meet our partners",
          variant: "outline",
        },
      ]}
    />
  );
}
