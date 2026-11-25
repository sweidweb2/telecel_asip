import { z } from "zod";

/**
 * Phone character pattern (optional leading +). Length is enforced separately
 * so total char_length stays within the DB 7–20 window (not 1+20=21).
 */
export const PHONE_REGEX = /^\+?[0-9\s().-]+$/;

/** Loose http(s) check — empty string is allowed by optional helpers. */
export const HTTP_URL_REGEX = /^https?:\/\/.+/i;

export const DEFAULT_URL_MAX = 500;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;
export const PHONE_MIN = 7;
export const PHONE_MAX = 20;

function phoneHasEnoughDigits(value: string) {
  return value.replace(/\D/g, "").length >= PHONE_MIN;
}

/** Required phone: 7–20 chars, digit floor after stripping non-digits. */
export function requiredPhone(message: string) {
  return z
    .string()
    .trim()
    .min(PHONE_MIN, message)
    .max(PHONE_MAX, message)
    .regex(PHONE_REGEX, message)
    .refine(phoneHasEnoughDigits, message);
}

/** Optional phone: empty string or a valid phone (same 7–20 DB window). */
export function optionalPhone(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => {
      if (value === "") return true;
      if (value.length < PHONE_MIN || value.length > PHONE_MAX) return false;
      return PHONE_REGEX.test(value) && phoneHasEnoughDigits(value);
    }, message);
}

/**
 * Optional http(s) URL. When `allowUndefined` is true, matches founder intake
 * schemas that accept `undefined | ""`.
 */
export function optionalHttpUrl(
  message: string,
  options?: { max?: number; allowUndefined?: boolean },
) {
  const max = options?.max ?? DEFAULT_URL_MAX;
  const base = z
    .string()
    .trim()
    .max(max, message)
    .refine((value) => value === "" || HTTP_URL_REGEX.test(value), message);

  if (options?.allowUndefined) {
    return base.optional().or(z.literal(""));
  }

  return base;
}

/** Email: trim + lowercase + zod email, with optional max. */
export function trimmedEmail(invalidMessage: string, maxMessage?: string) {
  const max = maxMessage
    ? z.email(invalidMessage).max(254, maxMessage)
    : z.email(invalidMessage).max(254, invalidMessage);

  return z.string().trim().toLowerCase().pipe(max);
}

/** Consent must be explicitly true. */
export function requiredConsent(message: string) {
  return z.boolean().refine((value) => value === true, { message });
}

/** Password with letter + number complexity (shared by auth + admin users). */
export function passwordComplexitySchema(messages: {
  min: string;
  letter: string;
  number: string;
  max?: string;
}) {
  return z
    .string()
    .min(PASSWORD_MIN, messages.min)
    .max(PASSWORD_MAX, messages.max ?? messages.min)
    .regex(/[A-Za-z]/, messages.letter)
    .regex(/[0-9]/, messages.number);
}

/**
 * Optional string that is either empty or at least `min` chars (after trim).
 * Caps at `max`.
 */
export function optionalMinLengthString(
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string,
) {
  return z
    .string()
    .trim()
    .max(max, maxMessage)
    .refine((value) => value === "" || value.length >= min, minMessage);
}
