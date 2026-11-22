"use server";

import { getAdminResource } from "@/constants/admin-resources";
import {
  refreshAdminResource
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runAuthenticatedIntakeSubmit } from "@/actions/run-authenticated-intake-submit";
import { PUBLIC_SUBMIT_GUARD_COPY } from "@/lib/intake/submit-guard";
import {
  investorInterestSchemaFor,
  type InvestorInterestInput,
} from "@/validations/investor-interest";

export type SubmitInvestorInterestResult = AdminActionResult;

const resource = getAdminResource("investorInterests");
const CONSENT_VERSION = "2026-11-10";

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your investor interest has been registered.",
    signedInRequired: "Sign in to register your investor interest.",
    accountTypeRejected: "This form is for investor accounts only.",
    applicationsGate:
      "Engagement is open. Submit the full investor engagement form instead.",
    duplicate: "You already registered interest for this organization.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre intérêt d’investisseur a bien été enregistré.",
    signedInRequired:
      "Connectez-vous pour manifester votre intérêt d’investisseur.",
    accountTypeRejected: "Ce formulaire est réservé aux comptes investisseurs.",
    applicationsGate:
      "Les engagements sont ouverts. Envoyez le formulaire d’engagement investisseur complet.",
    duplicate: "Vous avez déjà enregistré cette organisation.",
  },
} as const;

export async function submitInvestorInterest(
  input: InvestorInterestInput,
): Promise<SubmitInvestorInterestResult> {
  return runAuthenticatedIntakeSubmit({
    input,
    messages: MESSAGES,
    applicationsMustBeOpen: false,
    accountGate: { mode: "require", type: "investor" },
    rateLimitPrefix: "investor-interest",
    uniqueConstraintNeedles: [
      "investor_interests_email_org",
      "investor_interests_user_org",
    ],
    parse: ({ input: values, sessionEmail, locale }) =>
      investorInterestSchemaFor(locale).safeParse({
        ...values,
        email: sessionEmail,
      }),
    insert: async ({ admin, user, data, sessionEmail, locale }) => {
      const { error } = await admin.from("investor_interests").insert({
        user_id: user.id,
        full_name: data.fullName,
        email: sessionEmail,
        phone: data.phone.trim() ? data.phone.trim() : null,
        organization: data.organization,
        job_title: data.jobTitle.trim() ? data.jobTitle.trim() : null,
        linkedin: data.linkedin?.trim() ? data.linkedin.trim() : null,
        investor_type: data.investorType,
        focus_note: data.focusNote.trim() ? data.focusNote.trim() : null,
        consent: data.consent,
        comms_opt_in: data.commsOptIn,
        locale,
        source_path: `/${locale}/register-interest`,
        consent_version: CONSENT_VERSION,
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
