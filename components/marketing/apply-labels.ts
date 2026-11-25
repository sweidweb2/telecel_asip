import type { Locale } from "@/constants/locales";

export type ApplyFormMode = "register" | "apply";

export type ApplyAuthGateLabels = {
  title: string;
  description: string;
  signInLabel: string;
  signUpLabel: string;
};

export type ApplyLabels = {
  formTitle: string;
  formDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  roleLabel: string;
  rolePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  countryLabel: string;
  countryPlaceholder: string;
  linkedinLabel: string;
  linkedinPlaceholder: string;
  linkedinHint: string;
  companyLabel: string;
  companyPlaceholder: string;
  websiteLabel: string;
  websitePlaceholder: string;
  websiteHint: string;
  companyCountryLabel: string;
  companyCountryPlaceholder: string;
  sectorLabel: string;
  sectorPlaceholder: string;
  pitchLabel: string;
  pitchPlaceholder: string;
  pitchHint: string;
  problemLabel: string;
  problemPlaceholder: string;
  problemHint: string;
  tractionLabel: string;
  tractionPlaceholder: string;
  tractionHint: string;
  fitLabel: string;
  fitPlaceholder: string;
  fitHint: string;
  consentLabel: string;
  commsLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successToast: string;
  successTitle: string;
  successDescription: string;
  successCloseLabel: string;
  turnstileHint: string;
};

const EN_REGISTER: ApplyLabels = {
  formTitle: "Register your interest",
  formDescription:
    "Share a short profile. The ASIP team uses this for updates when the next chapter opens. It is not an official application.",
  nameLabel: "Founder name",
  namePlaceholder: "Your full name",
  roleLabel: "Founder role",
  rolePlaceholder: "e.g. CEO, Co-founder",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  phoneLabel: "Phone / WhatsApp",
  phonePlaceholder: "+233 20 000 0000",
  countryLabel: "Your country",
  countryPlaceholder: "Country you are based in",
  linkedinLabel: "LinkedIn",
  linkedinPlaceholder: "linkedin.com/in/…",
  linkedinHint: "Optional",
  companyLabel: "Startup name",
  companyPlaceholder: "Your venture name",
  websiteLabel: "Website",
  websitePlaceholder: "example.com",
  websiteHint: "Optional",
  companyCountryLabel: "Company country",
  companyCountryPlaceholder: "Where the company is based",
  sectorLabel: "Sector",
  sectorPlaceholder: "e.g. Fintech, Healthtech, Telecom",
  pitchLabel: "Short note",
  pitchPlaceholder: "Anything useful for the team.",
  pitchHint: "Optional",
  problemLabel: "",
  problemPlaceholder: "",
  problemHint: "",
  tractionLabel: "",
  tractionPlaceholder: "",
  tractionHint: "",
  fitLabel: "",
  fitPlaceholder: "",
  fitHint: "",
  consentLabel:
    "I agree that ASIP may store and use this information to contact me about the program.",
  commsLabel: "Send me program updates by email.",
  submitLabel: "Submit interest",
  submittingLabel: "Submitting…",
  successToast: "Thank you. Your interest has been registered.",
  successTitle: "Thank you",
  successDescription:
    "Your interest has been registered. The ASIP team will use this for updates when the next chapter opens.",
  successCloseLabel: "Close",
  turnstileHint: "Complete the security check before submitting.",
};

