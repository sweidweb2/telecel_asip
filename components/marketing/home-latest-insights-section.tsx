import Link from "next/link";

import { HomeInsightsCarousel } from "@/components/marketing/home-insights-carousel";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ArticleListItem } from "@/types/article";
import type { HomePageCopy } from "@/types/marketing-page";

type HomeLatestInsightsSectionProps = {
  locale: Locale;
  copy: HomePageCopy["latest"];
  articles: ArticleListItem[];
  className?: string;
};

/**
 * Home Module 09 — latest insights (RSC chrome + client carousel island).
 */
export function HomeLatestInsightsSection({
  locale,
  copy,
  articles,
  className,
}: HomeLatestInsightsSectionProps) {
  const insightsHref = publicPath(locale, copy.cta.slug);

  return (
    <section
      className={cn(
        "border-t border-border bg-background px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8 lg:pt-12 lg:pb-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl">
              {copy.title}
            </h2>
          </div>

          <Link
            href={insightsHref}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 shrink-0 rounded-full px-4 text-sm sm:px-6 sm:text-base",
            )}
          >
            {copy.cta.label}
          </Link>
        </div>

        {articles.length > 0 ? (
          <HomeInsightsCarousel locale={locale} articles={articles} />
        ) : (
          <p className="mt-6 text-base text-muted-foreground sm:mt-8">
            {copy.empty}
          </p>
        )}
      </div>
    </section>
  );
}
