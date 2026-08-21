import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath, ROUTES } from "@/constants/routes";

export type NavItem = {
  href: string;
  label: string;
};

export type SiteNavLabels = {
  brand: string;
  items: NavItem[];
  languageGroupLabel: string;
  dashboard: NavItem;
  login: NavItem;
  register: NavItem;
};

const EN_NAV: { slug: PublicPageSlug; label: string }[] = [
  { slug: "", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "programme", label: "Programme" },
  { slug: "portfolio", label: "Portfolio" },
  { slug: "impact", label: "Impact" },
  { slug: "partners", label: "Partners" },
  { slug: "insights", label: "Insights" },
  { slug: "apply", label: "Apply" },
  { slug: "contact", label: "Contact" },
  { slug: "faq", label: "FAQ" },
];

export function enNavLabels(): SiteNavLabels {
  return {
    brand: "ASIP",
    languageGroupLabel: "Language",
    items: EN_NAV.map(({ slug, label }) => ({
      href: publicPath("en", slug),
      label,
    })),
    dashboard: { href: ROUTES.dashboard, label: "Dashboard" },
    login: { href: ROUTES.login, label: "Login" },
    register: { href: ROUTES.register, label: "Register" },
  };
}

const FR_NAV: { slug: PublicPageSlug; label: string }[] = [
  { slug: "", label: "Accueil" },
  { slug: "about", label: "À propos" },
  { slug: "programme", label: "Programme" },
  { slug: "portfolio", label: "Portefeuille" },
  { slug: "impact", label: "Impact" },
  { slug: "partners", label: "Partenaires" },
  { slug: "insights", label: "Perspectives" },
  { slug: "apply", label: "Candidater" },
  { slug: "contact", label: "Contact" },
  { slug: "faq", label: "FAQ" },
];

export function frNavLabels(): SiteNavLabels {
  return {
    brand: "ASIP",
    languageGroupLabel: "Langue",
    items: FR_NAV.map(({ slug, label }) => ({
      href: publicPath("fr", slug),
      label,
    })),
    dashboard: { href: ROUTES.dashboard, label: "Tableau de bord" },
    login: { href: ROUTES.login, label: "Connexion" },
    register: { href: ROUTES.register, label: "Inscription" },
  };
}

export function navLabelsFor(locale: Locale): SiteNavLabels {
  return locale === "fr" ? frNavLabels() : enNavLabels();
}
