import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/impact",
  title: "Impact — ASIP",
  description:
    "Sept ans d’impact : chiffres vérifiés et résultats des fondateurs du programme ASIP.",
});

export default function Page() {
  return <MarketingContentPage locale="fr" slug="impact" />;
}
