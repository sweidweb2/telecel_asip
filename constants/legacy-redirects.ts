// Relative imports: this module is loaded by `next.config.ts`, which does not
// resolve the `@/*` tsconfig alias.
import { LOCALES } from "./locales";
import { PUBLIC_PAGE_SLUG_SET, type PublicPageSlug } from "./public-pages";

/**
 * One legacy ASIP website URL (or URL prefix) and the new page it belongs to.
 *
 * `source` is always locale-less, exactly as it appeared on the single-language
 * legacy site. `slug` must be a real marketing slug so a redirect can never
 * point at a 404.
 */
export type LegacyRedirect = {
  /** Legacy path without a locale prefix, e.g. `/about-us`. */
  readonly source: string;
  /** Destination marketing slug (`""` = home). */
  readonly slug: PublicPageSlug;
  /**
   * Also redirect everything below `source` (`/news/some-post` → insights).
   * Use for legacy sections whose child slugs do not survive the migration.
   */
  readonly includeChildren?: boolean;
};

/**
 * Legacy → new mapping for the retired ASIP site.
 *
 * Every entry is a path that does not exist in the new information
 * architecture, so each one is a 404 today and a 301 after this map ships.
 * When the Legacy ASIP website PDF inventory is reconciled, add the remaining
 * URLs here rather than editing `next.config.ts`.
 */
export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  // WordPress entry points
  { source: "/index.php", slug: "" },
  { source: "/index.html", slug: "" },
  { source: "/home", slug: "" },

  // About / story
  { source: "/about-us", slug: "about" },
  { source: "/our-story", slug: "about" },
  { source: "/who-we-are", slug: "about" },

  // Programme
  { source: "/the-programme", slug: "program" },
  { source: "/programme", slug: "program" },
  { source: "/accelerator", slug: "program" },

  // Founders / portfolio
  { source: "/startups", slug: "founders" },
  { source: "/portfolio", slug: "founders" },
  { source: "/our-founders", slug: "founders" },
  { source: "/companies", slug: "founders", includeChildren: true },

  // Impact
  { source: "/our-impact", slug: "impact" },
  { source: "/results", slug: "impact" },

  // Partners / mentors
  { source: "/partners-mentors", slug: "partners" },
  { source: "/mentors", slug: "partners" },
  { source: "/sponsors", slug: "partners" },

  // Editorial
  { source: "/news", slug: "insights", includeChildren: true },
  { source: "/blog", slug: "insights", includeChildren: true },
  { source: "/media", slug: "insights", includeChildren: true },
  { source: "/press", slug: "insights", includeChildren: true },

  // Applications — the open/closed switch is enforced in middleware, so both
  // legacy application URLs point at the same gated pair of routes.
  { source: "/apply-now", slug: "apply" },
  { source: "/application", slug: "apply" },
  { source: "/register-your-interest", slug: "register-interest" },
  // `/register` is intentionally absent: middleware already claims it as an
  // auth alias for /signup.

  // Alumni
  { source: "/alumni-network", slug: "alumni" },

  // Contact / support
  { source: "/contact-us", slug: "contact" },
  { source: "/get-in-touch", slug: "contact" },
  { source: "/faqs", slug: "faq" },

  // Legal
  { source: "/privacy-policy", slug: "privacy" },
  { source: "/terms-and-conditions", slug: "terms" },
  { source: "/terms-of-use", slug: "terms" },
];

type RedirectRule = {
  source: string;
  destination: string;
  /**
   * Explicit 301 rather than `permanent: true` (which emits 308): the SEO
   * requirement is a 301 map, and audit tools check the literal status.
   */
  statusCode: 301;
};

function destination(locale: string, slug: PublicPageSlug): string {
  return slug === "" ? `/${locale}` : `/${locale}/${slug}`;
}

/**
 * Expands {@link LEGACY_REDIRECTS} into `next.config.ts` rules.
 *
 * Each entry yields a locale-less rule (301 to the default locale) plus a
 * locale-prefixed rule, so inbound links that already carry `/en` or `/fr`
 * are consolidated onto the same canonical URL instead of 404ing.
 */
export function legacyRedirectRules(
  defaultLocale: string = LOCALES[0],
): RedirectRule[] {
  const localeMatcher = LOCALES.join("|");

  return LEGACY_REDIRECTS.flatMap(({ source, slug, includeChildren }) => {
    const suffix = includeChildren ? "/:path*" : "";

    return [
      {
        source: `${source}${suffix}`,
        destination: destination(defaultLocale, slug),
        statusCode: 301 as const,
      },
      {
        source: `/:locale(${localeMatcher})${source}${suffix}`,
        destination: destination(":locale", slug),
        statusCode: 301 as const,
      },
    ];
  });
}

/** Guards the map against destinations that are not real marketing pages. */
export function findInvalidLegacyRedirects(): LegacyRedirect[] {
  return LEGACY_REDIRECTS.filter(
    (entry) => !PUBLIC_PAGE_SLUG_SET.has(entry.slug),
  );
}
