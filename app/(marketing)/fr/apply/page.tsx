import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/apply",
  title: "Manifestez votre intérêt — ASIP",
  description:
    "Manifestez votre intérêt pour le Programme africain d’initiative pour les startups ou démarrez une candidature.",
});

export default function FrApplyPage() {
  return (
    <MarketingPageShell
      title="Manifestez votre intérêt"
      description="Parlez-nous de votre entreprise. Nous vous recontacterons avec les prochaines étapes dès l’ouverture des candidatures."
      note="Texte provisoire — à remplacer par la version française validée par Telecel. Le formulaire arrivera dans une phase ultérieure."
      ctas={[
        {
          href: publicPath("fr", "contact"),
          label: "Contacter l’équipe",
          variant: "outline",
        },
      ]}
    />
  );
}
