/**
 * Public Insights feed tabs. IDs match `InsightsStreamId` in types/marketing-page.
 * Canonical EN labels are what admins should store in `blogs.categories`.
 * FR stream names also map so either locale label still filters correctly.
 */
export const BLOG_TAB_IDS = [
  "all",
  "founder-stories",
  "portfolio-news",
  "programme-updates",
  "founder-resources",
  "partner-perspectives",
] as const;

export type BlogTabId = (typeof BLOG_TAB_IDS)[number];

/** English CMS / public labels for each stream tab (excluding `all`). */
export const BLOG_STREAM_CATEGORY_LABELS: Record<
  Exclude<BlogTabId, "all">,
  string
> = {
  "founder-stories": "Founder Stories",
  "portfolio-news": "Portfolio News",
  "programme-updates": "Programme Updates",
  "founder-resources": "Founder Resources",
  "partner-perspectives": "Partner Perspectives",
};

const STREAM_ALIASES: Record<string, Exclude<BlogTabId, "all">> = {
  "founder stories": "founder-stories",
  "récits de fondateurs": "founder-stories",
  "recits de fondateurs": "founder-stories",
  "portfolio news": "portfolio-news",
  "actualités du portefeuille": "portfolio-news",
  "actualites du portefeuille": "portfolio-news",
  "programme updates": "programme-updates",
  "actualités du programme": "programme-updates",
  "actualites du programme": "programme-updates",
  "founder resources": "founder-resources",
  "ressources pour fondateurs": "founder-resources",
  "partner perspectives": "partner-perspectives",
  "regards de partenaires": "partner-perspectives",
};

function normalizeCategoryLabel(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Map a free-text category to a stream tab. Unknown labels fall back to `all`
 * (post still appears under View all only).
 */
export function categoryToTabId(name: string): BlogTabId {
  const key = normalizeCategoryLabel(name);
  if (!key) return "all";
  return STREAM_ALIASES[key] ?? "all";
}

/** True when any of the article's categories match the active stream tab. */
export function articleMatchesTab(
  categories: readonly string[],
  tab: BlogTabId,
): boolean {
  if (tab === "all") return true;
  return categories.some((name) => categoryToTabId(name) === tab);
}
