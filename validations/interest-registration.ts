import {
  z } from "zod";

import { DEFAULT_LOCALE,
  type Locale } from "@/constants/locales";
import {
  parseAdminListQuery,
  type RawSearchParams,
  } from "@/validations/admin-list-query";
import {
  optionalHttpUrl,
  optionalMinLengthString,
  requiredConsent,
  requiredPhone,
  trimmedEmail,
} from "@/validations/common-fields";
import { inboxListFilterSchema } from "@/validations/inbox";

type InterestRegistrationMessages = {
  fullNameMin: string;
  fullNameMax: string;
  roleMin: string;
  roleMax: string;
  invalidEmail: string;
  emailMax: string;
  phoneInvalid: string;
  companyMin: string;
  companyMax: string;
  sectorMin: string;
  sectorMax: string;
  countryMin: string;
  countryMax: string;
  linkedinInvalid: string;
  websiteInvalid: string;
  pitchMax: string;
  consentRequired: string;
  invalidId: string;
};

const VALIDATION_MESSAGES: Record<Locale, InterestRegistrationMessages> = {
  en: {
    fullNameMin: "Name must be at least 2 characters",
    fullNameMax: "Name must be at most 100 characters",
    roleMin: "Role must be at least 2 characters",
    roleMax: "Role must be at most 80 characters",
    invalidEmail: "Enter a valid email address",
    emailMax: "Email must be at most 254 characters",
    phoneInvalid:
      "Enter a valid phone number (7 to 20 digits; spaces, +, parentheses, or hyphens allowed)",
    companyMin: "Startup name must be at least 2 characters",
    companyMax: "Startup name must be at most 120 characters",
    sectorMin: "Sector must be at least 2 characters",
    sectorMax: "Sector must be at most 80 characters",
    countryMin: "Country must be at least 2 characters",
    countryMax: "Country must be at most 80 characters",
    linkedinInvalid: "LinkedIn must be a valid http(s) URL",
    websiteInvalid: "Website must be a valid http(s) URL",
    pitchMax: "Note must be at most 1000 characters",
    consentRequired: "You must agree before submitting",
    invalidId: "Invalid registration id",
  },
  fr: {
    fullNameMin: "Le nom doit contenir au moins 2 caractères",
    fullNameMax: "Le nom doit contenir au plus 100 caractères",
    roleMin: "Le rôle doit contenir au moins 2 caractères",
    roleMax: "Le rôle doit contenir au plus 80 caractères",
    invalidEmail: "Entrez une adresse e-mail valide",
    emailMax: "L’e-mail doit contenir au plus 254 caractères",
    phoneInvalid:
      "Entrez un numéro de téléphone valide (7 à 20 chiffres ; espaces, +, parenthèses ou tirets autorisés)",
    companyMin: "Le nom de la startup doit contenir au moins 2 caractères",
    companyMax: "Le nom de la startup doit contenir au plus 120 caractères",
    sectorMin: "Le secteur doit contenir au moins 2 caractères",
    sectorMax: "Le secteur doit contenir au plus 80 caractères",
    countryMin: "Le pays doit contenir au moins 2 caractères",
    countryMax: "Le pays doit contenir au plus 80 caractères",
    linkedinInvalid: "LinkedIn doit être une URL http(s) valide",
    websiteInvalid: "Le site web doit être une URL http(s) valide",
    pitchMax: "La note doit contenir au plus 1000 caractères",
    consentRequired: "Vous devez accepter avant d’envoyer",
    invalidId: "Identifiant d’inscription invalide",
  },
};

