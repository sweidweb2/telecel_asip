import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/impact",
  title: "Impact — ASIP",
  description:
    "Seven years of impact: verified proof points and founder outcomes from the ASIP programme.",
});

export default function Page() {
  return <MarketingContentPage locale="en" slug="impact" />;
}
