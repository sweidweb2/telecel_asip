import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  /** @deprecated Use `signup` — kept for existing nav labels. */
  register: "/signup",
  dashboard: "/dashboard",
  users: "/dashboard/users",
  registrations: "/dashboard/registrations",
  portfolio: "/dashboard/portfolio",
  portfolioNew: "/dashboard/portfolio/new",
  blogs: "/dashboard/blogs",
  partners: "/dashboard/partners",
  contactUs: "/dashboard/contact-us",
  analytics: "/dashboard/analytics",
  backup: "/dashboard/backup",
  settings: "/dashboard/settings",
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

/** Locale-prefixed founder/startup detail, e.g. `/en/founders/acme`. */
export function founderStartupPath(
  locale: Locale,
  slug: string,
  fromPage = 1,
): string {
  const path = `/${locale}/founders/${slug}`;
  return fromPage > 1 ? `${path}?fromPage=${fromPage}` : path;
}
