import type { Locale } from "@/constants/locales";

export type NewsletterSignupLabels = {
  title: string;
  description: string;
  inactiveNote: string;
  emailLabel: string;
  emailPlaceholder: string;
  consentLabel: string;
  submit: string;
  submitting: string;
  turnstileHint: string;
};

const EN: NewsletterSignupLabels = {
  title: "Get ASIP updates",
  description:
    "Occasional programme and portfolio notes. No spam — unsubscribe any time once delivery is live.",
  inactiveNote:
    "Updates signup is built but inactive until privacy, routing and an owner are confirmed.",
  emailLabel: "Email",
  emailPlaceholder: "you@company.com",
  consentLabel: "I agree to ASIP storing my email for programme updates.",
  submit: "Register for updates",
  submitting: "Submitting…",
  turnstileHint: "Complete the security check to continue.",
};

const FR: NewsletterSignupLabels = {
  title: "Recevoir les mises à jour ASIP",
  description:
    "Notes ponctuelles sur le programme et le portefeuille. Pas de spam — désinscription une fois l’envoi activé.",
  inactiveNote:
    "L’inscription est prête mais inactive tant que la confidentialité, le routage et un responsable ne sont pas confirmés.",
  emailLabel: "E-mail",
  emailPlaceholder: "vous@entreprise.com",
  consentLabel:
    "J’accepte qu’ASIP conserve mon e-mail pour les mises à jour du programme.",
  submit: "S’inscrire aux mises à jour",
  submitting: "Envoi…",
  turnstileHint: "Complétez la vérification de sécurité pour continuer.",
};

export function newsletterSignupLabelsFor(
  locale: Locale,
): NewsletterSignupLabels {
  return locale === "fr" ? FR : EN;
}
