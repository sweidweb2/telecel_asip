import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/partners",
  title: "Partners — ASIP",
  description:
    "Organisations collaborating with the Africa Startup Initiative Program to support African founders.",
});

export default function EnPartnersPage() {
  return (
    <MarketingPageShell
      title="Partners"
      description="Ecosystem collaborators who help ASIP open doors — from mentorship and markets to capital and media."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "contact"),
          label: "Partner with us",
          variant: "outline",
        },
      ]}
    />
  );
}
