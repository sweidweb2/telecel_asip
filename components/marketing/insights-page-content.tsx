import type { BlogLabels } from "@/components/marketing/blog-labels";
import { BlogSection } from "@/components/marketing/blog-section";
import { PageCtaSection } from "@/components/marketing/page-cta-section";
import { Section } from "@/components/marketing/page-elements";
import type { Locale } from "@/constants/locales";
import type { ArticleListItem } from "@/types/article";
import type { InsightsPageCopy } from "@/types/marketing-page";

type InsightsPageContentProps = {
  locale: Locale;
  copy: InsightsPageCopy;
  labels: BlogLabels;
  articles: ArticleListItem[];
  featured?: ArticleListItem;
};

export function InsightsPageContent({
  locale,
  copy,
  labels,
  articles,
  featured,
}: InsightsPageContentProps) {
  return (
    <main>
      <Section>
        <BlogSection
          locale={locale}
          labels={labels}
          articles={articles}
          featured={featured}
        />
      </Section>

      <PageCtaSection locale={locale} cta={copy.updates} />
    </main>
  );
}
