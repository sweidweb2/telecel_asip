import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { InsightsPageContent } from "@/components/marketing/insights-page-content";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { getInsightsIndex } from "@/data/insights";
import { getNewsletterSignupEnabled } from "@/data/settings";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/insights",
  title: "ASIP Insights | Founder Stories and Portfolio Progress",
  description:
    "Read founder stories, portfolio news, programme updates and practical perspectives from across the ASIP ecosystem.",
});

export default async function InsightsPageEn() {
  const [{ articles, featured }, newsletterEnabled] = await Promise.all([
    getInsightsIndex("en"),
    getNewsletterSignupEnabled(),
  ]);

  return (
    <InsightsPageContent
      locale="en"
      labels={blogLabelsFor("en")}
      articles={articles}
      featured={featured}
      newsletterEnabled={newsletterEnabled}
    />
  );
}
