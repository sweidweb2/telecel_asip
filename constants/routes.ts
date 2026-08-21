import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  users: "/dashboard/users",
  registrations: "/dashboard/registrations",
  portfolio: "/dashboard/portfolio",
  contactUs: "/dashboard/contact-us",
  analytics: "/dashboard/analytics",
  backup: "/dashboard/backup",
  settings: "/dashboard/settings",
} as const;

/** Locale-prefixed marketing path. Home slug `""` → `/en` or `/fr`. */
export function publicPath(locale: Locale, slug: PublicPageSlug = ""): string {
  return slug === "" ? `/${locale}` : `/${locale}/${slug}`;
}
