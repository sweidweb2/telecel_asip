import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/faq",
  title: "FAQ — ASIP",
  description:
    "Frequently asked questions about the Africa Startup Initiative Program.",
});

export default function EnFaqPage() {
  return (
    <MarketingPageShell
      title="FAQ"
      description="Answers to common questions about eligibility, timelines and how ASIP works with founders and partners."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "apply"),
          label: "Register interest",
        },
      ]}
    />
  );
}
