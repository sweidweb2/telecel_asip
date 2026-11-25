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

type FooterStrings = {
  brand: string;
  headline: string;
  statement: string;
  exploreHeading: string;
  programmeHeading: string;
  connectHeading: string;
  socialHeading: string;
  parentLabel: string;
  contactLabel: string;
  /** Year is interpolated at call time. */
  copyright: (year: number) => string;
  loginLabel: string;
  explore: { slug: PublicPageSlug; label: string }[];
  /** Programme links before the intake CTA. */
  programmeBefore: { slug: PublicPageSlug; label: string }[];
  /** Programme links after the intake CTA. */
  programmeAfter: { slug: PublicPageSlug; label: string }[];
  connect: { slug: PublicPageSlug; label: string }[];
  legal: { slug: PublicPageSlug; label: string }[];
  cookiesLabel: string;
};

const FOOTER_STRINGS: Record<Locale, FooterStrings> = {
  en: {
    brand: "ASIP",
    headline: "Built around African founders. Backed by Telecel Group.",
    statement:
      "ASIP brings founders together with investors, operators and partners around practical pathways to build and scale technology businesses in African markets.",
    exploreHeading: "Explore",
    programmeHeading: "Program",
    connectHeading: "Contact",
    socialHeading: "Follow",
    parentLabel: "Explore founders",
    contactLabel: "Contact ASIP",
    copyright: (year) =>
      `© ${year} Telecel Group. All rights reserved.`,
    loginLabel: "Login",
    explore: [
      { slug: "", label: "Home" },
      { slug: "about", label: "About" },
      { slug: "founders", label: "Founders" },
      { slug: "partners", label: "Partners" },
      { slug: "insights", label: "Insights" },
    ],
    programmeBefore: [
      { slug: "programme", label: "Program" },
      { slug: "impact", label: "Impact" },
    ],
    programmeAfter: [{ slug: "faq", label: "FAQ" }],
    connect: [
      { slug: "contact", label: "Contact" },
    ],
    legal: [
      { slug: "privacy", label: "Privacy" },
      { slug: "terms", label: "Terms" },
    ],
    cookiesLabel: "Cookie preferences",
  },
  fr: {
    brand: "ASIP",
    headline: "Fondateurs africains. Faits pour grandir.",
    statement:
      "ASIP est un programme du Groupe Telecel qui soutient des fondateurs africains ambitieux de la tech avec l’expertise, les voies de financement, l’accès aux marchés et les relations qui aident les entreprises à croître.",
    exploreHeading: "Explorer",
    programmeHeading: "Programme",
    connectHeading: "Contact",
    socialHeading: "Suivre",
    parentLabel: "Explorer les fondateurs",
    contactLabel: "Contacter ASIP",
    copyright: (year) =>
      `© ${year} Groupe Telecel. Tous droits réservés.`,
    loginLabel: "Connexion",
    explore: [
      { slug: "", label: "Accueil" },
      { slug: "about", label: "À propos" },
      { slug: "founders", label: "Fondateurs" },
      { slug: "insights", label: "Perspectives" },
    ],
    programmeBefore: [
      { slug: "programme", label: "Le programme" },
      { slug: "impact", label: "Impact" },
    ],
    programmeAfter: [{ slug: "faq", label: "FAQ" }],
    connect: [
      { slug: "contact", label: "Nous contacter" },
      { slug: "partners", label: "Devenir partenaire" },
    ],
    legal: [
      { slug: "terms", label: "Conditions d’utilisation" },
      { slug: "privacy", label: "Politique de confidentialité" },
    ],
    cookiesLabel: "Préférences de cookies",
  },
};

function links(
  locale: Locale,
  entries: { slug: PublicPageSlug; label: string }[],
): FooterLink[] {
  return entries.map(({ slug, label }) => ({
    href: publicPath(locale, slug),
    label,
  }));
}

/**
 * One footer structure; each locale only supplies strings.
 * Explore / Programme / Contact groups stay separate from the header tree.
 */
export function footerLabelsFor(
  locale: Locale,
  openApplications = false,
): SiteFooterLabels {
  const intake = intakeCtaFor(locale, openApplications);
  const strings = FOOTER_STRINGS[locale];

  return {
    brand: strings.brand,
    headline: strings.headline,
    statement: strings.statement,
    exploreHeading: strings.exploreHeading,
    programmeHeading: strings.programmeHeading,
    connectHeading: strings.connectHeading,
    explore: links(locale, strings.explore),
    programme: [
      ...links(locale, strings.programmeBefore),
      { href: intake.href, label: intake.label },
      ...links(locale, strings.programmeAfter),
    ],
    connect: links(locale, strings.connect),
    socialHeading: strings.socialHeading,
    social: [],
    // Footer CTAs per Text Pack v2: Explore founders | Contact ASIP.
    parent: { href: publicPath(locale, "founders"), label: strings.parentLabel },
    contact: {
      href: publicPath(locale, "contact"),
      label: strings.contactLabel,
    },
    copyright: strings.copyright(new Date().getFullYear()),
    legal: [
      ...links(locale, strings.legal),
      {
        href: `${publicPath(locale, "privacy")}${COOKIES_ANCHOR}`,
        label: strings.cookiesLabel,
      },
    ],
    apply: { href: intake.href, label: intake.label },
    login: { href: authPath(locale, "login"), label: strings.loginLabel },
  };
}

export function enFooterLabels(openApplications = false): SiteFooterLabels {
  return footerLabelsFor("en", openApplications);
}

export function frFooterLabels(openApplications = false): SiteFooterLabels {
  return footerLabelsFor("fr", openApplications);
}
