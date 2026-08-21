import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/contact",
  title: "Contact — ASIP",
  description:
    "Get in touch with the Africa Startup Initiative Program team.",
});

export default function EnContactPage() {
  return (
    <MarketingPageShell
      title="Contact"
      description="Questions about the programme, partnerships or press — reach the ASIP team through the channels below."
      note="Placeholder copy — replace with Telecel-approved English when supplied. Form wiring comes in a later phase."
      ctas={[
        {
          href: publicPath("en", "faq"),
          label: "Read the FAQ",
          variant: "outline",
        },
      ]}
    />
  );
}
