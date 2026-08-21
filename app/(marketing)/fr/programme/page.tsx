import { MarketingPageShell } from "@/components/marketing/page-shell";
import { publicPath } from "@/constants/routes";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/programme",
  title: "Programme — ASIP",
  description:
    "Comment le Programme africain d’initiative pour les startups accélère les fondateurs grâce au mentorat, à l’accès marché et à la visibilité.",
});

export default function FrProgrammePage() {
  return (
    <MarketingPageShell
      title="Le programme"
      description="Une accélération structurée, des introductions dans l’écosystème et une visibilité qui aident les entreprises technologiques africaines à se développer avec crédibilité."
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
