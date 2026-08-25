"use server";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  interestRegistrationSchemaFor,
  type InterestRegistrationInput,
} from "@/validations/interest-registration";

export type InterestRegistrationActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const ACTION_MESSAGES = {
  en: {
    invalidDetails: "Please check the form and try again.",
    success: "Thank you — your interest has been registered.",
    genericError: "Something went wrong. Please try again.",
  },
  fr: {
    invalidDetails: "Veuillez vérifier le formulaire et réessayer.",
    success: "Merci — votre intérêt a bien été enregistré.",
    genericError: "Une erreur s’est produite. Veuillez réessayer.",
  },
} as const;

export async function submitInterestRegistration(
  input: InterestRegistrationInput
): Promise<InterestRegistrationActionResult> {
  const locale = await getRequestLocale();
  const copy = ACTION_MESSAGES[locale];
  const parsed = interestRegistrationSchemaFor(locale).safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidDetails,
    };
  }

  const {
    fullName,
    email,
    phone,
    companyName,
    sector,
    country,
    pitch,
    consent,
  } = parsed.data;

  const admin = createAdminClient();
  const { error } = await admin.from("interest_registrations").insert({
    full_name: fullName,
    email,
    phone,
    company_name: companyName,
    sector,
    country,
    pitch,
    consent,
  });

  if (error) {
    return { status: "error", message: copy.genericError };
  }

  return { status: "success", message: copy.success };
}