const EN_APPLY: ApplyLabels = {
  formTitle: "Apply to ASIP",
  formDescription:
    "Official program intake. Complete the full profile so the team can review your venture.",
  nameLabel: "Founder name",
  namePlaceholder: "Your full name",
  roleLabel: "Founder role",
  rolePlaceholder: "e.g. CEO, Co-founder",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  phoneLabel: "Phone / WhatsApp",
  phonePlaceholder: "+233 20 000 0000",
  countryLabel: "Your country",
  countryPlaceholder: "Country you are based in",
  linkedinLabel: "LinkedIn",
  linkedinPlaceholder: "linkedin.com/in/…",
  linkedinHint: "Optional",
  companyLabel: "Startup name",
  companyPlaceholder: "Your venture name",
  websiteLabel: "Website",
  websitePlaceholder: "example.com",
  websiteHint: "Optional",
  companyCountryLabel: "Company country",
  companyCountryPlaceholder: "Where the company is based",
  sectorLabel: "Sector",
  sectorPlaceholder: "e.g. Fintech, Healthtech, Telecom",
  pitchLabel: "",
  pitchPlaceholder: "",
  pitchHint: "",
  problemLabel: "Problem & product",
  problemPlaceholder: "What problem you solve and what you have built.",
  problemHint: "40 to 4000 characters",
  tractionLabel: "Traction",
  tractionPlaceholder:
    "Users, revenue, funding, pilots, or other proof points.",
  tractionHint: "20 to 2000 characters",
  fitLabel: "Program fit",
  fitPlaceholder: "Growth needs and why ASIP now.",
  fitHint: "20 to 2000 characters",
  consentLabel:
    "I agree that ASIP may store and use this information to review my application.",
  commsLabel: "Send me program updates by email.",
  submitLabel: "Submit application",
  submittingLabel: "Submitting…",
  successToast: "Thank you. Your application has been submitted.",
  successTitle: "Thank you",
  successDescription:
    "Your application has been submitted. The ASIP team will review it and follow up when ready.",
  successCloseLabel: "Close",
  turnstileHint: "Complete the security check before submitting.",
};

const FR_REGISTER: ApplyLabels = {
  formTitle: "Manifester votre intérêt",
  formDescription:
    "Présentez brièvement votre profil. L’équipe ASIP s’en sert pour les mises à jour. Ce n’est pas une candidature officielle.",
  nameLabel: "Nom du fondateur",
  namePlaceholder: "Votre nom complet",
  roleLabel: "Rôle",
  rolePlaceholder: "ex. CEO, co-fondateur",
  emailLabel: "E-mail",
  emailPlaceholder: "vous@exemple.com",
  phoneLabel: "Téléphone / WhatsApp",
  phonePlaceholder: "+233 20 000 0000",
  countryLabel: "Votre pays",
  countryPlaceholder: "Pays où vous êtes basé",
  linkedinLabel: "LinkedIn",
  linkedinPlaceholder: "linkedin.com/in/…",
  linkedinHint: "Facultatif",
  companyLabel: "Nom de la startup",
  companyPlaceholder: "Nom de votre entreprise",
  websiteLabel: "Site web",
  websitePlaceholder: "exemple.com",
  websiteHint: "Facultatif",
  companyCountryLabel: "Pays de l’entreprise",
  companyCountryPlaceholder: "Pays du siège",
  sectorLabel: "Secteur",
  sectorPlaceholder: "ex. Fintech, Healthtech, Télécom",
  pitchLabel: "Note courte",
  pitchPlaceholder: "Toute information utile pour l’équipe.",
  pitchHint: "Facultatif",
  problemLabel: "",
  problemPlaceholder: "",
  problemHint: "",
  tractionLabel: "",
  tractionPlaceholder: "",
  tractionHint: "",
  fitLabel: "",
  fitPlaceholder: "",
  fitHint: "",
  consentLabel:
    "J’accepte qu’ASIP conserve et utilise ces informations pour me contacter au sujet du programme.",
  commsLabel: "Recevoir des mises à jour du programme par e-mail.",
  submitLabel: "Envoyer",
  submittingLabel: "Envoi…",
  successToast: "Merci. Votre intérêt a bien été enregistré.",
  successTitle: "Merci",
  successDescription:
    "Votre intérêt a bien été enregistré. L’équipe ASIP s’en servira pour les mises à jour lorsque le prochain chapitre ouvrira.",
  successCloseLabel: "Fermer",
  turnstileHint: "Complétez la vérification de sécurité avant d’envoyer.",
};

