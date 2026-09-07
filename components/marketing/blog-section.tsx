import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { AuthorAvatar } from "@/components/marketing/author-avatar";
import { BlogArticlesTabs } from "@/components/marketing/blog-articles-tabs";
import { BlogCard } from "@/components/marketing/blog-card";
import type { BlogLabels } from "@/components/marketing/blog-labels";
import type { Locale } from "@/constants/locales";
import { insightPath } from "@/constants/routes";
import type { ArticleListItem } from "@/types/article";

type BlogSectionProps = {
  locale: Locale;
  labels: BlogLabels;
  articles: ArticleListItem[];
  featured?: ArticleListItem;
};

function FeaturedPost({
  locale,
  labels,
  article,
}: {
  locale: Locale;
  labels: BlogLabels;
  article: ArticleListItem;
}) {
  const href = insightPath(locale, article.slug);

  return (
    <>
      <Link
        href={href}
        className="relative hidden w-full overflow-hidden rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none md:block md:h-[28rem] lg:h-[36rem]"
      >
        {article.thumbnailUrl ? (
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1152px) 100vw, 1152px"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-x-0 bottom-0 w-full bg-linear-to-t from-black/60 to-transparent pt-24">
          <div className="flex w-full flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <div className="flex gap-4">
                <p className="flex-1 font-heading text-xl font-semibold text-white text-balance lg:text-2xl">
                  {article.title}
                </p>
                <ArrowUpRight className="size-6 shrink-0 text-white" />
              </div>
              <p className="line-clamp-2 text-sm text-white/90 sm:text-base">
                {article.summary}
              </p>
            </div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:gap-8">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-white">
                    {labels.writtenBy}
                  </p>
                  <div className="flex items-center gap-2">
                    <AuthorAvatar
                      name={article.author.name}
                      src={article.author.avatarUrl}
                    />
                    <p className="text-sm font-semibold text-white">
                      {article.author.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-white">
                    {labels.publishedOn}
                  </p>
                  <div className="flex h-10 items-center">
                    <p className="text-sm font-semibold text-white sm:text-base">
                      {article.publishedAt}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-white">
                  {labels.fileUnder}
                </p>
                <ul className="flex min-h-10 flex-wrap items-center gap-2">
                  {article.tags.map((tag) => (
                    <li
                      key={tag.name}
                      className="rounded-full px-2 py-0.5 text-xs font-medium text-white ring-1 ring-white ring-inset"
                    >
                      {tag.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="md:hidden">
        <BlogCard locale={locale} article={article} />
      </div>
    </>
  );
}

/**
 * Insights index body — featured post stays RSC; tabs/grid are a client island.
 */
export function BlogSection({
  locale,
  labels,
  articles,
  featured,
}: BlogSectionProps) {
  const hasArticles = articles.length > 0;

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {featured ? (
        <FeaturedPost locale={locale} labels={labels} article={featured} />
      ) : null}

      {hasArticles ? (
        <BlogArticlesTabs locale={locale} labels={labels} articles={articles} />
      ) : (
        <p className="text-muted-foreground">{labels.emptyState}</p>
      )}
    </div>
  );
}
