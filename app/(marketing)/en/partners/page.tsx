import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/partners",
  title: "Partners — ASIP",
  description:
    "Partners, mentors, and routes to collaborate with the ASIP ecosystem.",
});

export default function Page() {
  return <MarketingContentPage locale="en" slug="partners" />;
}
