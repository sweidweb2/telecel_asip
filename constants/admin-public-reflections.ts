import type { AdminResourceId } from "@/constants/admin-resources";

export type AdminPublicReflectionSurface = {
  /** Public page / module name */
  page: string;
  /** Public path pattern visitors hit */
  path: string;
  /** Whether this surface currently pulls live CMS rows */
  reflected: boolean;
  /** What from the record appears when reflected */
  shows: string;
  /** Publish / filter rule for this surface */
  rule: string;
};

export type AdminPublicReflectionGuide = {
  resourceId: AdminResourceId;
  title: string;
  intro: string;
  surfaces: readonly AdminPublicReflectionSurface[];
  notes?: readonly string[];
};

/**
 * Where CMS list entities appear on public pages — for the manage-page guide dialog.
 * Keep in sync with marketing `data/` reads and live page wiring.
 */
export const ADMIN_PUBLIC_REFLECTIONS = {
  portfolio: {
    resourceId: "portfolio",
    title: "Where portfolio startups appear",
    intro:
      "Active startups feed the public founders directory and detail pages. Draft or inactive rows stay admin-only.",
    surfaces: [
      {
        page: "Founders directory",
        path: "/{locale}/founders",
        reflected: true,
        shows: "Startup names from the public portfolio list (active only).",
        rule: "status = active (startups_public).",
      },
      {
        page: "Founder profile",
        path: "/{locale}/founders/[slug]",
        reflected: true,
        shows:
          "Name, description, and related active startups. Richer card fields exist in CMS but the public UI is still light.",
        rule: "status = active; slug must match.",
      },
      {
        page: "Home founder spotlight",
        path: "/{locale} (home)",
        reflected: false,
        shows: "Not wired - home uses static copy today.",
        rule: "getSpotlightStartups exists but is unused on home.",
      },
    ],
    notes: [
      "Featured flag and media fields are stored for future richer cards.",
    ],
  },
  partners: {
    resourceId: "partners",
    title: "Where partners appear",
    intro:
      "Partners power the public partners network. Logo display depends on logo permission.",
    surfaces: [
      {
        page: "Partners network",
        path: "/{locale}/partners",
        reflected: true,
        shows:
          "Name, organisation, type, link, and logo (logo only when logo permission allows).",
        rule: "partners_public; active vs historical split by is_active; sorted by sort_order.",
      },
    ],
  },
  blogs: {
    resourceId: "blogs",
    title: "Where blogs / insights appear",
    intro:
      "Only published articles reach the public site. Featured items can surface first on home and listings.",
    surfaces: [
      {
        page: "Home latest insights",
        path: "/{locale} (home)",
        reflected: true,
        shows:
          "Title, summary, thumbnail, author, reading time, published date; featured preferred.",
        rule: "status = published.",
      },
      {
        page: "Insights listing",
        path: "/{locale}/insights",
        reflected: true,
        shows:
          "Published cards: title, slug, summary, categories, media, author metadata.",
        rule: "status = published.",
      },
      {
        page: "Insight detail",
        path: "/{locale}/insights/[slug]",
        reflected: true,
        shows:
          "Full body HTML, sources, SEO fields, related founder/cohort labels when those links are public.",
        rule: "status = published; related startup/cohort only if they are public/published.",
      },
    ],
  },
  founderStories: {
    resourceId: "founderStories",
    title: "Where founder stories appear",
    intro:
      "Published stories attach to founder profiles and can feed impact case-study slots.",
    surfaces: [
      {
        page: "Founder profile story modules",
        path: "/{locale}/founders/[slug]",
        reflected: true,
        shows:
          "Problem, what they built, ASIP connection, where they are now. Quote only with granted permission + attribution name.",
        rule: "story publish_status = published; quote needs quote_permission_status = granted.",
      },
      {
        page: "Impact case studies",
        path: "/{locale}/impact",
        reflected: true,
        shows:
          "Barrier / support / outcome lines plus startup name, slug, sector, country, cover, outcome stat.",
        rule: "Published stories; incomplete copy may show as pending seats.",
      },
    ],
  },
  cohorts: {
    resourceId: "cohorts",
    title: "Where cohorts appear",
    intro: "Published cohorts show as past programme chapters and as related labels on insights.",
    surfaces: [
      {
        page: "Programme - past chapters",
        path: "/{locale}/programme",
        reflected: true,
        shows:
          "Year, public label, programme status, date window, and summary.",
        rule: "publish_status = published; ordered by year.",
      },
      {
        page: "Insight related cohort",
        path: "/{locale}/insights/[slug]",
        reflected: true,
        shows: "Cohort label when a published article links a published cohort.",
        rule: "Article published and cohort publish_status = published.",
      },
    ],
  },
  events: {
    resourceId: "events",
    title: "Where events appear",
    intro:
      "Published event reads exist in data/, but no public marketing page consumes them yet.",
    surfaces: [
      {
        page: "Public events listing / detail",
        path: "-",
        reflected: false,
        shows:
          "Would include name, date, location, format, speakers, outcomes when a route is wired.",
        rule: "getPublishedEvents filters publish_status = published - unused by marketing today.",
      },
    ],
    notes: [
      "Publish status still matters for when a public surface is connected later.",
    ],
  },
  evidence: {
    resourceId: "evidence",
    title: "Where evidence appears",
    intro:
      "Evidence records are admin governance for impact claims. They are not listed on public pages.",
    surfaces: [
      {
        page: "Public site",
        path: "-",
        reflected: false,
        shows: "No public evidence API or listing.",
        rule: "Admin-only; linked from impact metrics via evidence_id.",
      },
      {
        page: "Impact “evidence rule” copy",
        path: "/{locale}/impact",
        reflected: false,
        shows: "Static marketing copy - not CMS evidence rows.",
        rule: "Hard-coded section text.",
      },
    ],
    notes: [
      "Verified metrics still depend on solid evidence records in the CMS.",
    ],
  },
  impactMetrics: {
    resourceId: "impactMetrics",
    title: "Where impact metrics appear",
    intro:
      "Verified metrics with the right display-location tags feed the home impact strip.",
    surfaces: [
      {
        page: "Home - seven years of impact",
        path: "/{locale} (home)",
        reflected: true,
        shows: "claim_label, value, and unit.",
        rule: "publish_status = verified and display_locations includes homepage_module_02.",
      },
      {
        page: "Impact page metrics strip",
        path: "/{locale}/impact",
        reflected: false,
        shows:
          "Helper for impact_page (or all verified) exists but the page does not load metrics yet.",
        rule: "Tag impact_page when that surface is wired.",
      },
    ],
    notes: [
      "Use Display locations suggestions (homepage_module_02, impact_page) on the metric editor.",
    ],
  },
} as const satisfies Partial<
  Record<AdminResourceId, AdminPublicReflectionGuide>
>;

export type AdminPublicReflectionId = keyof typeof ADMIN_PUBLIC_REFLECTIONS;

export function getAdminPublicReflection(
  id: AdminPublicReflectionId,
): AdminPublicReflectionGuide {
  return ADMIN_PUBLIC_REFLECTIONS[id];
}

/** True when any listed public surface is not wired to live CMS rows. */
export function hasUnreflectedAdminPublicSurfaces(
  id: AdminPublicReflectionId,
): boolean {
  return ADMIN_PUBLIC_REFLECTIONS[id].surfaces.some(
    (surface) => !surface.reflected,
  );
}
