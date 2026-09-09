import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LabPageContent } from "@/components/marketing/lab-page-content";
import { getHomeImpactMetrics } from "@/data/impact-metrics";
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
          path: "/lab",
          title: "Labo de sections - ASIP",
          description: "Espace temporaire pour sections marketing.",
          noIndex: true,
        }
      : {
          locale,
          path: "/lab",
          title: "Sections lab - ASIP",
          description: "Temporary playground for marketing sections.",
          noIndex: true,
        },
  );
}

export default async function Page({ params }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const locale = await localeFromParams(params);
  const [openApplications, metrics] = await Promise.all([
    getOpenApplications(),
    getHomeImpactMetrics(),
  ]);

  return (
    <LabPageContent
      locale={locale}
      openApplications={openApplications}
      metrics={metrics}
    />
  );
}
