import { blogLabelsFor } from "@/components/marketing/blog-labels";
import { BlogSection } from "@/components/marketing/blog-section";
import { buildMarketingMetadata } from "@/lib/seo/marketing-metadata";

export const metadata = buildMarketingMetadata({
  locale: "fr",
  path: "/insights",
  title: "Perspectives — ASIP",
  description:
    "Articles, actualités et études de cas du Programme africain d’initiative pour les startups.",
});

export default function FrInsightsPage() {
  return <BlogSection labels={blogLabelsFor("fr")} />;
}
