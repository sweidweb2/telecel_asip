"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getInvestorInterestById } from "@/data/investor-interests";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { runInboxStatusMutation } from "@/lib/admin/run-inbox-status-mutation";
import { type UpdateInboxStatusInput } from "@/validations/inbox";
import {
  deleteInvestorInterestSchema,
  updateInvestorInterestSchema,
  type DeleteInvestorInterestInput,
  type UpdateInvestorInterestInput,
} from "@/validations/investor-interest";

export type InvestorInterestActionResult = AdminActionResult;

const resource = getAdminResource("investorInterests");

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    updateSuccess: "Investor interest updated successfully.",
    deleteSuccess: "Investor interest deleted successfully.",
    inboxStatusSuccess: "Inbox status updated.",
    unauthorized: "You do not have permission to manage investor interests.",
    signedInRequired: "You must be signed in.",
    notFound: "Investor interest not found.",
    duplicate: "An interest already exists for this organization and email.",
    genericError: "Something went wrong. Please try again.",
  },
  fr: {
    invalidDetails: "Vérifiez le formulaire et réessayez.",
    updateSuccess: "Intérêt investisseur mis à jour avec succès.",
    deleteSuccess: "Intérêt investisseur supprimé avec succès.",
    inboxStatusSuccess: "Statut de la boîte de réception mis à jour.",
    unauthorized:
      "Vous n’avez pas la permission de gérer les intérêts investisseurs.",
    signedInRequired: "Vous devez être connecté.",
    notFound: "Intérêt investisseur introuvable.",
    duplicate: "Un intérêt existe déjà pour cette organisation et cet e-mail.",
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
    message.includes("investor_interests_email_org") ||
    message.includes("investor_interests_user_org")
  );
}

function refreshInvestorInterestsRoute() {
  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
  });
}

export async function updateInvestorInterest(
  input: UpdateInvestorInterestInput,
): Promise<InvestorInterestActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: updateInvestorInterestSchema,
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
        email,
        phone,
        organization,
        jobTitle,
        linkedin,
        investorType,
        focusNote,
        commsOptIn,
      } = data;

      const { data: row, error } = await session.supabase
        .from("investor_interests")
        .update({
          full_name: fullName,
          email,
          phone: phone.trim() ? phone.trim() : null,
          organization,
          job_title: jobTitle.trim() ? jobTitle.trim() : null,
          linkedin: linkedin?.trim() ? linkedin.trim() : null,
          investor_type: investorType,
          focus_note: focusNote.trim() ? focusNote.trim() : null,
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
    refresh: () => refreshInvestorInterestsRoute(),
  });
}

export async function deleteInvestorInterest(
  input: DeleteInvestorInterestInput,
): Promise<InvestorInterestActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runAdminMutation({
    schema: deleteInvestorInterestSchema,
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
        .from("investor_interests")
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
    refresh: () => refreshInvestorInterestsRoute(),
  });
}

export async function updateInvestorInterestInboxStatus(
  input: UpdateInboxStatusInput,
): Promise<InvestorInterestActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];

  return runInboxStatusMutation({
    table: "investor_interests",
    input,
    messages: {
      unauthorized: copy.unauthorized,
      signedInRequired: copy.signedInRequired,
      invalidDetails: copy.invalidDetails,
      success: copy.inboxStatusSuccess,
      genericError: copy.genericError,
      notFound: copy.notFound,
    },
    refresh: () => refreshInvestorInterestsRoute(),
  });
}

/** Full investor interest for the shared inbox view/edit dialog. */
export async function loadInvestorInterest(id: string) {
  return getInvestorInterestById(id);
}
