import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  /** @deprecated Use `signup` — kept for existing nav labels. */
  register: "/signup",
  /** Themed HTTP status pages (see `constants/http-errors.ts`). */
  forbidden: "/403",
  notFound: "/404",
  serverError: "/500",
  unavailable: "/503",
  error: "/error",
  dashboard: "/dashboard",
  users: "/dashboard/users",
  registrations: "/dashboard/registrations",
  applications: "/dashboard/applications",
  portfolio: "/dashboard/portfolio",
  portfolioNew: "/dashboard/portfolio/new",
  blogs: "/dashboard/blogs",
  blogsNew: "/dashboard/blogs/new",
  cohorts: "/dashboard/cohorts",
  cohortsNew: "/dashboard/cohorts/new",
  partners: "/dashboard/partners",
  partnersNew: "/dashboard/partners/new",
  founderStories: "/dashboard/founder-stories",
  founderStoriesNew: "/dashboard/founder-stories/new",
  evidence: "/dashboard/evidence",
  evidenceNew: "/dashboard/evidence/new",
  impactMetrics: "/dashboard/impact-metrics",
  impactMetricsNew: "/dashboard/impact-metrics/new",
  events: "/dashboard/events",
  eventsNew: "/dashboard/events/new",
  contactUs: "/dashboard/contact-us",
  newsletter: "/dashboard/newsletter",
  analytics: "/dashboard/analytics",
  /** @deprecated Prefer `adminPerformance` — kept as alias for admin path. */
  performance: "/admin/performance",
  /** @deprecated Prefer `adminBackup` — kept as alias for admin path. */
  backup: "/admin/backup",
  settings: "/dashboard/settings",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminSettings: "/admin/settings",
  adminPerformance: "/admin/performance",
  adminBackup: "/admin/backup",
  adminCatalog: "/admin/catalog",
} as const;

export type AuthPage = "login" | "signup";

/** Locale-prefixed marketing path. Home slug `""` → `/en` or `/fr`. */
export function publicPath(locale: Locale, slug: PublicPageSlug = ""): string {
  return slug === "" ? `/${locale}` : `/${locale}/${slug}`;
}

/** Locale-prefixed auth path, e.g. `/fr/login`. */
export function authPath(locale: Locale, page: AuthPage = "login"): string {
  return `/${locale}/${page}`;
}

/** Locale-prefixed insight detail path, e.g. `/en/insights/ux-review-presentations`. */
export function insightPath(locale: Locale, slug: string): string {
  return `/${locale}/insights/${slug}`;
}

/** Admin portfolio edit path, e.g. `/dashboard/portfolio/{id}`. */
export function portfolioEditPath(id: string): string {
  return `${ROUTES.portfolio}/${id}`;
}

/** Admin partner detail path, e.g. `/dashboard/partners/{id}`. */
export function partnerDetailPath(id: string): string {
  return `${ROUTES.partners}/${id}`;
}

/** Admin cohort edit path, e.g. `/dashboard/cohorts/{id}`. */
export function cohortEditPath(id: string): string {
  return `${ROUTES.cohorts}/${id}`;
}

/** Admin impact metric detail path, e.g. `/dashboard/impact-metrics/{id}`. */
export function impactMetricDetailPath(id: string): string {
  return `${ROUTES.impactMetrics}/${id}`;
}

/** Admin event detail path, e.g. `/dashboard/events/{id}`. */
export function eventDetailPath(id: string): string {
  return `${ROUTES.events}/${id}`;
}

/** Admin evidence detail path, e.g. `/dashboard/evidence/{id}`. */
export function evidenceDetailPath(id: string): string {
  return `${ROUTES.evidence}/${id}`;
}

/** Admin founder story edit path, e.g. `/dashboard/founder-stories/{id}`. */
export function founderStoryEditPath(id: string): string {
  return `${ROUTES.founderStories}/${id}`;
}

/** Locale-prefixed founder/startup detail, e.g. `/en/founders/acme`. */
export function founderStartupPath(
  locale: Locale,
  slug: string,
  fromPage = 1,
): string {
  const path = `/${locale}/founders/${slug}`;
  return fromPage > 1 ? `${path}?fromPage=${fromPage}` : path;
}
