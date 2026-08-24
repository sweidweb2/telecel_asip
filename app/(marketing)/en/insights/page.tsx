import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { BlogSection } from "@/components/marketing/blog-section";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "en",
  path: "/insights",
  title: "Insights — ASIP",
  description:
    "Articles, updates and case studies from the Africa Startup Initiative Program.",
});

export default function EnInsightsPage() {
  return <BlogSection locale="en" labels={blogLabelsFor("en")} />;
}
