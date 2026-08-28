import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

// Dormant until official cohort dates and criteria are confirmed; Register
// Interest is the live CTA, so this page stays unlisted and unindexed.
export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/apply",
  title: "Apply — ASIP",
  description: "Prepare and share your ASIP venture profile.",
  noIndex: true,
});

export default function Page() {
  return <MarketingContentPage locale="en" slug="apply" />;
}
