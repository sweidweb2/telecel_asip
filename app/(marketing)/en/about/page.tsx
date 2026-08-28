import { AboutPageContent } from "@/components/marketing/about-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/about",
  title: "About ASIP | From African Innovation to Global Opportunity",
  description:
    "Discover ASIP’s 2019 origin, mission and journey helping African technology founders connect to expertise, markets and opportunity.",
});

export default function Page() {
  return <AboutPageContent locale="en" copy={marketingCopyFor("en", "about")} />;
}
