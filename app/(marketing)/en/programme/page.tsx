import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/programme",
  title: "Programme — ASIP",
  description:
    "How the Africa Startup Initiative Program accelerates founders through mentorship, market access and visibility.",
});

export default function EnProgrammePage() {
  return (
    <MarketingPageShell
      title="The programme"
      description="Structured acceleration, ecosystem introductions and visibility that help African technology ventures scale with credibility."
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
