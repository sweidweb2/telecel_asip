"use server";

import { headers } from "next/headers";

import { getAdminResource } from "@/constants/admin-resources";
import { getOpenApplications } from "@/data/settings";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { consumeSharedRateLimit } from "@/lib/rate-limit";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
import {
  deleteInterestRegistrationSchema,
  interestRegistrationSchemaFor,
  updateInterestRegistrationSchema,
  type DeleteInterestRegistrationInput,
  type InterestRegistrationInput,
  type UpdateInterestRegistrationInput,
} from "@/validations/interest-registration";
import {
  updateInboxStatusSchema,
  type UpdateInboxStatusInput,
} from "@/validations/inbox";

export type InterestRegistrationActionResult = AdminActionResult;

const resource = getAdminResource("registrations");

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    success: "Thank you - your interest has been registered.",
    genericError: "Something went wrong. Please try again.",
    updateSuccess: "Registration updated successfully.",
    deleteSuccess: "Registration deleted successfully.",
    inboxStatusSuccess: "Inbox status updated.",
    unauthorized: "You do not have permission to manage registrations.",
    signedInRequired: "Sign in to register your interest.",
    notFound: "Registration not found.",
    rateLimited:
      "Too many submissions. Please wait and try again later.",
    duplicate:
      "You already registered this company with this email.",
    verificationFailed: "Security check failed. Please try again.",
    applicationsOpen:
      "Applications are open. Submit an official application instead of registering interest.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    success: "Merci - votre intérêt a bien été enregistré.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
    updateSuccess: "Inscription mise à jour avec succès.",
    deleteSuccess: "Inscription supprimée avec succès.",
    inboxStatusSuccess: "Statut de la boîte de réception mis à jour.",
    unauthorized:
      "Vous n’avez pas la permission de gérer les inscriptions d’intérêt.",
    signedInRequired: "Connectez-vous pour manifester votre intérêt.",
    notFound: "Inscription introuvable.",
    rateLimited:
      "Trop de soumissions. Veuillez patienter et réessayer plus tard.",
    duplicate:
      "Vous avez déjà enregistré cette entreprise avec cet e-mail.",
    verificationFailed:
      "La vérification de sécurité a échoué. Veuillez réessayer.",
    applicationsOpen:
      "Les candidatures sont ouvertes. Envoyez une candidature officielle plutôt que de manifester votre intérêt.",
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
    message.includes("interest_registrations_email_company") ||
    message.includes("interest_registrations_user_company")
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

function refreshRegistrationsRoute() {
  refreshAdminResource({ listPath: resource.listPath });
}

export async function submitInterestRegistration(
  input: InterestRegistrationInput,
): Promise<InterestRegistrationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  if (await getOpenApplications()) {
    return { status: "error", message: copy.applicationsOpen };
  }

  const user = await getAuthUser();
  if (!user?.email) {
    return { status: "error", message: copy.signedInRequired };
  }

  const sessionEmail = user.email.trim().toLowerCase();
  const parsed = interestRegistrationSchemaFor(locale).safeParse({
    ...input,
    email: sessionEmail,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

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
    turnstileToken,
  } = parsed.data;

  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction: TURNSTILE_APPLY_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const admin = createAdminClient();
  const ipKey = `apply:ip:${ip}`;
  const userKey = `apply:user:${user.id}`;

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
  });

  if (error) {
    if (isUniqueViolation(error)) {
      return { status: "error", message: copy.duplicate };
    }
    return { status: "error", message: copy.genericError };
  }

  refreshRegistrationsRoute();
  return { status: "success", message: copy.success };
}

export async function updateInterestRegistration(
  input: UpdateInterestRegistrationInput,
): Promise<InterestRegistrationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: updateInterestRegistrationSchema,
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
      const {
        id,
        fullName,
        founderRole,
        email,
        phone,
        country,
        linkedin,
        companyName,
        website,
        companyCountry,
        sector,
        pitch,
        commsOptIn,
      } = data;

      const { data: row, error } = await session.supabase
        .from("interest_registrations")
        .update({
          full_name: fullName,
          founder_role: founderRole,
          email,
          phone,
          country,
          linkedin: linkedin?.trim() ? linkedin.trim() : null,
          company_name: companyName,
          website: website?.trim() ? website.trim() : null,
          company_country: companyCountry,
          sector,
          pitch: pitch?.trim() ? pitch.trim() : null,
          comms_opt_in: commsOptIn,
        })
        .eq("id", id)
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
    refresh: () => refreshRegistrationsRoute(),
  });
}

export async function deleteInterestRegistration(
  input: DeleteInterestRegistrationInput,
): Promise<InterestRegistrationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: deleteInterestRegistrationSchema,
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
        .from("interest_registrations")
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
    refresh: () => refreshRegistrationsRoute(),
  });
}

export async function updateInterestRegistrationInboxStatus(
  input: UpdateInboxStatusInput,
): Promise<InterestRegistrationActionResult> {
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
        .from("interest_registrations")
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
    refresh: () => refreshRegistrationsRoute(),
  });
}
