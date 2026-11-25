import type { Locale } from "@/constants/locales";
import type { PublicPageSlug } from "@/constants/public-pages";
import { authPath, publicPath } from "@/constants/routes";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

export type NavLeaf = {
  kind: "link";
  href: string;
  label: string;
};

export type NavGroup = {
  kind: "group";
  href: string;
  label: string;
  children: NavLeaf[];
};

export type NavEntry = NavLeaf | NavGroup;

export type NavItem = {
  href: string;
  label: string;
};

export type SiteNavLabels = {
  items: NavEntry[];
  languageGroupLabel: string;
  menuLabel: string;
  /** Short line beside the language toggle and inside the mobile sheet. */
  masthead: string;
  /** Founders dropdown label for the directory. The trigger still uses the Founders item label. */
  foundersDirectory: string;
  apply: NavItem;
  login: NavItem;
  signup: NavItem;
  /** Desktop settings / account menu trigger. */
  settingsMenuLabel: string;
};

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return entry.kind === "group";
}

/**
 * Header order is one tree. Each locale only supplies labels.
 * Footer groups stay in `site-footer-labels.ts`.
 * The CTA follows `open_applications`: Apply while a cohort is open,
 * Register Interest otherwise. Contact, FAQ, and legal pages live in the footer.
 */
type HeaderLeafSlug = Extract<
  PublicPageSlug,
  "" | "about" | "programme" | "impact" | "partners" | "insights"
>;
type HeaderLabelSlug = HeaderLeafSlug | "founders";

const HEADER_NAV_LABELS: Record<Locale, Record<HeaderLabelSlug, string>> = {
  en: {
    "": "Home",
    about: "About",
    programme: "Program",
    founders: "Founders",
    impact: "Impact",
    partners: "Partners",
    insights: "Insights",
  },
  fr: {
    "": "Accueil",
    about: "À propos",
    programme: "Programme",
    founders: "Fondateurs",
    impact: "Impact",
    partners: "Partenaires",
    insights: "Perspectives",
  },
};

const NAV_CHROME: Record<
  Locale,
  Pick<
    SiteNavLabels,
    | "languageGroupLabel"
    | "menuLabel"
    | "masthead"
    | "foundersDirectory"
    | "settingsMenuLabel"
  > & { loginLabel: string; signupLabel: string }
> = {
  en: {
    languageGroupLabel: "Language",
    menuLabel: "Menu",
    masthead: "A Telecel Group Program",
    foundersDirectory: "Directory",
    loginLabel: "Login",
    signupLabel: "Sign up",
    settingsMenuLabel: "Account and language",
  },
  fr: {
    languageGroupLabel: "Langue",
    menuLabel: "Menu",
    masthead: "Un programme du Groupe Telecel",
    foundersDirectory: "Annuaire",
    loginLabel: "Connexion",
    signupLabel: "S’inscrire",
    settingsMenuLabel: "Compte et langue",
  },
};

function leaf(locale: Locale, slug: HeaderLeafSlug): NavLeaf {
  return {
    kind: "link",
    href: publicPath(locale, slug),
    label: HEADER_NAV_LABELS[locale][slug],
  };
}

function navLabels(locale: Locale, openApplications: boolean): SiteNavLabels {
  const intake = intakeCtaFor(locale, openApplications);
  const chrome = NAV_CHROME[locale];
  const labels = HEADER_NAV_LABELS[locale];
  const foundersHref = publicPath(locale, "founders");

  return {
    languageGroupLabel: chrome.languageGroupLabel,
    menuLabel: chrome.menuLabel,
    masthead: chrome.masthead,
    foundersDirectory: chrome.foundersDirectory,
    settingsMenuLabel: chrome.settingsMenuLabel,
    items: [
      leaf(locale, ""),
      leaf(locale, "about"),
      leaf(locale, "programme"),
      // Alumni stays hidden until its public proposition is approved (Text Pack v2).
      { kind: "link", href: foundersHref, label: labels.founders },
      leaf(locale, "impact"),
      leaf(locale, "partners"),
      leaf(locale, "insights"),
    ],
    apply: { href: intake.href, label: intake.label },
    login: { href: authPath(locale, "login"), label: chrome.loginLabel },
    signup: { href: authPath(locale, "signup"), label: chrome.signupLabel },
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
