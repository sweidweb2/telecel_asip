import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/about",
  title: "À propos d’ASIP",
  description:
    "Découvrez comment le Programme africain d’initiative pour les startups accompagne les fondateurs à travers le continent.",
});

export default function FrAboutPage() {
  return (
    <MarketingPageShell
      title="À propos d’ASIP"
      description="ASIP met le réseau, l’expertise et la portée marché du Groupe Telecel au service de startups africaines ambitieuses qui construisent la suite de l’économie numérique."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "impact"),
          label: "Voir notre impact",
          variant: "outline",
        },
      ]}
    />
  );
}
