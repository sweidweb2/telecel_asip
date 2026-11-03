import type { Metadata } from "next";

import { ProgrammePageContent } from "@/components/marketing/programme-page-content";
import { getPublishedCohorts } from "@/data/cohorts";
import { getOpenApplications } from "@/data/settings";
import { localeFromParams } from "@/lib/i18n/locale-params";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return buildMarketingMetadata(
    locale === "fr"
      ? {
          locale,
          path: "/program",
          title: "Programme ASIP | Comment ça marche",
          description:
            "Découvrez le parcours fondateur ASIP, les bénéfices, les critères d’éligibilité, le processus de sélection et le statut actuel des candidatures.",
        }
      : {
          locale,
          path: "/program",
          title: "ASIP Program | How It Works",
          description:
            "Explore the ASIP founder journey, benefits, eligibility, selection process and current application status.",
        },
  );
}

export default async function Page({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const [cohorts, openApplications] = await Promise.all([
    getPublishedCohorts(),
    getOpenApplications(),
  ]);

  return (
    <ProgrammePageContent
      locale={locale}
      cohorts={cohorts}
      openApplications={openApplications}
    />
  );
}
