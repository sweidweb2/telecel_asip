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
        <div className="mb-10 max-w-3xl sm:mb-12">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {labels.pageTitle}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {labels.pageDescription}
          </p>
        </div>
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
