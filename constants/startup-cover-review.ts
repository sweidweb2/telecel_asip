/**
 * Startup covers that read as generic stock, illustration or synthetic people
 * (client review §2: no stock-office, AI-looking people or robot visuals).
 *
 * These covers were cropped from each company's booklet page, so they are the
 * company's own material — but they do not show the real founders or product.
 * Until real founder photography is supplied, these startups render the
 * branded cover (logo / initials on the cohort colour) instead.
 *
 * To restore a cover: supply a real photo in the CMS, then remove the slug.
 */
export const GENERIC_STARTUP_COVER_SLUGS: ReadonlySet<string> = new Set([
  "10mg-pharma",
  "agrodata",
  "bd-waste",
  "betapawa-solutions",
  "chestify-ai",
  "ecampus-llc",
  "ecomak-recyclers",
  "edusko",
  "limawa",
  "munakyalo-agrofresh",
  "neural-labs-africa",
  "ostafandy",
  "parcsmart",
  "parkwell",
  "pharmaserv",
  "primed-e-health",
  "proxalys",
  "rural-farmers-hub",
  "safetrack-cognx",
  "vooli-mobile-insurance",
  "yoonema",
]);

/** Cover URL to render, or null when the branded treatment should be used. */
export function startupCoverFor(startup: {
  slug: string;
  cover_image_url: string | null;
}): string | null {
  if (!startup.cover_image_url) return null;
  return GENERIC_STARTUP_COVER_SLUGS.has(startup.slug)
    ? null
    : startup.cover_image_url;
}
