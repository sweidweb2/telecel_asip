"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getOpenApplications } from "@/data/settings";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import {
  refreshAdminResource,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  guardPublicFormSubmission,
  PUBLIC_SUBMIT_GUARD_COPY,
} from "@/lib/intake/submit-guard";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
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
    duplicate: "You already applied with this company and email.",
    applicationsClosed:
      "Applications are closed. Register your interest to hear when the next chapter opens.",
  },
  fr: {
    ...PUBLIC_SUBMIT_GUARD_COPY.fr,
    success: "Merci - votre candidature a bien été envoyée.",
    signedInRequired: "Connectez-vous pour envoyer une candidature.",
    duplicate:
      "Vous avez déjà candidaté avec cette entreprise et cet e-mail.",
    applicationsClosed:
      "Les candidatures sont fermées. Manifestez votre intérêt pour être informé de l’ouverture du prochain chapitre.",
  },
} as const;

function isUniqueViolation(error: {
  code?: string;
  message?: string;
}): boolean {
  if (error.code === "23505") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("applications_email_company") ||
    message.includes("applications_user_company")
  );
}

export async function submitApplication(
  input: ApplicationInput,
): Promise<SubmitApplicationResult> {
  const locale = await getRequestLocale();
  const copy = MESSAGES[locale];

  if (!(await getOpenApplications())) {
    return { status: "error", message: copy.applicationsClosed };
  }

  const user = await getAuthUser();
  if (!user?.email) {
    return { status: "error", message: copy.signedInRequired };
  }

  const sessionEmail = user.email.trim().toLowerCase();
  const parsed = applicationSchemaFor(locale).safeParse({
    ...input,
    email: sessionEmail,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const data = parsed.data;
  const guard = await guardPublicFormSubmission({
    turnstileToken: data.turnstileToken,
    expectedAction: TURNSTILE_APPLY_ACTION,
    rateLimitPrefix: "application",
    identityKind: "user",
    identity: user.id,
    messages: copy,
  });
  if (guard.status === "error") return guard;

  const linkedin = data.linkedin?.trim() ? data.linkedin.trim() : null;
  const website = data.website?.trim() ? data.website.trim() : null;
  const { error } = await guard.admin.from("applications").insert({
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

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
    bustNavCounts: false,
  });
  return { status: "success", message: copy.success };
}
