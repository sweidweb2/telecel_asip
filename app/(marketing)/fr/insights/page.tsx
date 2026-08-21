import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/insights",
  title: "Perspectives — ASIP",
  description:
    "Articles, actualités et études de cas du Programme africain d’initiative pour les startups.",
});

export default function FrInsightsPage() {
  return (
    <MarketingPageShell
      title="Perspectives"
      description="Articles, actualités du programme et études de cas issus de la communauté ASIP."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "portfolio"),
          label: "Parcourir le portefeuille",
          variant: "outline",
        },
      ]}
    />
  );
}
