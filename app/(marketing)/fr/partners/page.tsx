import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/partners",
  title: "Partenaires — ASIP",
  description:
    "Organisations qui collaborent avec le Programme africain d’initiative pour les startups pour soutenir les fondateurs africains.",
});

export default function FrPartnersPage() {
  return (
    <MarketingPageShell
      title="Partenaires"
      description="Des acteurs de l’écosystème qui aident ASIP à ouvrir des portes — mentorat, marchés, capital et médias."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "contact"),
          label: "Devenir partenaire",
          variant: "outline",
        },
      ]}
    />
  );
}
