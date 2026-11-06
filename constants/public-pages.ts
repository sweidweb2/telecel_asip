/** Marketing page slugs under /en and /fr (home = ""). */
export const PUBLIC_PAGE_SLUGS = [
  "",
  "about",
  "program",
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
 * Always in the sitemap except intake exclusivity and HOLD alumni.
 * `/apply` is added when open; `/register-interest` is included only when closed
 * (see `app/sitemap.ts`). Alumni stays routable + `noindex` but out of the sitemap.
 */
export const INDEXABLE_PAGE_SLUGS = PUBLIC_PAGE_SLUGS.filter(
  (slug) =>
    slug !== "apply" &&
    slug !== "register-interest" &&
    slug !== "alumni",
);