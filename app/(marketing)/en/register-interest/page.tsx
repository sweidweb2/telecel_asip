import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/register-interest",
  title: "Register interest — ASIP",
  description:
    "Tell ASIP about your team, technology venture, market, and current stage.",
});

export default function Page() {
  return <MarketingContentPage locale="en" slug="register-interest" />;
}
