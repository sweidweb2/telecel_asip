"use server";

import { headers } from "next/headers";

import { getAdminResource } from "@/constants/admin-resources";
import { getOpenApplications } from "@/data/settings";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { consumeSharedRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
import {
  applicationSchemaFor,
  deleteApplicationSchema,
  updateApplicationSchema,
  type ApplicationInput,
  type DeleteApplicationInput,
  type UpdateApplicationInput,
} from "@/validations/application";
import {
  updateInboxStatusSchema,
  type UpdateInboxStatusInput,
} from "@/validations/inbox";

export type ApplicationActionResult = AdminActionResult;

const resource = getAdminResource("applications");

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    success: "Thank you - your application has been submitted.",
    genericError: "Something went wrong. Please try again.",
    updateSuccess: "Application updated successfully.",
    deleteSuccess: "Application deleted successfully.",
    inboxStatusSuccess: "Inbox status updated.",
    unauthorized: "You do not have permission to manage applications.",
    signedInRequired: "Sign in to submit an application.",
    notFound: "Application not found.",
    rateLimited: "Too many submissions. Please wait and try again later.",
    duplicate: "You already applied with this company and email.",
    verificationFailed: "Security check failed. Please try again.",
    applicationsClosed:
      "Applications are closed. Register your interest to hear when the next chapter opens.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    success: "Merci - votre candidature a bien été envoyée.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    updateSuccess: "Candidature mise à jour avec succès.",
    deleteSuccess: "Candidature supprimée avec succès.",
    inboxStatusSuccess: "Statut de la boîte de réception mis à jour.",
    unauthorized: "Vous n’avez pas la permission de gérer les candidatures.",
    signedInRequired: "Connectez-vous pour envoyer une candidature.",
    notFound: "Candidature introuvable.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
    duplicate:
      "Vous avez déjà candidaté avec cette entreprise et cet e-mail.",
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
    applicationsClosed:
      "Les candidatures sont fermées. Manifestez votre intérêt pour être informé de l’ouverture du prochain chapitre.",
  },
} as const;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_PER_IP = 5;
const RATE_LIMIT_PER_EMAIL = 3;

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

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

function refreshApplicationsRoute() {
  refreshAdminResource({ listPath: resource.listPath });
}

export async function submitApplication(
  input: ApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

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
  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: data.turnstileToken,
    expectedAction: TURNSTILE_APPLY_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const admin = createAdminClient();
  const ipKey = `application:ip:${ip}`;
  const userKey = `application:user:${user.id}`;

  if (
    !(await consumeSharedRateLimit(
      admin,
      ipKey,
      RATE_LIMIT_PER_IP,
      RATE_LIMIT_WINDOW_MS,
    )) ||
    !(await consumeSharedRateLimit(
      admin,
      userKey,
      RATE_LIMIT_PER_EMAIL,
      RATE_LIMIT_WINDOW_MS,
    ))
  ) {
    return { status: "error", message: copy.rateLimited };
  }

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

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  refreshApplicationsRoute();
  return { status: "success", message: copy.success };
}

export async function updateApplication(
  input: UpdateApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: updateApplicationSchema,
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.updateSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("applications")
        .update({
          full_name: data.fullName,
          founder_role: data.founderRole,
          email: data.email,
          phone: data.phone,
          country: data.country,
          linkedin: data.linkedin?.trim() ? data.linkedin.trim() : null,
          company_name: data.companyName,
          website: data.website?.trim() ? data.website.trim() : null,
          company_country: data.companyCountry,
          sector: data.sector,
          problem_product: data.problemProduct,
          traction: data.traction,
          programme_fit: data.programmeFit,
          comms_opt_in: data.commsOptIn,
        })
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        if (isUniqueViolation(error)) {
          return { status: "error", message: copy.duplicate };
        }
        return { status: "error", message: copy.genericError };
      }
      if (!row) {
        return { status: "error", message: copy.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshApplicationsRoute(),
  });
}

export async function deleteApplication(
  input: DeleteApplicationInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: deleteApplicationSchema,
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.deleteSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("applications")
        .delete()
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", message: copy.genericError };
      }
      if (!row) {
        return { status: "error", message: copy.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshApplicationsRoute(),
  });
}

export async function updateApplicationInboxStatus(
  input: UpdateInboxStatusInput,
): Promise<ApplicationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: updateInboxStatusSchema,
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.inboxStatusSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("applications")
        .update({ inbox_status: data.inboxStatus })
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", message: copy.genericError };
      }
      if (!row) {
        return { status: "error", message: copy.notFound };
      }
      return { status: "success" };
    },
    refresh: () => refreshApplicationsRoute(),
  });
}
