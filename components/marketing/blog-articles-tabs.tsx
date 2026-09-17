"use client";

import { useMemo, useState } from "react";

import { BlogCard } from "@/components/marketing/blog-card";
import type { BlogLabels } from "@/components/marketing/blog-labels";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articleMatchesTab, type BlogTabId } from "@/constants/blog-ui";
import type { Locale } from "@/constants/locales";
import type { ArticleListItem } from "@/types/article";

type BlogArticlesTabsProps = {
  locale: Locale;
  labels: BlogLabels;
  articles: ArticleListItem[];
};

function articleCategories(article: ArticleListItem): string[] {
  const names = [
    article.category.name,
    ...article.tags.map((tag) => tag.name),
  ];
  return [...new Set(names.filter(Boolean))];
}

/**
 * Client island: category tabs + filtered article grid.
 */
export function BlogArticlesTabs({
  locale,
  labels,
  articles,
}: BlogArticlesTabsProps) {
  const [tab, setTab] = useState<BlogTabId>("all");

  const visibleTabs = useMemo(
    () =>
      labels.tabs.filter(
        (item) =>
          item.id === "all" ||
          articles.some((article) =>
            articleMatchesTab(articleCategories(article), item.id),
          ),
      ),
    [articles, labels.tabs],
  );

  const filteredArticles = useMemo(() => {
    if (tab === "all") return articles;
    return articles.filter((article) =>
      articleMatchesTab(articleCategories(article), tab),
    );
  }, [articles, tab]);

  const emptyMessage =
    tab === "all" ? labels.emptyState : labels.emptyStreamState;

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as BlogTabId)}
        className="min-w-0 w-full items-center"
      >
        <TabsList
          variant="default"
          className="mx-auto h-auto w-fit max-w-full flex-wrap justify-center gap-1 p-1 group-data-horizontal/tabs:h-auto"
        >
          {visibleTabs.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="h-9 flex-none px-3 after:hidden sm:px-3.5"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredArticles.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <li key={article.id}>
              <BlogCard locale={locale} article={article} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
