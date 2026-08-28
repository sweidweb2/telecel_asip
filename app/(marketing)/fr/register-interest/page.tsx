import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/register-interest",
  title: "Manifester votre intérêt — ASIP",
  description:
    "Présentez à ASIP votre équipe, votre entreprise technologique, votre marché et votre stade actuel.",
});

export default function Page() {
  return <MarketingContentPage locale="fr" slug="register-interest" />;
}
