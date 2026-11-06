import type { Metadata } from "next";

import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { InsightsPageContent } from "@/components/marketing/insights-page-content";
import { getInsightsIndex } from "@/data/insights";
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
          path: "/insights",
          title:
            "Perspectives ASIP | Récits de fondateurs et avancées du portefeuille",
          description:
            "Lisez des récits de fondateurs, les actualités du portefeuille, les mises à jour du programme et des regards concrets de l’écosystème ASIP.",
        }
      : {
          locale,
          path: "/insights",
          title: "ASIP Insights | Founder Stories and Portfolio Progress",
          description:
            "Read founder stories, portfolio news, program updates and practical perspectives from across the ASIP ecosystem.",
        },
  );
}

export default async function InsightsPage({ params }: PageProps) {
  const locale = await localeFromParams(params);
  const { articles, featured } = await getInsightsIndex(locale);

  return (
    <InsightsPageContent
      locale={locale}
      labels={blogLabelsFor(locale)}
      articles={articles}
      featured={featured}
    />
  );
}
