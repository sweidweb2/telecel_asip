import { z } from "zod";

import {
  INVESTOR_ENGAGEMENT_INTENTS,
  INVESTOR_GEOGRAPHY_OPTIONS,
  INVESTOR_SECTOR_OPTIONS,
  INVESTOR_STAGES,
  INVESTOR_TICKET_SIZES,
  INVESTOR_TIMELINES,
} from "@/constants/investor-intake";
import { DEFAULT_LOCALE, type Locale } from "@/constants/locales";
import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";
import { optionalMinLengthString } from "@/validations/common-fields";
import { inboxListFilterSchema } from "@/validations/inbox";
import {
  INVESTOR_CONTACT_MESSAGES,
  investorContactFields,
} from "@/validations/investor-contact-fields";

type Messages = {
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
  invalidId: string;
};

export const INVESTOR_ENGAGEMENT_PAGE_SIZE = 10;
export const INVESTOR_ENGAGEMENT_THESIS_MIN = 40;
export const INVESTOR_ENGAGEMENT_THESIS_MAX = 2000;
export const INVESTOR_ENGAGEMENT_REFERRED_BY_MAX = 120;
export const INVESTOR_ENGAGEMENT_MESSAGE_MIN = 20;
export const INVESTOR_ENGAGEMENT_MESSAGE_MAX = 1000;

const MESSAGES: Record<Locale, Messages> = {
  en: {
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
    invalidId: "Invalid investor engagement id",
  },
  fr: {
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
    invalidId: "Identifiant d’engagement investisseur invalide",
  },
};

export function investorEngagementSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const contact = INVESTOR_CONTACT_MESSAGES[locale];
  const messages = MESSAGES[locale];

  return z.object({
    ...investorContactFields(contact),
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
      .min(INVESTOR_ENGAGEMENT_THESIS_MIN, messages.thesisMin)
      .max(INVESTOR_ENGAGEMENT_THESIS_MAX, messages.thesisMax),
    timeline: z
      .union([z.enum(INVESTOR_TIMELINES), z.literal("")])
      .optional()
      .transform((value) => (value === "" || value == null ? undefined : value)),
    referredBy: optionalMinLengthString(
      2,
      INVESTOR_ENGAGEMENT_REFERRED_BY_MAX,
      messages.referredByMin,
      messages.referredByMax,
    ),
    message: optionalMinLengthString(
      INVESTOR_ENGAGEMENT_MESSAGE_MIN,
      INVESTOR_ENGAGEMENT_MESSAGE_MAX,
      messages.messageMin,
      messages.messageMax,
    ),
  });
}

export const investorEngagementSchema =
  investorEngagementSchemaFor(DEFAULT_LOCALE);

export type InvestorEngagementInput = z.infer<typeof investorEngagementSchema>;

export const updateInvestorEngagementSchema = investorEngagementSchema
  .omit({ consent: true })
  .extend({ id: z.uuid(MESSAGES.en.invalidId) });

export const deleteInvestorEngagementSchema = z.object({
  id: z.uuid(MESSAGES.en.invalidId),
});

const investorEngagementListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_().]*$/, "Search contains unsupported characters")
    .catch(""),
  inboxStatus: inboxListFilterSchema,
});

export type InvestorEngagementListQuery = z.infer<
  typeof investorEngagementListQueryInputSchema
> & {
  pageSize: typeof INVESTOR_ENGAGEMENT_PAGE_SIZE;
};

export function parseInvestorEngagementListQuery(
  input: RawSearchParams,
): InvestorEngagementListQuery {
  return parseAdminListQuery({
    input,
    schema: investorEngagementListQueryInputSchema,
    pageSize: INVESTOR_ENGAGEMENT_PAGE_SIZE,
    defaults: { page: "1", search: "", inboxStatus: "inbox" },
  });
}

export type UpdateInvestorEngagementInput = z.infer<
  typeof updateInvestorEngagementSchema
>;
export type DeleteInvestorEngagementInput = z.infer<
  typeof deleteInvestorEngagementSchema
>;
