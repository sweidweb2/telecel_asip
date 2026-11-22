"use server";

import { getAdminResource } from "@/constants/admin-resources";
import {
  refreshAdminResource
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runAuthenticatedIntakeSubmit } from "@/actions/run-authenticated-intake-submit";
import { PUBLIC_SUBMIT_GUARD_COPY } from "@/lib/intake/submit-guard";
import {
  investorEngagementSchemaFor,
  type InvestorEngagementInput,
} from "@/validations/investor-engagement";

export type SubmitInvestorEngagementResult = AdminActionResult;

const resource = getAdminResource("investorEngagements");
const CONSENT_VERSION = "2026-11-10";

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your investor engagement request has been submitted.",
    signedInRequired: "Sign in to submit an investor engagement request.",
    accountTypeRejected: "This form is for investor accounts only.",
    applicationsGate:
      "Engagement is closed. Register your investor interest to hear when the next chapter opens.",
    duplicate: "You already submitted an engagement request for this organization.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre demande d’engagement investisseur a bien été envoyée.",
    signedInRequired:
      "Connectez-vous pour envoyer une demande d’engagement investisseur.",
    accountTypeRejected: "Ce formulaire est réservé aux comptes investisseurs.",
    applicationsGate:
      "Les engagements sont fermés. Manifestez votre intérêt d’investisseur pour être informé de la suite.",
    duplicate:
      "Vous avez déjà envoyé une demande d’engagement pour cette organisation.",
  },
} as const;

export async function submitInvestorEngagement(
  input: InvestorEngagementInput,
): Promise<SubmitInvestorEngagementResult> {
  return runAuthenticatedIntakeSubmit({
    input,
    messages: MESSAGES,
    applicationsMustBeOpen: true,
    accountGate: { mode: "require", type: "investor" },
    rateLimitPrefix: "investor-engagement",
    uniqueConstraintNeedles: [
      "investor_engagements_email_org",
      "investor_engagements_user_org",
    ],
    parse: ({ input: values, sessionEmail, locale }) =>
      investorEngagementSchemaFor(locale).safeParse({
        ...values,
        email: sessionEmail,
      }),
    insert: async ({ admin, user, data, sessionEmail, locale }) => {
      const { error } = await admin.from("investor_engagements").insert({
        user_id: user.id,
        full_name: data.fullName,
        email: sessionEmail,
        phone: data.phone.trim() ? data.phone.trim() : null,
        organization: data.organization,
        job_title: data.jobTitle.trim() ? data.jobTitle.trim() : null,
        linkedin: data.linkedin?.trim() ? data.linkedin.trim() : null,
        investor_type: data.investorType,
        stages: data.stages,
        ticket_size: data.ticketSize,
        sectors: data.sectors,
        geographies: data.geographies,
        engagement_intent: data.engagementIntent,
        thesis: data.thesis,
        timeline: data.timeline ?? null,
        referred_by: data.referredBy.trim() ? data.referredBy.trim() : null,
        message: data.message.trim() ? data.message.trim() : null,
        consent: data.consent,
        comms_opt_in: data.commsOptIn,
        locale,
        source_path: `/${locale}/apply`,
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
