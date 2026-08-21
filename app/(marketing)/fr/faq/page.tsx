import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/faq",
  title: "FAQ — ASIP",
  description:
    "Questions fréquentes sur le Programme africain d’initiative pour les startups.",
});

export default function FrFaqPage() {
  return (
    <MarketingPageShell
      title="FAQ"
      description="Réponses aux questions courantes sur l’éligibilité, le calendrier et le fonctionnement d’ASIP avec les fondateurs et les partenaires."
      note="Texte provisoire — à remplacer par la version française validée par Telecel."
      ctas={[
        {
          href: publicPath("fr", "apply"),
          label: "Manifestez votre intérêt",
        },
      ]}
    />
  );
}
