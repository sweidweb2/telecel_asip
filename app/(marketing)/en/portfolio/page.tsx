import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "en", path: "/portfolio", title: "Portfolio — ASIP", description: "Discover ventures across the ASIP ecosystem." });
export default function Page() { return <MarketingContentPage locale="en" slug="portfolio" />; }
