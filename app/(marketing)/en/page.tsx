import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/",
  title: "ASIP — Africa Startup Initiative Program",
  description:
    "Telecel Group’s programme supporting African technology ventures through acceleration, ecosystem access and market visibility.",
});

export default function EnHomePage() {
  return (
    <MarketingPageShell
      title="Africa Startup Initiative Program"
      description="A Telecel Group initiative helping African technology ventures grow through acceleration, ecosystem access and market visibility."
      note="Placeholder copy — replace with Telecel-approved English when supplied."
      ctas={[
        {
          href: publicPath("en", "programme"),
          label: "Explore the programme",
        },
        {
          href: publicPath("en", "apply"),
          label: "Register interest",
          variant: "outline",
        },
      ]}
    />
  );
}
