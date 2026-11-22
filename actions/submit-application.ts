"use server";

import { getAdminResource } from "@/constants/admin-resources";
import {
  refreshAdminResource
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runAuthenticatedIntakeSubmit } from "@/actions/run-authenticated-intake-submit";
import { PUBLIC_SUBMIT_GUARD_COPY } from "@/lib/intake/submit-guard";
import {
  applicationSchemaFor,
  type ApplicationInput,
} from "@/validations/application";

export type SubmitApplicationResult = AdminActionResult;

const resource = getAdminResource("applications");

const MESSAGES = {
  en: {
    ...PUBLIC_SUBMIT_GUARD_COPY.en,
    success: "Thank you - your application has been submitted.",
    signedInRequired: "Sign in to submit an application.",
    accountTypeRejected: "Only startup accounts can submit an application.",
    applicationsGate:
      "Applications are closed. Register your interest to hear when the next chapter opens.",
    duplicate: "You already applied with this company and email.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre candidature a bien été envoyée.",
    signedInRequired: "Connectez-vous pour envoyer une candidature.",
    accountTypeRejected:
      "Seuls les comptes startup peuvent envoyer une candidature.",
    applicationsGate:
      "Les candidatures sont fermées. Manifestez votre intérêt pour être informé de l’ouverture du prochain chapitre.",
    duplicate:
      "Vous avez déjà candidaté avec cette entreprise et cet e-mail.",
  },
} as const;

export async function submitApplication(
  input: ApplicationInput,
): Promise<SubmitApplicationResult> {
  return runAuthenticatedIntakeSubmit({
    input,
    messages: MESSAGES,
    applicationsMustBeOpen: true,
    accountGate: { mode: "require", type: "startup" },
    rateLimitPrefix: "application",
    uniqueConstraintNeedles: [
      "applications_email_company",
      "applications_user_company",
    ],
    parse: ({ input: values, sessionEmail, locale }) =>
      applicationSchemaFor(locale).safeParse({
        ...values,
        email: sessionEmail,
      }),
    insert: async ({ admin, user, data, sessionEmail }) => {
      const linkedin = data.linkedin?.trim() ? data.linkedin.trim() : null;
      const website = data.website?.trim() ? data.website.trim() : null;
      const { error } = await admin.from("applications").insert({
        user_id: user.id,
        full_name: data.fullName,
        founder_role: data.founderRole,
        email: sessionEmail,
        phone: data.phone,
        country: data.country,
        linkedin,
        company_name: data.companyName,
        website,
        company_country: data.companyCountry,
        sector: data.sector,
        problem_product: data.problemProduct,
        traction: data.traction,
        programme_fit: data.programmeFit,
        consent: data.consent,
        comms_opt_in: data.commsOptIn,
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
