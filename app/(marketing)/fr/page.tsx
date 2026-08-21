import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/",
  title: "ASIP — Programme africain d’initiative pour les startups",
  description:
    "L’initiative du Groupe Telecel qui accompagne les entreprises technologiques africaines par l’accélération, l’accès à l’écosystème et la visibilité marché.",
});

export default function FrHomePage() {
  return (
    <MarketingPageShell
      title="Programme africain d’initiative pour les startups"
      description="Une initiative du Groupe Telecel qui aide les entreprises technologiques africaines à grandir grâce à l’accélération, l’accès à l’écosystème et la visibilité sur les marchés."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "programme"),
          label: "Découvrir le programme",
        },
        {
          href: publicPath("fr", "apply"),
          label: "Manifestez votre intérêt",
          variant: "outline",
        },
      ]}
    />
  );
}