export const INTEREST_REGISTRATION_PAGE_SIZE = 10;
export const INTEREST_REGISTRATION_FULL_NAME_MAX = 100;
export const INTEREST_REGISTRATION_EMAIL_MAX = 254;
export const INTEREST_REGISTRATION_PHONE_MAX = 20;
export const INTEREST_REGISTRATION_COMPANY_MAX = 120;
export const INTEREST_REGISTRATION_SECTOR_MAX = 80;
export const INTEREST_REGISTRATION_COUNTRY_MAX = 80;
export const INTEREST_REGISTRATION_PITCH_MAX = 1000;
export const INTEREST_REGISTRATION_PITCH_MIN = 20;
export const INTEREST_REGISTRATION_ROLE_MAX = 80;
export const INTEREST_REGISTRATION_URL_MAX = 500;

function optionalPitch(messages: InterestRegistrationMessages) {
  return optionalMinLengthString(
    INTEREST_REGISTRATION_PITCH_MIN,
    INTEREST_REGISTRATION_PITCH_MAX,
    messages.pitchMax,
    messages.pitchMax,
  )
    .optional()
    .or(z.literal(""));
}

function registrationFieldsSchema(messages: InterestRegistrationMessages) {
  return {
    fullName: z
      .string()
      .trim()
      .min(2, messages.fullNameMin)
      .max(100, messages.fullNameMax),
    founderRole: z
      .string()
      .trim()
      .min(2, messages.roleMin)
      .max(80, messages.roleMax),
    email: trimmedEmail(messages.invalidEmail, messages.emailMax),
    phone: requiredPhone(messages.phoneInvalid),
    country: z
      .string()
      .trim()
      .min(2, messages.countryMin)
      .max(80, messages.countryMax),
    linkedin: optionalHttpUrl(messages.linkedinInvalid, {
      max: INTEREST_REGISTRATION_URL_MAX,
      allowUndefined: true,
    }),
    companyName: z
      .string()
      .trim()
      .min(2, messages.companyMin)
      .max(120, messages.companyMax),
    website: optionalHttpUrl(messages.websiteInvalid, {
      max: INTEREST_REGISTRATION_URL_MAX,
      allowUndefined: true,
    }),
    companyCountry: z
      .string()
      .trim()
      .min(2, messages.countryMin)
      .max(80, messages.countryMax),
    sector: z
      .string()
      .trim()
      .min(2, messages.sectorMin)
      .max(80, messages.sectorMax),
    pitch: optionalPitch(messages),
    commsOptIn: z.boolean(),
  };
}

export function interestRegistrationSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const messages = VALIDATION_MESSAGES[locale];

  return z.object({
    ...registrationFieldsSchema(messages),
    consent: requiredConsent(messages.consentRequired),
  });
}

/** Default English schema for shared typing and unit tests. */
export const interestRegistrationSchema =
  interestRegistrationSchemaFor(DEFAULT_LOCALE);

export type InterestRegistrationInput = z.infer<
  typeof interestRegistrationSchema
>;

export const updateInterestRegistrationSchema = z.object({
  id: z.uuid(VALIDATION_MESSAGES.en.invalidId),
  ...registrationFieldsSchema(VALIDATION_MESSAGES.en),
});

export const deleteInterestRegistrationSchema = z.object({
  id: z.uuid(VALIDATION_MESSAGES.en.invalidId),
});

const interestRegistrationListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_().]*$/, "Search contains unsupported characters")
    .catch(""),
  inboxStatus: inboxListFilterSchema,
});

export type InterestRegistrationListQuery = z.infer<
  typeof interestRegistrationListQueryInputSchema
> & {
  pageSize: typeof INTEREST_REGISTRATION_PAGE_SIZE;
};

export function parseInterestRegistrationListQuery(
  input: RawSearchParams,
): InterestRegistrationListQuery {
  return parseAdminListQuery({
    input,
    schema: interestRegistrationListQueryInputSchema,
    pageSize: INTEREST_REGISTRATION_PAGE_SIZE,
    defaults: { page: "1", search: "", inboxStatus: "inbox" },
  });
}

export type UpdateInterestRegistrationInput = z.infer<
  typeof updateInterestRegistrationSchema
>;
export type DeleteInterestRegistrationInput = z.infer<
  typeof deleteInterestRegistrationSchema
>;
