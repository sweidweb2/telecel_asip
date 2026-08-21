import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/portfolio",
  title: "Portefeuille — ASIP",
  description:
    "Explorez les startups accompagnées par le Programme africain d’initiative pour les startups, par cohorte, pays et secteur.",
});

export default function FrPortfolioPage() {
  return (
    <MarketingPageShell
      title="Portefeuille"
      description="Une archive vivante des entreprises accompagnées par ASIP — filtrable par cohorte, pays et secteur à mesure que la plateforme s’enrichit."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "insights"),
          label: "Lire les perspectives",
          variant: "outline",
        },
      ]}
    />
  );
}
