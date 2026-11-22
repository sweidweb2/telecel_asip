import type { Locale } from "@/constants/locales";
import type { ApplyFormMode } from "@/components/marketing/apply-labels";

export type InvestorIntakeLabels = {
  pageEyebrow: string;
  pageTitle: string;
  pageDescription: string;
  formTitle: string;
  formDescription: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  phoneHint: string;
  organizationLabel: string;
  jobTitleLabel: string;
  jobTitleHint: string;
  linkedinLabel: string;
  linkedinHint: string;
  investorTypeLabel: string;
  focusNoteLabel: string;
  focusNoteHint: string;
  focusNotePlaceholder: string;
  stagesLabel: string;
  ticketSizeLabel: string;
  sectorsLabel: string;
  geographiesLabel: string;
  intentLabel: string;
  thesisLabel: string;
  thesisHint: string;
  thesisPlaceholder: string;
  timelineLabel: string;
  timelineHint: string;
  referredByLabel: string;
  referredByHint: string;
  messageLabel: string;
  messageHint: string;
  messagePlaceholder: string;
  consentLabel: string;
  commsLabel: string;
  turnstileHint: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successDescription: string;
  successCloseLabel: string;
  kindLabels: Record<string, string>;
  stageLabels: Record<string, string>;
  ticketLabels: Record<string, string>;
  intentLabels: Record<string, string>;
  timelineLabels: Record<string, string>;
};

const KIND = {
  en: {
    angel: "Angel",
    vc: "VC / fund",
    corporate: "Corporate",
    dfi: "DFI / development finance",
    family_office: "Family office",
    other: "Other",
  },
  fr: {
    angel: "Business angel",
    vc: "VC / fonds",
    corporate: "Corporate",
    dfi: "DFI / finance du développement",
    family_office: "Family office",
    other: "Autre",
  },
} as const;

const STAGE = {
  en: {
    pre_seed: "Pre-seed",
    seed: "Seed",
    series_a: "Series A",
    growth: "Growth",
  },
  fr: {
    pre_seed: "Pré-amorçage",
    seed: "Amorçage",
    series_a: "Série A",
    growth: "Croissance",
  },
} as const;

const TICKET = {
  en: {
    under_50k: "Under $50k",
    "50k_250k": "$50k–$250k",
    "250k_1m": "$250k–$1m",
    "1m_plus": "$1m+",
    undisclosed: "Prefer not to say",
  },
  fr: {
    under_50k: "Moins de 50 k$",
    "50k_250k": "50 k$–250 k$",
    "250k_1m": "250 k$–1 M$",
    "1m_plus": "1 M$+",
    undisclosed: "Préfère ne pas dire",
  },
} as const;

const INTENT = {
  en: {
    portfolio_access: "Explore the portfolio",
    introductions: "Request introductions",
    co_invest: "Co-invest conversations",
    pilot_partnership: "Pilot / commercial partnership",
    mentorship: "Mentorship / operator support",
    other: "Other",
  },
  fr: {
    portfolio_access: "Explorer le portefeuille",
    introductions: "Demander des introductions",
    co_invest: "Conversations de co-investissement",
    pilot_partnership: "Partenariat commercial / pilote",
    mentorship: "Mentorat / expertise opérationnelle",
    other: "Autre",
  },
} as const;

const TIMELINE = {
  en: {
    exploring: "Exploring",
    this_quarter: "This quarter",
    this_year: "This year",
  },
  fr: {
    exploring: "En exploration",
    this_quarter: "Ce trimestre",
    this_year: "Cette année",
  },
} as const;

