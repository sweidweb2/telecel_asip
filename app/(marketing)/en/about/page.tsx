import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "en", path: "/about", title: "About ASIP", description: "Learn about ASIP’s purpose and direction." });
export default function Page() { return <MarketingContentPage locale="en" slug="about" />; }
