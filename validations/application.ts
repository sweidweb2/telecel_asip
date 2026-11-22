import { z } from "zod";

import { DEFAULT_LOCALE, type Locale } from "@/constants/locales";
import type { Application } from "@/types/application";
import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";
import {
  optionalHttpUrl,
  requiredConsent,
  requiredPhone,
  trimmedEmail,
  turnstileTokenField,
} from "@/validations/common-fields";
import { inboxListFilterSchema } from "@/validations/inbox";

type ApplicationMessages = {
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
  problemMin: string;
  problemMax: string;
  tractionMin: string;
  tractionMax: string;
  fitMin: string;
  fitMax: string;
  consentRequired: string;
  turnstileRequired: string;
  invalidId: string;
};

const VALIDATION_MESSAGES: Record<Locale, ApplicationMessages> = {
  en: {
    fullNameMin: "Name must be at least 2 characters",
    fullNameMax: "Name must be at most 100 characters",
    roleMin: "Role must be at least 2 characters",
    roleMax: "Role must be at most 80 characters",
    invalidEmail: "Enter a valid email address",
    emailMax: "Email must be at most 254 characters",
    phoneInvalid:
      "Enter a valid phone number (7–20 digits, spaces, or +()- allowed)",
    companyMin: "Startup name must be at least 2 characters",
    companyMax: "Startup name must be at most 120 characters",
    sectorMin: "Sector must be at least 2 characters",
    sectorMax: "Sector must be at most 80 characters",
    countryMin: "Country must be at least 2 characters",
    countryMax: "Country must be at most 80 characters",
    linkedinInvalid: "LinkedIn must be a valid http(s) URL",
    websiteInvalid: "Website must be a valid http(s) URL",
    problemMin: "Problem & product must be at least 40 characters",
    problemMax: "Problem & product must be at most 4000 characters",
    tractionMin: "Traction must be at least 20 characters",
    tractionMax: "Traction must be at most 2000 characters",
    fitMin: "Program fit must be at least 20 characters",
    fitMax: "Program fit must be at most 2000 characters",
    consentRequired: "You must agree before submitting",
    turnstileRequired: "Please complete the security check",
    invalidId: "Invalid application id",
  },
  fr: {
    fullNameMin: "Le nom doit contenir au moins 2 caractères",
    fullNameMax: "Le nom doit contenir au plus 100 caractères",
    roleMin: "Le rôle doit contenir au moins 2 caractères",
    roleMax: "Le rôle doit contenir au plus 80 caractères",
    invalidEmail: "Entrez une adresse e-mail valide",
    emailMax: "L’e-mail doit contenir au plus 254 caractères",
    phoneInvalid:
      "Entrez un numéro de téléphone valide (7–20 chiffres ; espaces ou +()- autorisés)",
    companyMin: "Le nom de la startup doit contenir au moins 2 caractères",
    companyMax: "Le nom de la startup doit contenir au plus 120 caractères",
    sectorMin: "Le secteur doit contenir au moins 2 caractères",
    sectorMax: "Le secteur doit contenir au plus 80 caractères",
    countryMin: "Le pays doit contenir au moins 2 caractères",
    countryMax: "Le pays doit contenir au plus 80 caractères",
    linkedinInvalid: "LinkedIn doit être une URL http(s) valide",
    websiteInvalid: "Le site web doit être une URL http(s) valide",
    problemMin: "Problème & produit : au moins 40 caractères",
    problemMax: "Problème & produit : au plus 4000 caractères",
    tractionMin: "Traction : au moins 20 caractères",
    tractionMax: "Traction : au plus 2000 caractères",
    fitMin: "Adéquation au programme : au moins 20 caractères",
    fitMax: "Adéquation au programme : au plus 2000 caractères",
    consentRequired: "Vous devez accepter avant d’envoyer",
    turnstileRequired: "Veuillez compléter la vérification de sécurité",
    invalidId: "Identifiant de candidature invalide",
  },
};

export const APPLICATION_PAGE_SIZE = 10;
export const APPLICATION_FULL_NAME_MAX = 100;
export const APPLICATION_ROLE_MAX = 80;
export const APPLICATION_EMAIL_MAX = 254;
export const APPLICATION_PHONE_MAX = 20;
export const APPLICATION_COUNTRY_MAX = 80;
export const APPLICATION_COMPANY_MAX = 120;
export const APPLICATION_SECTOR_MAX = 80;
export const APPLICATION_URL_MAX = 500;
export const APPLICATION_PROBLEM_MAX = 4000;
export const APPLICATION_TRACTION_MAX = 2000;
export const APPLICATION_FIT_MAX = 2000;
export const APPLICATION_PROBLEM_MIN = 40;
export const APPLICATION_TRACTION_MIN = 20;
export const APPLICATION_FIT_MIN = 20;

function applicationFieldsSchema(messages: ApplicationMessages) {
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
      max: APPLICATION_URL_MAX,
      allowUndefined: true,
    }),
    companyName: z
      .string()
      .trim()
      .min(2, messages.companyMin)
      .max(120, messages.companyMax),
    website: optionalHttpUrl(messages.websiteInvalid, {
      max: APPLICATION_URL_MAX,
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
    problemProduct: z
      .string()
      .trim()
      .min(40, messages.problemMin)
      .max(4000, messages.problemMax),
    traction: z
      .string()
      .trim()
      .min(20, messages.tractionMin)
      .max(2000, messages.tractionMax),
    programmeFit: z
      .string()
      .trim()
      .min(20, messages.fitMin)
      .max(2000, messages.fitMax),
    commsOptIn: z.boolean(),
  };
}

export function applicationSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const messages = VALIDATION_MESSAGES[locale];

  return z.object({
    ...applicationFieldsSchema(messages),
    consent: requiredConsent(messages.consentRequired),
    turnstileToken: turnstileTokenField(messages.turnstileRequired),
  });
}

export const applicationSchema = applicationSchemaFor(DEFAULT_LOCALE);

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const updateApplicationSchema = z.object({
  id: z.uuid(VALIDATION_MESSAGES.en.invalidId),
  ...applicationFieldsSchema(VALIDATION_MESSAGES.en),
});

export const deleteApplicationSchema = z.object({
  id: z.uuid(VALIDATION_MESSAGES.en.invalidId),
});

const applicationListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_().]*$/, "Search contains unsupported characters")
    .catch(""),
  inboxStatus: inboxListFilterSchema,
});

export type ApplicationListQuery = z.infer<
  typeof applicationListQueryInputSchema
> & {
  pageSize: typeof APPLICATION_PAGE_SIZE;
};

export function parseApplicationListQuery(
  input: RawSearchParams,
): ApplicationListQuery {
  return parseAdminListQuery({
    input,
    schema: applicationListQueryInputSchema,
    pageSize: APPLICATION_PAGE_SIZE,
    defaults: { page: "1", search: "", inboxStatus: "inbox" },
  });
}

export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type DeleteApplicationInput = z.infer<typeof deleteApplicationSchema>;

/** Map a DB application row into the admin edit-form shape. */
export function toUpdateApplicationInput(
  application: Application,
): UpdateApplicationInput {
  return {
    id: application.id,
    fullName: application.full_name,
    founderRole: application.founder_role,
    email: application.email,
    phone: application.phone,
    country: application.country,
    linkedin: application.linkedin ?? "",
    companyName: application.company_name,
    website: application.website ?? "",
    companyCountry: application.company_country,
    sector: application.sector,
    problemProduct: application.problem_product,
    traction: application.traction,
    programmeFit: application.programme_fit,
    commsOptIn: application.comms_opt_in,
  };
}
