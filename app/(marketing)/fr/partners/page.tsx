import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
export const metadata = buildMarketingMetadata({ locale: "fr", path: "/partners", title: "Partenaires — ASIP", description: "Découvrez l’écosystème qui accompagne les fondateurs ASIP." });
export default function Page() { return <MarketingContentPage locale="fr" slug="partners" />; }
