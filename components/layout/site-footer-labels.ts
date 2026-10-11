import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { authPath, publicPath } from "@/constants/routes";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

export const TELECEL_GROUP_URL = "https://www.telecelgroup.com";

/** Matches the `id` on the privacy policy's cookies section. */
const COOKIES_ANCHOR = "#cookies";

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
  /** Footer proposition headline. */
  headline: string;
  /** What ASIP is and what founders get from it — no vague "support" claims. */
  statement: string;
  exploreHeading: string;
  programmeHeading: string;
  connectHeading: string;
  explore: FooterLink[];
  programme: FooterLink[];
  connect: FooterLink[];
  socialHeading: string;
  /**
   * Only official, confirmed ASIP accounts belong here. Leave empty until a
   * channel is verified — the footer hides the block when there are none.
   */
  social: FooterSocialLink[];
  /** Telecel Group corporate site (external). */
  parent: FooterLink;
  /** Primary footer CTA alongside the parent link. */
  contact: FooterLink;
  copyright: string;
  legal: FooterLink[];
  /** Primary footer CTA — follows open_applications (Register Interest ↔ Apply). */
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

export function enFooterLabels(openApplications = false): SiteFooterLabels {
  const intake = intakeCtaFor("en", openApplications);
  return {
    brand: "ASIP",
    headline: "African founders. Built to scale.",
    statement:
      "ASIP is a Telecel Group Program backing ambitious African technology founders with expertise, capital pathways, market access and relationships that help businesses grow.",
    exploreHeading: "Explore",
    programmeHeading: "Programme",
    connectHeading: "Contact",
    explore: links("en", [
      { slug: "", label: "Home" },
      { slug: "about", label: "About" },
      { slug: "founders", label: "Founders" },
      { slug: "insights", label: "Insights" },
    ]),
    programme: [
      ...links("en", [
        { slug: "programme", label: "The programme" },
        { slug: "impact", label: "Impact" },
      ]),
      { href: intake.href, label: intake.label },
      ...links("en", [{ slug: "faq", label: "FAQ" }]),
    ],
    connect: links("en", [
      { slug: "contact", label: "Contact" },
      { slug: "partners", label: "Partner with us" },
    ]),
    socialHeading: "Follow",
    social: [],
    parent: { href: TELECEL_GROUP_URL, label: "Telecel Group" },
    contact: { href: publicPath("en", "contact"), label: "Contact ASIP" },
    copyright: `© ${new Date().getFullYear()} Telecel Group. All rights reserved.`,
    legal: [
      ...links("en", [
        { slug: "terms", label: "Terms of Service" },
        { slug: "privacy", label: "Privacy Policy" },
      ]),
      {
        href: `${publicPath("en", "privacy")}${COOKIES_ANCHOR}`,
        label: "Cookie preferences",
      },
    ],
    apply: { href: intake.href, label: intake.label },
    login: { href: authPath("en", "login"), label: "Login" },
  };
}

export function frFooterLabels(openApplications = false): SiteFooterLabels {
  const intake = intakeCtaFor("fr", openApplications);
  return {
    brand: "ASIP",
    headline: "Fondateurs africains. Faits pour grandir.",
    statement:
      "ASIP est un programme du Groupe Telecel qui soutient des fondateurs africains ambitieux de la tech avec l’expertise, les voies de financement, l’accès aux marchés et les relations qui aident les entreprises à croître.",
    exploreHeading: "Explorer",
    programmeHeading: "Programme",
    connectHeading: "Contact",
    explore: links("fr", [
      { slug: "", label: "Accueil" },
      { slug: "about", label: "À propos" },
      { slug: "founders", label: "Fondateurs" },
      { slug: "insights", label: "Perspectives" },
    ]),
    programme: [
      ...links("fr", [
        { slug: "programme", label: "Le programme" },
        { slug: "impact", label: "Impact" },
      ]),
      { href: intake.href, label: intake.label },
      ...links("fr", [{ slug: "faq", label: "FAQ" }]),
    ],
    connect: links("fr", [
      { slug: "contact", label: "Nous contacter" },
      { slug: "partners", label: "Devenir partenaire" },
    ]),
    socialHeading: "Suivre",
    social: [],
    parent: { href: TELECEL_GROUP_URL, label: "Groupe Telecel" },
    contact: { href: publicPath("fr", "contact"), label: "Contacter ASIP" },
    copyright: `© ${new Date().getFullYear()} Groupe Telecel. Tous droits réservés.`,
    legal: [
      ...links("fr", [
        { slug: "terms", label: "Conditions d’utilisation" },
        { slug: "privacy", label: "Politique de confidentialité" },
      ]),
      {
        href: `${publicPath("fr", "privacy")}${COOKIES_ANCHOR}`,
        label: "Préférences de cookies",
      },
    ],
    apply: { href: intake.href, label: intake.label },
    login: { href: authPath("fr", "login"), label: "Connexion" },
  };
}
