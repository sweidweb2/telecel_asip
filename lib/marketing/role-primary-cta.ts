import type { Locale } from "@/constants/locales";
import { roleHomePath } from "@/lib/auth/role-landing";
import { intakeCtaFor, type IntakeCta } from "@/lib/marketing/intake-cta";
import type { CurrentUserProfile } from "@/types/profile";

export type PrimaryCta = {
  href: string;
  label: string;
};

/** Audience used to personalize hero pathways and page CTAs. */
export type MarketingAudience =
  | "guest"
  | "startup"
  | "investor"
  | "staff";

const LABELS = {
  en: {
    guest: "Feeling interested",
    startupClosed: "Register as a founder",
    investorClosed: "Register as an investor",
    dashboard: "Dashboard",
    admin: "Admin",
  },
  fr: {
    guest: "Je suis intéressé(e)",
    startupClosed: "S’inscrire comme fondateur",
    investorClosed: "S’inscrire comme investisseur",
    dashboard: "Tableau de bord",
    admin: "Admin",
  },
} as const;

export function marketingAudienceFor(
  profile: Pick<CurrentUserProfile, "role" | "type"> | null,
): MarketingAudience {
  if (!profile) return "guest";
  if (profile.role === "admin" || profile.type === "admin") return "staff";
  if (profile.role === "editor") return "staff";
  if (profile.type === "investor") return "investor";
  return "startup";
}

/**
 * Staff shell link for the account menu — never the marketing chrome CTA.
 */
export function portalCtaFor(
  profile: Pick<CurrentUserProfile, "role" | "type"> | null,
  locale: Locale,
): PrimaryCta | null {
  if (!profile) return null;
  const copy = LABELS[locale];
  if (profile.role === "admin" || profile.type === "admin") {
    return { href: roleHomePath("admin", locale), label: copy.admin };
  }
  if (profile.role === "editor") {
    return { href: roleHomePath("editor", locale), label: copy.dashboard };
  }
  return null;
}

/**
 * Primary marketing CTA for chrome + page heroes.
 * Open cohort → always “Apply to ASIP” (portal lives in the avatar menu).
 * Closed → guest/staff “Feeling interested”; founders/investors get
 * register-interest labels. Intake href always follows `open_applications`.
 */
export function rolePrimaryCtaFor(options: {
  locale: Locale;
  openApplications: boolean;
  profile: Pick<CurrentUserProfile, "role" | "type"> | null;
}): PrimaryCta {
  const { locale, openApplications, profile } = options;
  const copy = LABELS[locale];
  const intake = intakeCtaFor(locale, openApplications);
  const audience = marketingAudienceFor(profile);

  if (openApplications) {
    return { href: intake.href, label: intake.label };
  }

  if (audience === "guest" || audience === "staff") {
    return { href: intake.href, label: copy.guest };
  }

  if (audience === "investor") {
    return { href: intake.href, label: copy.investorClosed };
  }

  return { href: intake.href, label: copy.startupClosed };
}

/** Intake-shaped CTA for pages that still expect {@link IntakeCta}. */
export function roleIntakeCtaFor(options: {
  locale: Locale;
  openApplications: boolean;
  profile: Pick<CurrentUserProfile, "role" | "type"> | null;
}): IntakeCta {
  const primary = rolePrimaryCtaFor(options);
  const base = intakeCtaFor(options.locale, options.openApplications);
  return {
    slug: base.slug,
    href: primary.href,
    label: primary.label,
  };
}
