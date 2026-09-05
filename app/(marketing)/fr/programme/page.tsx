import { ProgrammePageContent } from "@/components/marketing/programme-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/programme",
  title: "Programme ASIP | Comment ça marche",
  description:
    "Découvrez le parcours fondateur ASIP, les bénéfices, les critères d’éligibilité, le processus de sélection et le statut actuel des candidatures.",
});

export default function Page() {
  return <ProgrammePageContent locale="fr" />;
}
