import { z } from "zod";

import { INVESTOR_KINDS } from "@/constants/investor-intake";
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
  focusNoteMin: string;
  focusNoteMax: string;
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
    focusNoteMin: "Note must be at least 20 characters",
    focusNoteMax: "Note must be at most 1000 characters",
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
    focusNoteMin: "La note doit contenir au moins 20 caractères",
    focusNoteMax: "La note doit contenir au plus 1000 caractères",
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
    .refine(
      (value) => value === "" || PHONE_REGEX.test(value),
      message,
    );
}

function optionalHttpUrl(message: string) {
  return z
    .string()
    .trim()
    .max(500, message)
    .refine((value) => value === "" || HTTP_URL_REGEX.test(value), message);
}

function optionalFocusNote(minMsg: string, maxMsg: string) {
  return z
    .string()
    .trim()
    .max(1000, maxMsg)
    .refine(
      (value) => value === "" || value.length >= 20,
      minMsg,
    );
}

export function investorInterestSchemaFor(locale: Locale = DEFAULT_LOCALE) {
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
    focusNote: optionalFocusNote(messages.focusNoteMin, messages.focusNoteMax),
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

export const investorInterestSchema =
  investorInterestSchemaFor(DEFAULT_LOCALE);

export type InvestorInterestInput = z.infer<typeof investorInterestSchema>;
