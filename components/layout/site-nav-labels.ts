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

const EN_NAV: { slug: PublicPageSlug; label: string }[] = [
  { slug: "", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "programme", label: "Program" },
  { slug: "portfolio", label: "Startups" },
  { slug: "insights", label: "Life" },
  { slug: "contact", label: "Contact" },
  { slug: "faq", label: "FAQ" },
];

export function enNavLabels(): SiteNavLabels {
  return {
    brand: "",
    languageGroupLabel: "Language",
    menuLabel: "Menu",
    items: EN_NAV.map(({ slug, label }) => ({
      href: publicPath("en", slug),
      label,
    })),
    apply: { href: publicPath("en", "apply"), label: "Apply" },
  };
}

const FR_NAV: { slug: PublicPageSlug; label: string }[] = [
  { slug: "", label: "Accueil" },
  { slug: "about", label: "À propos" },
  { slug: "programme", label: "Programme" },
  { slug: "portfolio", label: "Startups" },
  { slug: "insights", label: "Vie" },
  { slug: "contact", label: "Contact" },
  { slug: "faq", label: "FAQ" },
];

export function frNavLabels(): SiteNavLabels {
  return {
    brand: "",
    languageGroupLabel: "Langue",
    menuLabel: "Menu",
    items: FR_NAV.map(({ slug, label }) => ({
      href: publicPath("fr", slug),
      label,
    })),
    apply: { href: publicPath("fr", "apply"), label: "Candidater" },
  };
}

export function navLabelsFor(locale: Locale): SiteNavLabels {
  return locale === "fr" ? frNavLabels() : enNavLabels();
}
