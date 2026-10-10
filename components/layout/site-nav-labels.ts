import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath } from "@/constants/routes";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

export type NavItem = {
  href: string;
  label: string;
};

export type SiteNavLabels = {
  items: NavItem[];
  languageGroupLabel: string;
  menuLabel: string;
  /** Short line beside the language toggle and inside the mobile sheet. */
  masthead: string;
  /** Founders dropdown label for the directory. The trigger still uses the Founders item label. */
  foundersDirectory: string;
  apply: NavItem;
};

/**
 * Header order is one list. Each locale only supplies labels.
 * Footer groups stay in `site-footer-labels.ts`.
 * The CTA follows `open_applications`: Apply while a cohort is open,
 * Register Interest otherwise. Contact, FAQ, and legal pages live in the footer.
 */
const HEADER_NAV_SLUGS = [
  "",
  "about",
  "programme",
  "founders",
  "alumni",
  "impact",
  "partners",
  "insights",
] as const satisfies readonly PublicPageSlug[];

type HeaderNavSlug = (typeof HEADER_NAV_SLUGS)[number];

const HEADER_NAV_LABELS: Record<Locale, Record<HeaderNavSlug, string>> = {
  en: {
    "": "Home",
    about: "About",
    programme: "Programme",
    founders: "Founders",
    alumni: "Alumni",
    impact: "Impact",
    partners: "Partners",
    insights: "Insights",
  },
  fr: {
    "": "Accueil",
    about: "À propos",
    programme: "Programme",
    founders: "Fondateurs",
    alumni: "Alumni",
    impact: "Impact",
    partners: "Partenaires",
    insights: "Perspectives",
  },
};

const NAV_CHROME: Record<
  Locale,
  Pick<
    SiteNavLabels,
    "languageGroupLabel" | "menuLabel" | "masthead" | "foundersDirectory"
  >
> = {
  en: {
    languageGroupLabel: "Language",
    menuLabel: "Menu",
    masthead: "A Telecel Group programme",
    foundersDirectory: "Directory",
  },
  fr: {
    languageGroupLabel: "Langue",
    menuLabel: "Menu",
    masthead: "Un programme du Groupe Telecel",
    foundersDirectory: "Annuaire",
  },
};

function navLabels(locale: Locale, openApplications: boolean): SiteNavLabels {
  const intake = intakeCtaFor(locale, openApplications);
  return {
    ...NAV_CHROME[locale],
    items: HEADER_NAV_SLUGS.map((slug) => ({
      href: publicPath(locale, slug),
      label: HEADER_NAV_LABELS[locale][slug],
    })),
    apply: { href: intake.href, label: intake.label },
  };
}

export function enNavLabels(openApplications = false): SiteNavLabels {
  return navLabels("en", openApplications);
}

export function frNavLabels(openApplications = false): SiteNavLabels {
  return navLabels("fr", openApplications);
}

export function navLabelsFor(
  locale: Locale,
  openApplications = false,
): SiteNavLabels {
  return navLabels(locale, openApplications);
}
