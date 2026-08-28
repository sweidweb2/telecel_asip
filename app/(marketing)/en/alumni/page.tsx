import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/alumni",
  title: "Alumni network — ASIP",
  description:
    "The ASIP alumni network keeps founders connected to peers, mentors, and opportunities after their cohort.",
  noIndex: true,
});

export default function Page() {
  return <MarketingContentPage locale="en" slug="alumni" />;
}
