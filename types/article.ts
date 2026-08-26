export type ArticleTag = {
  name: string;
  color: string;
  href: string;
};

export type ArticleAuthor = {
  name: string;
  href: string;
  avatarUrl: string;
};

export type ArticleCategory = {
  name: string;
  href: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  href: string;
  category: ArticleCategory;
  thumbnailUrl: string;
  publishedAt: string;
  readingTime: string;
  author: ArticleAuthor;
  tags: ArticleTag[];
  /** Sanitized HTML body for the detail page. */
  bodyHtml: string;
  isFeatured?: boolean;
};
