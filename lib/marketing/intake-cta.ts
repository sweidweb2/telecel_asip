import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath } from "@/constants/routes";

export type IntakeCta = {
  slug: Extract<PublicPageSlug, "apply" | "register-interest">;
  label: string;
  href: string;
};

const LABELS = {
  en: {
    closed: "Register interest",
    open: "Apply to ASIP",
  },
  fr: {
    closed: "Manifester votre intérêt",
    open: "Postuler à ASIP",
  },
} as const;

/**
 * Primary public intake CTA from `site_settings.open_applications`.
 * Both `/register-interest` and `/apply` stay live; this only picks which
 * one marketing chrome and page CTAs promote.
 */
export function intakeCtaFor(
  locale: Locale,
  openApplications: boolean,
): IntakeCta {
  const slug = openApplications ? "apply" : "register-interest";
  const label = openApplications
    ? LABELS[locale].open
    : LABELS[locale].closed;

  return {
    slug,
    label,
    href: publicPath(locale, slug),
  };
}
