import { z } from "zod";

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
  focusNoteMin: string;
  focusNoteMax: string;
  invalidId: string;
};

export const INVESTOR_INTEREST_PAGE_SIZE = 10;
export const INVESTOR_INTEREST_FOCUS_NOTE_MIN = 20;
export const INVESTOR_INTEREST_FOCUS_NOTE_MAX = 1000;

const MESSAGES: Record<Locale, Messages> = {
  en: {
    focusNoteMin: "Note must be at least 20 characters",
    focusNoteMax: "Note must be at most 1000 characters",
    invalidId: "Invalid investor interest id",
  },
  fr: {
    focusNoteMin: "La note doit contenir au moins 20 caractères",
    focusNoteMax: "La note doit contenir au plus 1000 caractères",
    invalidId: "Identifiant d’intérêt investisseur invalide",
  },
};

export function investorInterestSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const contact = INVESTOR_CONTACT_MESSAGES[locale];
  const messages = MESSAGES[locale];

  return z.object({
    ...investorContactFields(contact),
    focusNote: optionalMinLengthString(
      INVESTOR_INTEREST_FOCUS_NOTE_MIN,
      INVESTOR_INTEREST_FOCUS_NOTE_MAX,
      messages.focusNoteMin,
      messages.focusNoteMax,
    ),
  });
}

export const investorInterestSchema =
  investorInterestSchemaFor(DEFAULT_LOCALE);

export type InvestorInterestInput = z.infer<typeof investorInterestSchema>;

export const updateInvestorInterestSchema = investorInterestSchema
  .omit({ consent: true })
  .extend({ id: z.uuid(MESSAGES.en.invalidId) });

export const deleteInvestorInterestSchema = z.object({
  id: z.uuid(MESSAGES.en.invalidId),
});

const investorInterestListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_().]*$/, "Search contains unsupported characters")
    .catch(""),
  inboxStatus: inboxListFilterSchema,
});

export type InvestorInterestListQuery = z.infer<
  typeof investorInterestListQueryInputSchema
> & {
  pageSize: typeof INVESTOR_INTEREST_PAGE_SIZE;
};

export function parseInvestorInterestListQuery(
  input: RawSearchParams,
): InvestorInterestListQuery {
  return parseAdminListQuery({
    input,
    schema: investorInterestListQueryInputSchema,
    pageSize: INVESTOR_INTEREST_PAGE_SIZE,
    defaults: { page: "1", search: "", inboxStatus: "inbox" },
  });
}

export type UpdateInvestorInterestInput = z.infer<
  typeof updateInvestorInterestSchema
>;
export type DeleteInvestorInterestInput = z.infer<
  typeof deleteInvestorInterestSchema
>;
