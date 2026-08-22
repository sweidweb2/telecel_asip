import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "fr", path: "/impact", title: "Impact — ASIP", description: "Découvrez les résultats vérifiés et les parcours des fondateurs ASIP." });
export default function Page() { return <MarketingContentPage locale="fr" slug="impact" />; }
