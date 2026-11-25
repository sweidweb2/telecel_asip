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
    startupOpen: "Apply as a founder",
    investorClosed: "Register as an investor",
    investorOpen: "Engage as an investor",
    dashboard: "Dashboard",
    admin: "Admin",
  },
  fr: {
    guest: "Je suis intéressé(e)",
    startupClosed: "S’inscrire comme fondateur",
    startupOpen: "Postuler comme fondateur",
    investorClosed: "S’inscrire comme investisseur",
    investorOpen: "Échanger comme investisseur",
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
 * Primary marketing CTA: guest vs audience type vs staff shell.
 * Guest always uses “Feeling interested”; intake href still follows
 * `open_applications`. Staff land on their role home.
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

  if (audience === "guest") {
    return { href: intake.href, label: copy.guest };
  }

  if (audience === "staff") {
    if (profile?.role === "admin" || profile?.type === "admin") {
      return { href: roleHomePath("admin", locale), label: copy.admin };
    }
    return { href: roleHomePath("editor", locale), label: copy.dashboard };
  }

  if (audience === "investor") {
    return {
      href: intake.href,
      label: openApplications ? copy.investorOpen : copy.investorClosed,
    };
  }

  return {
    href: intake.href,
    label: openApplications ? copy.startupOpen : copy.startupClosed,
  };
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
    // Staff may point at /admin or /dashboard; page CTAs use href as-is.
    href: primary.href,
    label: primary.label,
  };
}
