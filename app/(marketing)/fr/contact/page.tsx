import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/contact",
  title: "Contact — ASIP",
  description:
    "Contactez l’équipe du Programme africain d’initiative pour les startups.",
});

export default function FrContactPage() {
  return (
    <MarketingPageShell
      title="Contact"
      description="Questions sur le programme, les partenariats ou la presse — écrivez à l’équipe ASIP via les canaux ci-dessous."
      note="Texte provisoire — à remplacer par la version française validée par Telecel. Le formulaire arrivera dans une phase ultérieure."
      ctas={[
        {
          href: publicPath("fr", "faq"),
          label: "Lire la FAQ",
          variant: "outline",
        },
      ]}
    />
  );
}
