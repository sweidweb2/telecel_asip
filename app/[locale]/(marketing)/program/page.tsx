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
          title: "Programme ASIP | Construire l’avantage IA",
          description:
            "Découvrez le fonctionnement d’ASIP, ce que les fondateurs y gagnent, l’orientation IA 2026, l’éligibilité et le statut actuel des candidatures.",
        }
      : {
          locale,
          path: "/program",
          title: "ASIP Programme | Building the AI Advantage",
          description:
            "See how ASIP works, what founders gain, the 2026 AI direction, eligibility guidance and current application status.",
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
