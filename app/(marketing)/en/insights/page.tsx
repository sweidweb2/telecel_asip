import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { InsightsPageContent } from "@/components/marketing/insights-page-content";
import { insightsCopyFor } from "@/constants/insights-copy";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";
import { getInsightsIndex } from "@/data/insights";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/insights",
  title: "ASIP Insights | Founder Stories and Portfolio Progress",
  description:
    "Read founder stories, portfolio news, programme updates and practical perspectives from across the ASIP ecosystem.",
});

export default async function InsightsPageEn() {
  const { articles, featured } = await getInsightsIndex("en");
  const copy = insightsCopyFor("en");

  return (
    <InsightsPageContent
      locale="en"
      copy={copy}
      labels={blogLabelsFor("en")}
      articles={articles}
      featured={featured}
    />
  );
}
