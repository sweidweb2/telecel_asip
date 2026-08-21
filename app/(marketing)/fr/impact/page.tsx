import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/impact",
  title: "Impact — ASIP",
  description:
    "Résultats et témoignages du Programme africain d’initiative pour les startups dans l’écosystème technologique africain.",
});

export default function FrImpactPage() {
  return (
    <MarketingPageShell
      title="Impact"
      description="Des résultats concrets et des parcours de fondateurs qui illustrent comment ASIP renforce l’écosystème technologique africain."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "partners"),
          label: "Découvrir nos partenaires",
          variant: "outline",
        },
      ]}
    />
  );
}
