/** Marketing page slugs under /en and /fr (home = ""). */
export const PUBLIC_PAGE_SLUGS = [
  "",
  "about",
  "programme",
  "founders",
  "impact",
  "partners",
  "insights",
  "register-interest",
  "alumni",
  "apply",
  "contact",
  "faq",
  "terms",
  "privacy",
] as const;

export type PublicPageSlug = (typeof PUBLIC_PAGE_SLUGS)[number];

export const PUBLIC_PAGE_SLUG_SET = new Set<string>(PUBLIC_PAGE_SLUGS);

/**
 * Slugs kept out of the sitemap and search index.
 * `alumni` and `apply` are built and routable, but stay unlisted until the
 * Alumni Network operating model / launch and a cohort's Apply state are
 * formally approved.
 */
export const UNLISTED_PAGE_SLUGS = new Set<PublicPageSlug>([
  "alumni",
  "apply",
]);

export const INDEXABLE_PAGE_SLUGS = PUBLIC_PAGE_SLUGS.filter(
  (slug) => !UNLISTED_PAGE_SLUGS.has(slug),
);
