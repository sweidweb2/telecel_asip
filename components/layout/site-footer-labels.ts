import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { publicPath } from "@/constants/routes";

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
  note: string;
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
      { slug: "portfolio", label: "Portfolio" },
      { slug: "impact", label: "Impact" },
      { slug: "insights", label: "Insights" },
    ]),
    programme: links("en", [
      { slug: "programme", label: "The programme" },
      { slug: "apply", label: "Register interest" },
      { slug: "faq", label: "FAQ" },
    ]),
    connect: [
      { href: publicPath("en", "contact"), label: "Contact" },
      { href: `${publicPath("en", "about")}#partners`, label: "Partner with us" },
    ],
    socialHeading: "Follow",
    social: [
      { href: "https://www.linkedin.com", label: "LinkedIn" },
      { href: "https://x.com", label: "X" },
      { href: "https://www.youtube.com", label: "YouTube" },
    ],
    copyright: `© ${new Date().getFullYear()} Telecel Group. All rights reserved.`,
    note: "Placeholder footer — replace social URLs and legal links when Telecel supplies them.",
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
      { slug: "portfolio", label: "Portefeuille" },
      { slug: "impact", label: "Impact" },
      { slug: "insights", label: "Perspectives" },
    ]),
    programme: links("fr", [
      { slug: "programme", label: "Le programme" },
      { slug: "apply", label: "Manifestez votre intérêt" },
      { slug: "faq", label: "FAQ" },
    ]),
    connect: [
      { href: publicPath("fr", "contact"), label: "Nous contacter" },
      {
        href: `${publicPath("fr", "about")}#partners`,
        label: "Devenir partenaire",
      },
    ],
    socialHeading: "Suivre",
    social: [
      { href: "https://www.linkedin.com", label: "LinkedIn" },
      { href: "https://x.com", label: "X" },
      { href: "https://www.youtube.com", label: "YouTube" },
    ],
    copyright: `© ${new Date().getFullYear()} Groupe Telecel. Tous droits réservés.`,
    note: "Pied de page provisoire — remplacer les liens sociaux et légaux lorsque Telecel les fournira.",
  };
}
