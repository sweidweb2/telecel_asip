"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getInterestRegistrationById } from "@/data/interest-registrations";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runInboxStatusMutation } from "@/lib/admin/run-inbox-status-mutation";
import {
  deleteInterestRegistrationSchema,
  updateInterestRegistrationSchema,
  type DeleteInterestRegistrationInput,
  type UpdateInterestRegistrationInput,
} from "@/validations/interest-registration";
import { type UpdateInboxStatusInput } from "@/validations/inbox";

export type InterestRegistrationActionResult = AdminActionResult;

const resource = getAdminResource("registrations");

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    updateSuccess: "Registration updated successfully.",
    deleteSuccess: "Registration deleted successfully.",
    inboxStatusSuccess: "Inbox status updated.",
    unauthorized: "You do not have permission to manage registrations.",
    signedInRequired: "You must be signed in.",
    notFound: "Registration not found.",
    duplicate: "You already registered this company with this email.",
    genericError: "Something went wrong. Please try again.",
  },
  fr: {
    invalidDetails: "Vérifiez le formulaire et réessayez.",
    updateSuccess: "Inscription mise à jour avec succès.",
    deleteSuccess: "Inscription supprimée avec succès.",
    inboxStatusSuccess: "Statut de la boîte de réception mis à jour.",
    unauthorized:
      "Vous n’avez pas la permission de gérer les inscriptions d’intérêt.",
    signedInRequired: "Vous devez être connecté.",
    notFound: "Inscription introuvable.",
    duplicate:
      "Vous avez déjà enregistré cette entreprise avec cet e-mail.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
  },
} as const;

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

function refreshRegistrationsRoute() {
  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
  });
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
          return { status: "error", message: copy.duplicate, pgError: error };
        }
        return { status: "error", message: copy.genericError, pgError: error };
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
        return { status: "error", message: copy.genericError, pgError: error };
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

  return runInboxStatusMutation({
    table: "interest_registrations",
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.inboxStatusSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    refresh: () => refreshRegistrationsRoute(),
  });
}

/** Full registration for the shared inbox view/edit dialog. */
export async function loadInterestRegistration(id: string) {
  return getInterestRegistrationById(id);
}
