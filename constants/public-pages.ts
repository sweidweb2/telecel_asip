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
 * Always in the sitemap. `/apply` is added separately when
 * `site_settings.open_applications` is true (see `app/sitemap.ts`).
 */
export const INDEXABLE_PAGE_SLUGS = PUBLIC_PAGE_SLUGS.filter(
  (slug) => slug !== "apply",
);
