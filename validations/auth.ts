import { z } from "zod";

import { DEFAULT_LOCALE, type Locale } from "@/constants/locales";
import { passwordComplexitySchema } from "@/validations/common-fields";

/** Public signup audience choices only — never `admin`. */
export const REGISTER_ACCOUNT_TYPES = ["startup", "investor"] as const;
export type RegisterAccountType = (typeof REGISTER_ACCOUNT_TYPES)[number];

type AuthValidationMessages = {
  invalidEmail: string;
  passwordRequired: string;
  passwordMin: string;
  passwordLetter: string;
  passwordNumber: string;
  nameMin: string;
  nameMax: string;
  confirmRequired: string;
  passwordsMismatch: string;
  accountTypeRequired: string;
};

const VALIDATION_MESSAGES: Record<Locale, AuthValidationMessages> = {
  en: {
    invalidEmail: "Enter a valid email address",
    passwordRequired: "Password is required",
    passwordMin: "Password must be at least 8 characters",
    passwordLetter: "Password must include a letter",
    passwordNumber: "Password must include a number",
    nameMin: "Name must be at least 2 characters",
    nameMax: "Name is too long",
    confirmRequired: "Confirm your password",
    passwordsMismatch: "Passwords do not match",
    accountTypeRequired: "Choose Startup or Investor",
  },
  fr: {
    invalidEmail: "Entrez une adresse e-mail valide",
    passwordRequired: "Le mot de passe est requis",
    passwordMin: "Le mot de passe doit contenir au moins 8 caractères",
    passwordLetter: "Le mot de passe doit contenir une lettre",
    passwordNumber: "Le mot de passe doit contenir un chiffre",
    nameMin: "Le nom doit contenir au moins 2 caractères",
    nameMax: "Le nom est trop long",
    confirmRequired: "Confirmez votre mot de passe",
    passwordsMismatch: "Les mots de passe ne correspondent pas",
    accountTypeRequired: "Choisissez Startup ou Investor",
  },
};

/** Coerce missing RHF/server fields so Zod never throws the raw "expected string" message. */
function requiredString(message: string) {
  return z.preprocess(
    (value) => (value == null ? "" : value),
    z.string(message),
  );
}

export function loginSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const messages = VALIDATION_MESSAGES[locale];

  return z.object({
    email: requiredString(messages.invalidEmail)
      .pipe(z.string().trim().toLowerCase())
      .pipe(z.email(messages.invalidEmail)),
    password: requiredString(messages.passwordRequired).pipe(
      z.string().min(1, messages.passwordRequired),
    ),
  });
}

export function registerSchemaFor(locale: Locale = DEFAULT_LOCALE) {
  const messages = VALIDATION_MESSAGES[locale];

  return z
    .object({
      fullName: requiredString(messages.nameMin).pipe(
        z.string().trim().min(2, messages.nameMin).max(80, messages.nameMax),
      ),
      email: requiredString(messages.invalidEmail)
        .pipe(z.string().trim().toLowerCase())
        .pipe(z.email(messages.invalidEmail)),
      password: requiredString(messages.passwordMin).pipe(
        passwordComplexitySchema({
          min: messages.passwordMin,
          letter: messages.passwordLetter,
          number: messages.passwordNumber,
        }),
      ),
      confirmPassword: requiredString(messages.confirmRequired).pipe(
        z.string().min(1, messages.confirmRequired),
      ),
      type: z.enum(REGISTER_ACCOUNT_TYPES, messages.accountTypeRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.passwordsMismatch,
      path: ["confirmPassword"],
    });
}

/** Default English schemas for shared typing and unit tests. */
export const loginSchema = loginSchemaFor(DEFAULT_LOCALE);
export const registerSchema = registerSchemaFor(DEFAULT_LOCALE);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
