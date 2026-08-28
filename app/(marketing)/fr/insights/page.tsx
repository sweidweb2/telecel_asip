import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { InsightsPageContent } from "@/components/marketing/insights-page-content";
import { insightsCopyFor } from "@/constants/insights-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { getInsightsIndex } from "@/data/insights";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/insights",
  title: "Perspectives ASIP | Récits de fondateurs et avancées du portefeuille",
  description:
    "Lisez des récits de fondateurs, les actualités du portefeuille, les mises à jour du programme et des regards concrets de l’écosystème ASIP.",
});

export default async function InsightsPageFr() {
  const { articles, featured } = await getInsightsIndex("fr");
  const copy = insightsCopyFor("fr");

  return (
    <InsightsPageContent
      locale="fr"
      copy={copy}
      labels={blogLabelsFor("fr")}
      articles={articles}
      featured={featured}
    />
  );
}