const REGISTER: Record<Locale, Omit<InvestorIntakeLabels, "kindLabels" | "stageLabels" | "ticketLabels" | "intentLabels" | "timelineLabels">> = {
  en: {
    pageEyebrow: "For investors",
    pageTitle: "Connect with ASIP founders.",
    pageDescription:
      "Register interest to hear about portfolio introductions, co-invest routes and partnership conversations when they fit.",
    formTitle: "Register investor interest",
    formDescription:
      "Tell us who you are and what you are looking for. We will share confirmed updates and relevant routes to engage.",
    nameLabel: "Full name",
    emailLabel: "Email",
    phoneLabel: "Phone / WhatsApp",
    phoneHint: "Optional",
    organizationLabel: "Organisation",
    jobTitleLabel: "Job title",
    jobTitleHint: "Optional",
    linkedinLabel: "LinkedIn",
    linkedinHint: "Optional",
    investorTypeLabel: "Investor type",
    focusNoteLabel: "What are you looking for?",
    focusNoteHint: "Optional",
    focusNotePlaceholder:
      "Sectors, stages, markets, or the kind of founder conversations you want.",
    stagesLabel: "Stages of interest",
    ticketSizeLabel: "Typical ticket size",
    sectorsLabel: "Sectors of interest",
    geographiesLabel: "Geographies of interest",
    intentLabel: "How do you want to engage?",
    thesisLabel: "Investment or partnership thesis",
    thesisHint: "Required",
    thesisPlaceholder:
      "Describe the problems, stages and markets you focus on, and how ASIP founders could fit.",
    timelineLabel: "Timeline",
    timelineHint: "Optional",
    referredByLabel: "How did you hear about ASIP?",
    referredByHint: "Optional",
    messageLabel: "Anything else?",
    messageHint: "Optional",
    messagePlaceholder: "Add context that helps the ASIP team route your request.",
    consentLabel:
      "I agree that ASIP may store and use this information to contact me about portfolio and programme opportunities.",
    commsLabel: "Send me ASIP investor and programme updates by email.",
    turnstileHint: "Complete the security check before submitting.",
    submitLabel: "Register interest",
    submittingLabel: "Submitting…",
    successTitle: "Interest registered",
    successDescription:
      "Thanks. The ASIP team will follow up when there is a relevant next step.",
    successCloseLabel: "Close",
  },
  fr: {
    pageEyebrow: "Pour les investisseurs",
    pageTitle: "Connectez-vous aux fondateurs ASIP.",
    pageDescription:
      "Manifestez votre intérêt pour être informé des introductions portefeuille, co-investissements et partenariats pertinents.",
    formTitle: "Manifester un intérêt investisseur",
    formDescription:
      "Indiquez qui vous êtes et ce que vous recherchez. Nous partagerons les mises à jour confirmées et les voies d’engagement pertinentes.",
    nameLabel: "Nom complet",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone / WhatsApp",
    phoneHint: "Facultatif",
    organizationLabel: "Organisation",
    jobTitleLabel: "Titre",
    jobTitleHint: "Facultatif",
    linkedinLabel: "LinkedIn",
    linkedinHint: "Facultatif",
    investorTypeLabel: "Type d’investisseur",
    focusNoteLabel: "Que recherchez-vous ?",
    focusNoteHint: "Facultatif",
    focusNotePlaceholder:
      "Secteurs, stades, marchés, ou le type de conversations fondateurs que vous souhaitez.",
    stagesLabel: "Stades d’intérêt",
    ticketSizeLabel: "Taille de ticket typique",
    sectorsLabel: "Secteurs d’intérêt",
    geographiesLabel: "Géographies d’intérêt",
    intentLabel: "Comment souhaitez-vous vous engager ?",
    thesisLabel: "Thèse d’investissement ou de partenariat",
    thesisHint: "Obligatoire",
    thesisPlaceholder:
      "Décrivez les problèmes, stades et marchés que vous ciblez, et comment les fondateurs ASIP pourraient correspondre.",
    timelineLabel: "Calendrier",
    timelineHint: "Facultatif",
    referredByLabel: "Comment avez-vous entendu parler d’ASIP ?",
    referredByHint: "Facultatif",
    messageLabel: "Autre chose ?",
    messageHint: "Facultatif",
    messagePlaceholder:
      "Ajoutez le contexte qui aidera l’équipe ASIP à orienter votre demande.",
    consentLabel:
      "J’accepte qu’ASIP conserve et utilise ces informations pour me contacter au sujet d’opportunités de portefeuille et de programme.",
    commsLabel:
      "Recevoir par e-mail les mises à jour investisseur et programme d’ASIP.",
    turnstileHint: "Complétez la vérification de sécurité avant d’envoyer.",
    submitLabel: "Manifester mon intérêt",
    submittingLabel: "Envoi…",
    successTitle: "Intérêt enregistré",
    successDescription:
      "Merci. L’équipe ASIP vous recontactera lorsqu’une prochaine étape pertinente sera disponible.",
    successCloseLabel: "Fermer",
  },
};

const APPLY: Record<
  Locale,
  Pick<
    InvestorIntakeLabels,
    | "pageEyebrow"
    | "pageTitle"
    | "pageDescription"
    | "formTitle"
    | "formDescription"
    | "submitLabel"
    | "submittingLabel"
    | "successTitle"
    | "successDescription"
  >
> = {
  en: {
    pageEyebrow: "For investors",
    pageTitle: "Engage with ASIP founders.",
    pageDescription:
      "Share your thesis and ticket range so ASIP can route relevant portfolio, co-invest and partnership conversations.",
    formTitle: "Investor engagement",
    formDescription:
      "Share your thesis, ticket range and focus so ASIP can route relevant founder, portfolio and partnership conversations.",
    submitLabel: "Submit engagement request",
    submittingLabel: "Submitting…",
    successTitle: "Request submitted",
    successDescription:
      "Thanks. The ASIP team will review your request and follow up where there is a fit.",
  },
  fr: {
    pageEyebrow: "Pour les investisseurs",
    pageTitle: "Engagez-vous avec les fondateurs ASIP.",
    pageDescription:
      "Partagez votre thèse et votre ticket pour qu’ASIP oriente les conversations portefeuille, co-investissement et partenariats pertinentes.",
    formTitle: "Engagement investisseur",
    formDescription:
      "Partagez votre thèse, votre ticket et votre focus pour qu’ASIP oriente les conversations fondateurs, portefeuille et partenariats pertinentes.",
    submitLabel: "Envoyer la demande d’engagement",
    submittingLabel: "Envoi…",
    successTitle: "Demande envoyée",
    successDescription:
      "Merci. L’équipe ASIP examinera votre demande et vous recontactera en cas d’adéquation.",
  },
};

export function investorIntakeLabelsFor(
  locale: Locale,
  mode: ApplyFormMode,
): InvestorIntakeLabels {
  const base = REGISTER[locale];
  const apply = APPLY[locale];
  return {
    ...base,
    ...(mode === "apply" ? apply : null),
    kindLabels: KIND[locale],
    stageLabels: STAGE[locale],
    ticketLabels: TICKET[locale],
    intentLabels: INTENT[locale],
    timelineLabels: TIMELINE[locale],
  };
}
