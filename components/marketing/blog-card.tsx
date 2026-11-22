import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { AuthorAvatar } from "@/components/marketing/author-avatar";
import { publicCategoryLabel } from "@/components/marketing/blog-labels";
import type { Locale } from "@/constants/locales";
import { insightPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ArticleListItem } from "@/types/article";

type BlogCardProps = {
  article: ArticleListItem;
  locale: Locale;
  className?: string;
};

export function BlogCard({ article, locale, className }: BlogCardProps) {
  const href = insightPath(locale, article.slug);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-5 outline-none transition-[translate,box-shadow] duration-300 ease-spring hover:-translate-y-1 motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative aspect-[1.5] w-full overflow-hidden rounded-[1.25rem] bg-muted">
        {article.thumbnailUrl ? (
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <p className="w-fit rounded-full bg-brand-subtle px-2.5 py-0.5 text-xs font-semibold text-brand-strong">
          {publicCategoryLabel(article.category.name, locale)}
        </p>
        <div className="flex gap-4">
          <h3 className="flex-1 font-heading text-lg font-semibold tracking-tight text-balance group-hover:underline group-hover:underline-offset-4">
            {article.title}
          </h3>
          <ArrowUpRight className="mt-0.5 size-5 shrink-0" />
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground sm:text-base">
          {article.summary}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AuthorAvatar
          name={article.author.name}
          src={article.author.avatarUrl}
          size="sm"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{article.author.name}</p>
          <p className="text-sm text-muted-foreground">
            {article.publishedAt} · {article.readingTime}
          </p>
        </div>
      </div>
    </Link>
  );
}
