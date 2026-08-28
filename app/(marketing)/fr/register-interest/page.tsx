import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/register-interest",
  title: "Manifester votre intérêt | ASIP",
  description:
    "Inscrivez-vous pour recevoir les dates de candidature confirmées d’ASIP, les critères d’éligibilité et les mises à jour du programme dès leur annonce.",
});

export default function Page() {
  return <MarketingContentPage locale="fr" slug="register-interest" />;
}
