"use server";

import { getAdminResource } from "@/constants/admin-resources";
import {
  refreshAdminResource
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runAuthenticatedIntakeSubmit } from "@/actions/run-authenticated-intake-submit";
import { PUBLIC_SUBMIT_GUARD_COPY } from "@/lib/intake/submit-guard";
import {
  interestRegistrationSchemaFor,
  type InterestRegistrationInput,
} from "@/validations/interest-registration";

export type SubmitInterestRegistrationResult = AdminActionResult;

const resource = getAdminResource("registrations");
const REGISTER_INTEREST_CONSENT_VERSION = "2026-09-17";

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your interest has been registered.",
    signedInRequired: "Sign in to register your interest.",
    accountTypeRejected: "Only startup accounts can register interest.",
    applicationsGate:
      "Applications are open. Submit an official application instead of registering interest.",
    duplicate: "You already registered this company with this email.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre intérêt a bien été enregistré.",
    signedInRequired: "Connectez-vous pour manifester votre intérêt.",
    accountTypeRejected:
      "Seuls les comptes startup peuvent manifester leur intérêt.",
    applicationsGate:
      "Les candidatures sont ouvertes. Envoyez une candidature officielle plutôt que de manifester votre intérêt.",
    duplicate:
      "Vous avez déjà enregistré cette entreprise avec cet e-mail.",
  },
} as const;

export async function submitInterestRegistration(
  input: InterestRegistrationInput,
): Promise<SubmitInterestRegistrationResult> {
  return runAuthenticatedIntakeSubmit({
    input,
    messages: MESSAGES,
    applicationsMustBeOpen: false,
    accountGate: { mode: "require", type: "startup" },
    rateLimitPrefix: "apply",
    uniqueConstraintNeedles: [
      "interest_registrations_email_company",
      "interest_registrations_user_company",
    ],
    parse: ({ input: values, sessionEmail, locale }) =>
      interestRegistrationSchemaFor(locale).safeParse({
        ...values,
        email: sessionEmail,
      }),
    insert: async ({ admin, user, data, sessionEmail, locale }) => {
      const {
        fullName,
        founderRole,
        phone,
        country,
        linkedin,
        companyName,
        website,
        companyCountry,
        sector,
        pitch,
        consent,
        commsOptIn,
      } = data;

      const { error } = await admin.from("interest_registrations").insert({
        user_id: user.id,
        full_name: fullName,
        founder_role: founderRole,
        email: sessionEmail,
        phone,
        country,
        linkedin: linkedin?.trim() ? linkedin.trim() : null,
        company_name: companyName,
        website: website?.trim() ? website.trim() : null,
        company_country: companyCountry,
        sector,
        pitch: pitch?.trim() ? pitch.trim() : null,
        consent,
        comms_opt_in: commsOptIn,
        locale,
        source_path: `/${locale}/register-interest`,
        consent_version: REGISTER_INTEREST_CONSENT_VERSION,
      });
      return { error };
    },
    refresh: () =>
      refreshAdminResource({
        listPath: resource.listPath,
        cacheTags: resource.cacheTags,
        bustNavCounts: false,
      }),
  });
}
