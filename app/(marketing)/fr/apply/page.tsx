import { MarketingContentPage } from "@/components/marketing/marketing-content-page";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

// Dormant until official cohort dates and criteria are confirmed; Register
// Interest is the live CTA, so this page stays unlisted and unindexed.
export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/apply",
  title: "Candidater — ASIP",
  description: "Préparez et présentez le profil de votre entreprise à ASIP.",
  noIndex: true,
});

export default function Page() {
  return <MarketingContentPage locale="fr" slug="apply" />;
}
