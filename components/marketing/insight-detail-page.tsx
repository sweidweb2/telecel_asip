import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { AuthorAvatar } from "@/components/marketing/author-avatar";
import { BlogCard } from "@/components/marketing/blog-card";
import type { BlogLabels } from "@/components/marketing/blog-labels";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/constants/locales";
import { publicPath } from "@/constants/routes";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";
import type { Article, ArticleListItem } from "@/types/article";
import { cn } from "@/lib/utils";

type InsightDetailLabels = {
  backToInsights: string;
  writtenBy: string;
  publishedOn: string;
  fileUnder: string;
  moreInsights: string;
  relatedFounder: string;
  relatedCohort: string;
  sources: string;
};

type InsightDetailPageProps = {
  locale: Locale;
  article: Article;
  related: ArticleListItem[];
  labels: InsightDetailLabels;
};

export function InsightDetailPage({
  locale,
  article,
  related,
  labels,
}: InsightDetailPageProps) {
  const safeHtml = sanitizeBlogHtml(article.bodyHtml);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: article.thumbnailUrl || undefined,
    datePublished: article.datePublishedIso ?? undefined,
    dateModified: article.dateModifiedIso ?? undefined,
    author: {
      "@type": "Person",
      name: article.author.name,
    },
  };

  return (
    <main>
      <JsonLd data={structuredData} />

      <article className="relative pb-16 lg:pb-24">
        <Link
          href={publicPath(locale, "insights")}
          aria-label={labels.backToInsights}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "absolute top-6 left-4 z-10 inline-flex min-h-11 items-center gap-2 px-0 hover:bg-transparent sm:top-8 sm:left-6 lg:top-12 lg:left-[max(0.25rem,calc(50%-36rem-2.75rem))] lg:min-w-11 lg:justify-center lg:px-0",
          )}
        >
          <ArrowLeft className="size-4 shrink-0" />
          <span className="lg:sr-only">{labels.backToInsights}</span>
        </Link>

        <div className="mx-auto w-full max-w-6xl px-4 pt-[4.75rem] sm:px-6 sm:pt-[5.25rem] lg:pt-12">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">
              {article.category.name}
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:mt-6 sm:text-lg">
              {article.summary}
            </p>
          </header>
        </div>

        <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:mt-10 sm:px-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted md:aspect-[2/1]">
            {article.thumbnailUrl ? (
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            ) : null}
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-6xl px-4 sm:mt-10 sm:px-6">
          <div className="flex flex-col gap-8 border-b pb-8 sm:flex-row sm:items-end sm:justify-between lg:pb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{labels.writtenBy}</p>
                <div className="flex items-center gap-2">
                  <AuthorAvatar
                    name={article.author.name}
                    src={article.author.avatarUrl}
                  />
                  <p className="text-sm font-semibold">{article.author.name}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{labels.publishedOn}</p>
                <p className="text-sm font-semibold sm:text-base">
                  {article.publishedAt} · {article.readingTime}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">{labels.fileUnder}</p>
              <ul className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li
                    key={tag.name}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border ring-inset"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-3xl px-4 sm:mt-10 sm:px-6">
          <div
            className="prose prose-neutral max-w-none text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />

          {(article.relatedStartup ||
            article.relatedCohort ||
            article.sources.length > 0) && (
            <aside className="mt-10 space-y-6 border-t pt-8">
              {article.relatedStartup ? (
                <div>
                  <p className="text-sm font-semibold">{labels.relatedFounder}</p>
                  <Link
                    href={article.relatedStartup.href}
                    className="mt-2 inline-flex min-h-11 items-center text-primary underline-offset-4 hover:underline"
                  >
                    {article.relatedStartup.name}
                  </Link>
                </div>
              ) : null}
              {article.relatedCohort ? (
                <div>
                  <p className="text-sm font-semibold">{labels.relatedCohort}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {article.relatedCohort.label}
                  </p>
                </div>
              ) : null}
              {article.sources.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold">{labels.sources}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {article.sources.map((source) => (
                      <li key={source} className="break-words">
                        {/^https?:\/\//i.test(source) ? (
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline-offset-4 hover:underline"
                          >
                            {source}
                          </a>
                        ) : (
                          source
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          )}
        </div>

        {related.length > 0 ? (
          <section className="mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-20 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {labels.moreInsights}
              </h2>
              <Link
                href={publicPath(locale, "insights")}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "min-h-11 shrink-0 gap-1",
                )}
              >
                {labels.backToInsights}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <BlogCard locale={locale} article={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}

export type { InsightDetailLabels };

export function insightDetailLabelsFor(
  locale: Locale,
  blogLabels: BlogLabels,
): InsightDetailLabels {
  return {
    backToInsights:
      locale === "fr" ? "Retour aux perspectives" : "Back to insights",
    writtenBy: blogLabels.writtenBy,
    publishedOn: blogLabels.publishedOn,
    fileUnder: blogLabels.fileUnder,
    moreInsights: locale === "fr" ? "Autres articles" : "More insights",
    relatedFounder: locale === "fr" ? "Fondateur lié" : "Related founder",
    relatedCohort: locale === "fr" ? "Cohorte liée" : "Related cohort",
    sources: locale === "fr" ? "Sources" : "Sources",
  };
}
