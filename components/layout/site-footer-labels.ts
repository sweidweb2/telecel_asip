import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { authPath, publicPath } from "@/constants/routes";

export type FooterLink = {
  href: string;
  label: string;
};

export type FooterSocialLink = {
  href: string;
  label: string;
};

export type SiteFooterLabels = {
  brand: string;
  tagline: string;
  exploreHeading: string;
  programmeHeading: string;
  connectHeading: string;
  explore: FooterLink[];
  programme: FooterLink[];
  connect: FooterLink[];
  socialHeading: string;
  social: FooterSocialLink[];
  copyright: string;
  legal: FooterLink[];
  /** Dormant Apply page — reachable from the footer only until a cohort opens. */
  apply: FooterLink;
  login: FooterLink;
};

function links(
  locale: Locale,
  entries: { slug: PublicPageSlug; label: string }[]
): FooterLink[] {
  return entries.map(({ slug, label }) => ({
    href: publicPath(locale, slug),
    label,
  }));
}

export function enFooterLabels(): SiteFooterLabels {
  return {
    brand: "ASIP",
    tagline:
      "Africa Startup Initiative Program — Telecel Group’s platform for African technology ventures.",
    exploreHeading: "Explore",
    programmeHeading: "Programme",
    connectHeading: "Connect",
    explore: links("en", [
      { slug: "", label: "Home" },
      { slug: "about", label: "About" },
      { slug: "founders", label: "Founders" },
      { slug: "insights", label: "Insights" },
    ]),
    programme: links("en", [
      { slug: "programme", label: "The programme" },
      { slug: "impact", label: "Impact" },
      { slug: "register-interest", label: "Register interest" },
      { slug: "faq", label: "FAQ" },
    ]),
    connect: [
      ...links("en", [
        { slug: "contact", label: "Contact" },
        { slug: "partners", label: "Partner with us" },
      ]),
      { href: authPath("en", "signup"), label: "Register" },
    ],
    socialHeading: "Follow",
    social: [
      { href: "https://www.linkedin.com", label: "LinkedIn" },
      { href: "https://x.com", label: "X" },
      { href: "https://www.youtube.com", label: "YouTube" },
    ],
    copyright: `© ${new Date().getFullYear()} Telecel Group. All rights reserved.`,
    legal: links("en", [
      { slug: "terms", label: "Terms of Service" },
      { slug: "privacy", label: "Privacy Policy" },
    ]),
    apply: { href: publicPath("en", "apply"), label: "Apply" },
    login: { href: authPath("en", "login"), label: "Login" },
  };
}

export function frFooterLabels(): SiteFooterLabels {
  return {
    brand: "ASIP",
    tagline:
      "Programme africain d’initiative pour les startups — la plateforme du Groupe Telecel pour les entreprises technologiques africaines.",
    exploreHeading: "Explorer",
    programmeHeading: "Programme",
    connectHeading: "Contact",
    explore: links("fr", [
      { slug: "", label: "Accueil" },
      { slug: "about", label: "À propos" },
      { slug: "founders", label: "Fondateurs" },
      { slug: "insights", label: "Perspectives" },
    ]),
    programme: links("fr", [
      { slug: "programme", label: "Le programme" },
      { slug: "impact", label: "Impact" },
      { slug: "register-interest", label: "Manifestez votre intérêt" },
      { slug: "faq", label: "FAQ" },
    ]),
    connect: [
      ...links("fr", [
        { slug: "contact", label: "Nous contacter" },
        { slug: "partners", label: "Devenir partenaire" },
      ]),
      { href: authPath("fr", "signup"), label: "Inscription" },
    ],
    socialHeading: "Suivre",
    social: [
      { href: "https://www.linkedin.com", label: "LinkedIn" },
      { href: "https://x.com", label: "X" },
      { href: "https://www.youtube.com", label: "YouTube" },
    ],
    copyright: `© ${new Date().getFullYear()} Groupe Telecel. Tous droits réservés.`,
    legal: links("fr", [
      { slug: "terms", label: "Conditions d’utilisation" },
      { slug: "privacy", label: "Politique de confidentialité" },
    ]),
    apply: { href: publicPath("fr", "apply"), label: "Candidater" },
    login: { href: authPath("fr", "login"), label: "Connexion" },
  };
}
