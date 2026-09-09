"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { match, P } from "ts-pattern";

import { authActionMessagesFor } from "@/components/auth/auth-labels";
import type { Locale } from "@/constants/locales";
import { authPath, ROUTES } from "@/constants/routes";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  TURNSTILE_LOGIN_ACTION,
  TURNSTILE_SIGNUP_ACTION,
} from "@/types/turnstile";
import {
  loginSchemaFor,
  registerSchemaFor,
  type LoginInput,
  type RegisterInput,
} from "@/validations/auth";

export type AuthActionResult =
  | { status: "success"; message?: string; redirectTo?: string }
  | { status: "error"; message: string };

function mapAuthError(message: string, locale: Locale): string {
  const copy = authActionMessagesFor(locale);
  const lower = message.toLowerCase();

  return match(lower)
    .with(
      P.when(
        (value) =>
          value.includes("invalid login credentials") ||
          value.includes("invalid credentials"),
      ),
      () => copy.invalidCredentials,
    )
    .with(
      P.when(
        (value) =>
          value.includes("already registered") ||
          value.includes("user already registered") ||
          value.includes("already been registered") ||
          value.includes("email address is already"),
      ),
      () => copy.emailExists,
    )
    .with(
      P.when(
        (value) =>
          value.includes("password") &&
          (value.includes("weak") ||
            value.includes("at least") ||
            value.includes("too short") ||
            value.includes("should be")),
      ),
      () => copy.weakPassword,
    )
    .with(
      P.when((value) => value.includes("email not confirmed")),
      () => copy.emailNotConfirmed,
    )
    .with(
      P.when(
        (value) =>
          value.includes("rate limit") ||
          value.includes("too many requests") ||
          value.includes("over_request_rate_limit"),
      ),
      () => copy.rateLimited,
    )
    .otherwise(() => {
      // Unmapped GoTrue messages can name internals or confirm account state.
      // Log them for us; show the visitor a translated generic message.
      console.error("[auth] unmapped Supabase auth error", message);
      return copy.genericError;
    });
}

function safeRedirectPath(path: string | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return ROUTES.dashboard;
  }
  return path;
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

export async function signUp(
  input: RegisterInput,
  redirectTo?: string,
): Promise<AuthActionResult> {
  const locale = await getRequestLocale();
  const copy = authActionMessagesFor(locale);
  const parsed = registerSchemaFor(locale).safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidSignupDetails,
    };
  }

  const { fullName, email, password, turnstileToken } = parsed.data;
  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: turnstileToken,
    expectedAction: TURNSTILE_SIGNUP_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const supabase = await createClient();
  const afterAuthPath = safeRedirectPath(redirectTo);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Public signup never sets app_metadata.app_role — handle_new_user
      // defaults the profile to viewer.
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: mapAuthError(error.message, locale) };
  }

  // Supabase may return a user with empty identities for existing emails.
  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    return {
      status: "error",
      message: copy.emailExists,
    };
  }

  if (data.session) {
    return {
      status: "success",
      message: copy.accountCreated,
      redirectTo: afterAuthPath === ROUTES.dashboard ? `/${locale}` : afterAuthPath,
    };
  }

  return {
    status: "success",
    message: copy.confirmEmail,
  };
}

export async function signIn(
  input: LoginInput,
  redirectTo?: string,
): Promise<AuthActionResult> {
  const locale = await getRequestLocale();
  const copy = authActionMessagesFor(locale);
  const parsed = loginSchemaFor(locale).safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? copy.invalidLoginDetails,
    };
  }

  const ip = await getClientIp();
  const turnstileOk = await verifyTurnstileToken({
    token: parsed.data.turnstileToken,
    expectedAction: TURNSTILE_LOGIN_ACTION,
    remoteip: ip,
  });
  if (!turnstileOk) {
    return { status: "error", message: copy.verificationFailed };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: mapAuthError(error.message, locale) };
  }

  return {
    status: "success",
    message: copy.signedIn,
    redirectTo: safeRedirectPath(redirectTo),
  };
}

export async function signInWithGoogle(
  redirectTo?: string
): Promise<AuthActionResult> {
  const locale = await getRequestLocale();
  const copy = authActionMessagesFor(locale);
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const callbackUrl = new URL("/auth/callback", siteUrl);

  callbackUrl.searchParams.set("next", safeRedirectPath(redirectTo));
  callbackUrl.searchParams.set("locale", locale);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    if (error) {
      console.error("[auth] Google OAuth failed", error);
    }
    return { status: "error", message: copy.genericError };
  }

  return { status: "success", redirectTo: data.url };
}

export async function signOut(): Promise<void> {
  const locale = await getRequestLocale();
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  // Still redirect on failure: the local cookies are cleared either way, so
  // leaving the user on the dashboard would be worse than a stale server session.
  if (error) {
    console.error("[auth] signOut failed", error);
  }

  redirect(authPath(locale, "login"));
}
