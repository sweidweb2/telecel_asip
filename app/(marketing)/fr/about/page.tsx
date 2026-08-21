import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "fr", path: "/about", title: "À propos d’ASIP", description: "Découvrez la mission et l’orientation d’ASIP." });
export default function Page() { return <MarketingContentPage locale="fr" slug="about" />; }
