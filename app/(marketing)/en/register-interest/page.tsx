import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/register-interest",
  title: "Register Interest | ASIP",
  description:
    "Register to receive confirmed ASIP application dates, eligibility criteria and programme updates when announced.",
});

export default function Page() {
  return <MarketingContentPage locale="en" slug="register-interest" />;
}
