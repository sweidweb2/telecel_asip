import type { BlogLabels } from "@/components/marketing/blog-labels";
import { BlogSection } from "@/components/marketing/blog-section";
import { newsletterSignupLabelsFor } from "@/components/marketing/newsletter-signup-labels";
import { NewsletterSignupSection } from "@/components/marketing/newsletter-signup-section";
import { Section } from "@/components/marketing/page-elements";
import type { Locale } from "@/constants/locales";
import type { ArticleListItem } from "@/types/article";

type InsightsPageContentProps = {
  locale: Locale;
  labels: BlogLabels;
  articles: ArticleListItem[];
  featured?: ArticleListItem;
  newsletterEnabled: boolean;
};

export function InsightsPageContent({
  locale,
  labels,
  articles,
  featured,
  newsletterEnabled,
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

      <NewsletterSignupSection
        locale={locale}
        enabled={newsletterEnabled}
        labels={newsletterSignupLabelsFor(locale)}
        sourcePage={`/${locale}/insights`}
      />
    </main>
  );
}
