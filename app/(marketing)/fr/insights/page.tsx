import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { InsightsPageContent } from "@/components/marketing/insights-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { getInsightsIndex } from "@/data/insights";
import { getNewsletterSignupEnabled } from "@/data/settings";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/insights",
  title: "Perspectives ASIP | Récits de fondateurs et avancées du portefeuille",
  description:
    "Lisez des récits de fondateurs, les actualités du portefeuille, les mises à jour du programme et des regards concrets de l’écosystème ASIP.",
});

export default async function InsightsPageFr() {
  const [{ articles, featured }, newsletterEnabled] = await Promise.all([
    getInsightsIndex("fr"),
    getNewsletterSignupEnabled(),
  ]);

  return (
    <InsightsPageContent
      locale="fr"
      labels={blogLabelsFor("fr")}
      articles={articles}
      featured={featured}
      newsletterEnabled={newsletterEnabled}
    />
  );
}
