import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/apply",
  title: "Register interest — ASIP",
  description:
    "Register your interest in the Africa Startup Initiative Program or start an application.",
});

export default function EnApplyPage() {
  return (
    <MarketingPageShell
      title="Register interest"
      description="Tell us about your venture. We will follow up with next steps for the programme when applications are open."
      note="Placeholder copy — replace with Telecel-approved English when supplied. Form wiring comes in a later phase."
      ctas={[
        {
          href: publicPath("en", "contact"),
          label: "Contact the team",
          variant: "outline",
        },
      ]}
    />
  );
}
