import { z } from "zod";

import {
  INVESTOR_ENGAGEMENT_INTENTS,
  INVESTOR_GEOGRAPHY_OPTIONS,
  INVESTOR_KINDS,
  INVESTOR_SECTOR_OPTIONS,
  INVESTOR_STAGES,
  INVESTOR_TICKET_SIZES,
  INVESTOR_TIMELINES,
} from "@/constants/investor-intake";
import { DEFAULT_LOCALE, type Locale } from "@/constants/locales";

type Messages = {
  fullNameMin: string;
  fullNameMax: string;
  invalidEmail: string;
  emailMax: string;
  phoneInvalid: string;
  organizationMin: string;
  organizationMax: string;
  jobTitleMin: string;
  jobTitleMax: string;
  linkedinInvalid: string;
  investorTypeInvalid: string;
  stagesRequired: string;
  ticketSizeInvalid: string;
  sectorsRequired: string;
  geographiesRequired: string;
  intentInvalid: string;
  thesisMin: string;
  thesisMax: string;
  timelineInvalid: string;
  referredByMin: string;
  referredByMax: string;
  messageMin: string;
  messageMax: string;
  consentRequired: string;
  turnstileRequired: string;
};

const MESSAGES: Record<Locale, Messages> = {
  en: {
    fullNameMin: "Name must be at least 2 characters",
    fullNameMax: "Name must be at most 100 characters",
    invalidEmail: "Enter a valid email address",
    emailMax: "Email must be at most 254 characters",
    phoneInvalid:
      "Enter a valid phone number (7–20 digits, spaces, or +()- allowed)",
    organizationMin: "Organisation must be at least 2 characters",
    organizationMax: "Organisation must be at most 120 characters",
    jobTitleMin: "Job title must be at least 2 characters",
    jobTitleMax: "Job title must be at most 80 characters",
    linkedinInvalid: "LinkedIn must be a valid http(s) URL",
    investorTypeInvalid: "Choose an investor type",
    stagesRequired: "Select at least one stage",
    ticketSizeInvalid: "Choose a ticket size",
    sectorsRequired: "Select at least one sector",
    geographiesRequired: "Select at least one geography",
    intentInvalid: "Choose how you want to engage",
    thesisMin: "Thesis must be at least 40 characters",
    thesisMax: "Thesis must be at most 2000 characters",
    timelineInvalid: "Choose a timeline",
    referredByMin: "Referral must be at least 2 characters",
    referredByMax: "Referral must be at most 120 characters",
    messageMin: "Message must be at least 20 characters",
    messageMax: "Message must be at most 1000 characters",
    consentRequired: "You must agree before submitting",
    turnstileRequired: "Please complete the security check",
  },
  fr: {
    fullNameMin: "Le nom doit contenir au moins 2 caractères",
    fullNameMax: "Le nom doit contenir au plus 100 caractères",
    invalidEmail: "Entrez une adresse e-mail valide",
    emailMax: "L’e-mail doit contenir au plus 254 caractères",
    phoneInvalid:
      "Entrez un numéro de téléphone valide (7–20 chiffres ; espaces ou +()- autorisés)",
    organizationMin: "L’organisation doit contenir au moins 2 caractères",
    organizationMax: "L’organisation doit contenir au plus 120 caractères",
    jobTitleMin: "Le titre doit contenir au moins 2 caractères",
    jobTitleMax: "Le titre doit contenir au plus 80 caractères",
    linkedinInvalid: "LinkedIn doit être une URL http(s) valide",
    investorTypeInvalid: "Choisissez un type d’investisseur",
    stagesRequired: "Sélectionnez au moins un stade",
    ticketSizeInvalid: "Choisissez une taille de ticket",
    sectorsRequired: "Sélectionnez au moins un secteur",
    geographiesRequired: "Sélectionnez au moins une géographie",
    intentInvalid: "Choisissez votre mode d’engagement",
    thesisMin: "La thèse doit contenir au moins 40 caractères",
    thesisMax: "La thèse doit contenir au plus 2000 caractères",
    timelineInvalid: "Choisissez un calendrier",
    referredByMin: "La référence doit contenir au moins 2 caractères",
    referredByMax: "La référence doit contenir au plus 120 caractères",
    messageMin: "Le message doit contenir au moins 20 caractères",
    messageMax: "Le message doit contenir au plus 1000 caractères",
    consentRequired: "Vous devez accepter avant d’envoyer",
    turnstileRequired: "Veuillez compléter la vérification de sécurité",
  },
};

const PHONE_REGEX = /^\+?[0-9\s().-]{7,20}$/;
const HTTP_URL_REGEX = /^https?:\/\/.+/i;

function optionalPhone(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_REGEX.test(value), message);
}

function optionalHttpUrl(message: string) {
  return z
    .string()
    .trim()
    .max(500, message)
    .refine((value) => value === "" || HTTP_URL_REGEX.test(value), message);
}

export function investorEngagementSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const messages = MESSAGES[locale];

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, messages.fullNameMin)
      .max(100, messages.fullNameMax),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, messages.invalidEmail)
      .max(254, messages.emailMax)
      .pipe(z.email(messages.invalidEmail)),
    phone: optionalPhone(messages.phoneInvalid),
    organization: z
      .string()
      .trim()
      .min(2, messages.organizationMin)
      .max(120, messages.organizationMax),
    jobTitle: z
      .string()
      .trim()
      .max(80, messages.jobTitleMax)
      .refine(
        (value) => value === "" || value.length >= 2,
        messages.jobTitleMin,
      ),
    linkedin: optionalHttpUrl(messages.linkedinInvalid),
    investorType: z.enum(INVESTOR_KINDS, messages.investorTypeInvalid),
    stages: z
      .array(z.enum(INVESTOR_STAGES))
      .min(1, messages.stagesRequired)
      .max(4, messages.stagesRequired),
    ticketSize: z.enum(INVESTOR_TICKET_SIZES, messages.ticketSizeInvalid),
    sectors: z
      .array(z.enum(INVESTOR_SECTOR_OPTIONS))
      .min(1, messages.sectorsRequired)
      .max(12, messages.sectorsRequired),
    geographies: z
      .array(z.enum(INVESTOR_GEOGRAPHY_OPTIONS))
      .min(1, messages.geographiesRequired)
      .max(20, messages.geographiesRequired),
    engagementIntent: z.enum(
      INVESTOR_ENGAGEMENT_INTENTS,
      messages.intentInvalid,
    ),
    thesis: z
      .string()
      .trim()
      .min(40, messages.thesisMin)
      .max(2000, messages.thesisMax),
    timeline: z
      .union([z.enum(INVESTOR_TIMELINES), z.literal("")])
      .optional()
      .transform((value) => (value === "" || value == null ? undefined : value)),
    referredBy: z
      .string()
      .trim()
      .max(120, messages.referredByMax)
      .refine(
        (value) => value === "" || value.length >= 2,
        messages.referredByMin,
      ),
    message: z
      .string()
      .trim()
      .max(1000, messages.messageMax)
      .refine(
        (value) => value === "" || value.length >= 20,
        messages.messageMin,
      ),
    consent: z.boolean().refine((value) => value === true, {
      message: messages.consentRequired,
    }),
    commsOptIn: z.boolean(),
    turnstileToken: z
      .string()
      .trim()
      .min(1, messages.turnstileRequired)
      .max(2048, messages.turnstileRequired),
  });
}

export const investorEngagementSchema =
  investorEngagementSchemaFor(DEFAULT_LOCALE);

export type InvestorEngagementInput = z.infer<typeof investorEngagementSchema>;
