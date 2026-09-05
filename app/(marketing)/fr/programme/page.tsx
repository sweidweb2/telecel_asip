import { ProgrammePageContent } from "@/components/marketing/programme-page-content";
import { getPublishedCohorts } from "@/data/cohorts";
import { getOpenApplications } from "@/data/settings";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/programme",
  title: "Programme ASIP | Comment ça marche",
  description:
    "Découvrez le parcours fondateur ASIP, les bénéfices, les critères d’éligibilité, le processus de sélection et le statut actuel des candidatures.",
});

export default async function Page() {
  const [cohorts, openApplications] = await Promise.all([
    getPublishedCohorts(),
    getOpenApplications(),
  ]);

  return (
    <ProgrammePageContent
      locale="fr"
      cohorts={cohorts}
      openApplications={openApplications}
    />
  );
}
