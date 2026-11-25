import { z } from "zod";

import { INVESTOR_KINDS } from "@/constants/investor-intake";
import { DEFAULT_LOCALE, type Locale } from "@/constants/locales";
import {
  optionalHttpUrl,
  optionalMinLengthString,
  optionalPhone,
  requiredConsent,
  trimmedEmail,
  turnstileTokenField,
} from "@/validations/common-fields";

export const INVESTOR_FULL_NAME_MAX = 100;
export const INVESTOR_EMAIL_MAX = 254;
export const INVESTOR_PHONE_MAX = 20;
export const INVESTOR_ORGANIZATION_MAX = 120;
export const INVESTOR_JOB_TITLE_MAX = 80;
export const INVESTOR_URL_MAX = 500;

export type InvestorContactMessages = {
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
  consentRequired: string;
  turnstileRequired: string;
};

export const INVESTOR_CONTACT_MESSAGES: Record<
  Locale,
  InvestorContactMessages
> = {
  en: {
    fullNameMin: "Name must be at least 2 characters",
    fullNameMax: "Name must be at most 100 characters",
    invalidEmail: "Enter a valid email address",
    emailMax: "Email must be at most 254 characters",
    phoneInvalid:
      "Enter a valid phone number (7 to 20 digits; spaces, +, parentheses, or hyphens allowed)",
    organizationMin: "Organization must be at least 2 characters",
    organizationMax: "Organization must be at most 120 characters",
    jobTitleMin: "Job title must be at least 2 characters",
    jobTitleMax: "Job title must be at most 80 characters",
    linkedinInvalid: "LinkedIn must be a valid http(s) URL",
    investorTypeInvalid: "Choose an investor type",
    consentRequired: "You must agree before submitting",
    turnstileRequired: "Please complete the security check",
  },
  fr: {
    fullNameMin: "Le nom doit contenir au moins 2 caractères",
    fullNameMax: "Le nom doit contenir au plus 100 caractères",
    invalidEmail: "Entrez une adresse e-mail valide",
    emailMax: "L’e-mail doit contenir au plus 254 caractères",
    phoneInvalid:
      "Entrez un numéro de téléphone valide (7 à 20 chiffres ; espaces, +, parenthèses ou tirets autorisés)",
    organizationMin: "L’organisation doit contenir au moins 2 caractères",
    organizationMax: "L’organisation doit contenir au plus 120 caractères",
    jobTitleMin: "Le titre doit contenir au moins 2 caractères",
    jobTitleMax: "Le titre doit contenir au plus 80 caractères",
    linkedinInvalid: "LinkedIn doit être une URL http(s) valide",
    investorTypeInvalid: "Choisissez un type d’investisseur",
    consentRequired: "Vous devez accepter avant d’envoyer",
    turnstileRequired: "Veuillez compléter la vérification de sécurité",
  },
};

/** Shared contact + consent + turnstile fields for investor interest/engagement. */
export function investorContactFields(
  messages: InvestorContactMessages = INVESTOR_CONTACT_MESSAGES[DEFAULT_LOCALE],
) {
  return {
    fullName: z
      .string()
      .trim()
      .min(2, messages.fullNameMin)
      .max(100, messages.fullNameMax),
    email: trimmedEmail(messages.invalidEmail, messages.emailMax),
    phone: optionalPhone(messages.phoneInvalid),
    organization: z
      .string()
      .trim()
      .min(2, messages.organizationMin)
      .max(120, messages.organizationMax),
    jobTitle: optionalMinLengthString(
      2,
      80,
      messages.jobTitleMin,
      messages.jobTitleMax,
    ),
    linkedin: optionalHttpUrl(messages.linkedinInvalid),
    investorType: z.enum(INVESTOR_KINDS, messages.investorTypeInvalid),
    consent: requiredConsent(messages.consentRequired),
    commsOptIn: z.boolean(),
    turnstileToken: turnstileTokenField(messages.turnstileRequired),
  };
}
