import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "en", path: "/impact", title: "Impact — ASIP", description: "Explore verified ASIP outcomes and founder stories." });
export default function Page() { return <MarketingContentPage locale="en" slug="impact" />; }
