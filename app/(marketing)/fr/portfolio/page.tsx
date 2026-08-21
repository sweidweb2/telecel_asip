import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "fr", path: "/portfolio", title: "Portefeuille — ASIP", description: "Découvrez les entreprises de l’écosystème ASIP." });
export default function Page() { return <MarketingContentPage locale="fr" slug="portfolio" />; }