const FR_APPLY: ApplyLabels = {
  formTitle: "Postuler à ASIP",
  formDescription:
    "Candidature officielle. Complétez le profil pour que l’équipe examine votre entreprise.",
  nameLabel: "Nom du fondateur",
  namePlaceholder: "Votre nom complet",
  roleLabel: "Rôle",
  rolePlaceholder: "ex. CEO, co-fondateur",
  emailLabel: "E-mail",
  emailPlaceholder: "vous@exemple.com",
  phoneLabel: "Téléphone / WhatsApp",
  phonePlaceholder: "+233 20 000 0000",
  countryLabel: "Votre pays",
  countryPlaceholder: "Pays où vous êtes basé",
  linkedinLabel: "LinkedIn",
  linkedinPlaceholder: "linkedin.com/in/…",
  linkedinHint: "Facultatif",
  companyLabel: "Nom de la startup",
  companyPlaceholder: "Nom de votre entreprise",
  websiteLabel: "Site web",
  websitePlaceholder: "exemple.com",
  websiteHint: "Facultatif",
  companyCountryLabel: "Pays de l’entreprise",
  companyCountryPlaceholder: "Pays du siège",
  sectorLabel: "Secteur",
  sectorPlaceholder: "ex. Fintech, Healthtech, Télécom",
  pitchLabel: "",
  pitchPlaceholder: "",
  pitchHint: "",
  problemLabel: "Problème & produit",
  problemPlaceholder:
    "Le problème que vous résolvez et ce que vous avez construit.",
  problemHint: "40 à 4000 caractères",
  tractionLabel: "Traction",
  tractionPlaceholder: "Utilisateurs, revenus, financement, pilots…",
  tractionHint: "20 à 2000 caractères",
  fitLabel: "Adéquation au programme",
  fitPlaceholder: "Besoins de croissance et pourquoi ASIP maintenant.",
  fitHint: "20 à 2000 caractères",
  consentLabel:
    "J’accepte qu’ASIP conserve et utilise ces informations pour examiner ma candidature.",
  commsLabel: "Recevoir des mises à jour du programme par e-mail.",
  submitLabel: "Envoyer la candidature",
  submittingLabel: "Envoi…",
  successToast: "Merci. Votre candidature a bien été envoyée.",
  successTitle: "Merci",
  successDescription:
    "Votre candidature a bien été envoyée. L’équipe ASIP l’examinera et vous contactera le moment venu.",
  successCloseLabel: "Fermer",
  turnstileHint: "Complétez la vérification de sécurité avant d’envoyer.",
};

export function applyLabelsFor(
  locale: Locale,
  mode: ApplyFormMode = "register",
): ApplyLabels {
  if (locale === "fr") {
    return mode === "apply" ? FR_APPLY : FR_REGISTER;
  }
  return mode === "apply" ? EN_APPLY : EN_REGISTER;
}

/** Shown when a signed-in non-startup (e.g. staff) hits founder intake. */
export function applyStartupOnlyLabelsFor(locale: Locale): {
  title: string;
  description: string;
} {
  if (locale === "fr") {
    return {
      title: "Compte startup requis",
      description:
        "Seuls les comptes startup peuvent utiliser ce formulaire. Les comptes staff doivent utiliser le tableau de bord.",
    };
  }
  return {
    title: "Startup account required",
    description:
      "Only startup accounts can use this form. Staff accounts should use the dashboard instead.",
  };
}

export function applyAuthGateLabelsFor(
  locale: Locale,
  mode: ApplyFormMode = "register",
): ApplyAuthGateLabels {
  if (locale === "fr") {
    return mode === "apply"
      ? {
          title: "Connexion requise pour candidater",
          description:
            "Créez un compte viewer ou connectez-vous, puis renvoyez votre candidature ASIP.",
          signInLabel: "Se connecter",
          signUpLabel: "Créer un compte",
        }
      : {
          title: "Connexion requise pour manifester votre intérêt",
          description:
            "Créez un compte viewer ou connectez-vous, puis envoyez votre profil à l’équipe ASIP.",
          signInLabel: "Se connecter",
          signUpLabel: "Créer un compte",
        };
  }

  return mode === "apply"
    ? {
        title: "Sign in to apply",
        description:
          "Create a viewer account or sign in, then submit your ASIP application.",
        signInLabel: "Sign in",
        signUpLabel: "Create account",
      }
    : {
        title: "Sign in to register interest",
        description:
          "Create a viewer account or sign in, then share your profile with the ASIP team.",
        signInLabel: "Sign in",
        signUpLabel: "Create account",
      };
}
