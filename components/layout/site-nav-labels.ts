import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath } from "@/constants/routes";

export type NavItem = {
  href: string;
  label: string;
};

export type SiteNavLabels = {
  brand: string;
  items: NavItem[];
  languageGroupLabel: string;
  menuLabel: string;
  apply: NavItem;
};

/**
 * Primary navigation. The CTA follows the `open_applications` site setting:
 * Apply while a cohort is open, Register Interest otherwise. Contact, FAQ,
 * and legal pages live in the footer.
 */
const EN_NAV: { slug: PublicPageSlug; label: string }[] = [
  { slug: "", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "programme", label: "Programme" },
  { slug: "founders", label: "Founders" },
  { slug: "alumni", label: "Alumni" },
  { slug: "impact", label: "Impact" },
  { slug: "partners", label: "Partners" },
  { slug: "insights", label: "Insights" },
  { slug: "lab", label: "Lab" },
];

export function enNavLabels(openApplications = false): SiteNavLabels {
  return {
    brand: "",
    languageGroupLabel: "Language",
    menuLabel: "Menu",
    items: EN_NAV.map(({ slug, label }) => ({
      href: publicPath("en", slug),
      label,
    })),
    apply: openApplications
      ? { href: publicPath("en", "apply"), label: "Apply" }
      : {
          href: publicPath("en", "register-interest"),
          label: "Register Interest",
        },
  };
}

const FR_NAV: { slug: PublicPageSlug; label: string }[] = [
  { slug: "", label: "Accueil" },
  { slug: "about", label: "À propos" },
  { slug: "programme", label: "Programme" },
  { slug: "founders", label: "Fondateurs" },
  { slug: "alumni", label: "Alumni" },
  { slug: "impact", label: "Impact" },
  { slug: "partners", label: "Partenaires" },
  { slug: "insights", label: "Perspectives" },
  { slug: "lab", label: "Lab" },
];

export function frNavLabels(openApplications = false): SiteNavLabels {
  return {
    brand: "",
    languageGroupLabel: "Langue",
    menuLabel: "Menu",
    items: FR_NAV.map(({ slug, label }) => ({
      href: publicPath("fr", slug),
      label,
    })),
    apply: openApplications
      ? { href: publicPath("fr", "apply"), label: "Postuler" }
      : {
          href: publicPath("fr", "register-interest"),
          label: "Manifester votre intérêt",
        },
  };
}

export function navLabelsFor(
  locale: Locale,
  openApplications = false,
): SiteNavLabels {
  return locale === "fr"
    ? frNavLabels(openApplications)
    : enNavLabels(openApplications);
}
