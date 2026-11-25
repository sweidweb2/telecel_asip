"use server";

import { redirect } from "next/navigation";
import { match, P } from "ts-pattern";

import { authActionMessagesFor } from "@/constants/auth-labels";
import type { Locale } from "@/constants/locales";
import { authPath, publicPath } from "@/constants/routes";
import { resolvePostAuthRedirect } from "@/lib/auth/role-landing";
import { safeRedirectPath } from "@/lib/auth/safe-redirect-path";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  loginSchemaFor,
  registerSchemaFor,
  type LoginInput,
  type RegisterAccountType,
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

  const { fullName, email, password, type } = parsed.data;

  const supabase = await createClient();
  const homePath = publicPath(locale, "");
  const afterAuthPath = safeRedirectPath(redirectTo, homePath);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Public signup never sets app_metadata.app_role — handle_new_user
      // defaults the profile to viewer. account_type is startup|investor only.
      data: { full_name: fullName, account_type: type },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(afterAuthPath)}&locale=${locale}`,
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
      redirectTo: resolvePostAuthRedirect({
        next: redirectTo,
        role: "viewer",
        locale,
      }),
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

  const supabase = await createClient();
  const { data: signedIn, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { status: "error", message: mapAuthError(error.message, locale) };
  }

  let role: Database["public"]["Enums"]["user_role"] | null = null;
  if (signedIn.user?.id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signedIn.user.id)
      .maybeSingle();
    if (profileError) {
      console.error("[auth] profile role lookup failed", profileError);
      return { status: "error", message: copy.genericError };
    }
    role = profile?.role ?? null;
  }

  return {
    status: "success",
    message: copy.signedIn,
    redirectTo: resolvePostAuthRedirect({
      next: redirectTo,
      role,
      locale,
    }),
  };
}

export async function signInWithGoogle(
  redirectTo?: string,
  accountType?: RegisterAccountType,
): Promise<AuthActionResult> {
  const locale = await getRequestLocale();
  const copy = authActionMessagesFor(locale);
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const callbackUrl = new URL("/auth/callback", siteUrl);

  callbackUrl.searchParams.set(
    "next",
    safeRedirectPath(redirectTo, publicPath(locale, "")),
  );
  callbackUrl.searchParams.set("locale", locale);
  // Signup Google only — login omits this. Callback applies it to new viewer profiles.
  if (accountType === "startup" || accountType === "investor") {
    callbackUrl.searchParams.set("account_type", accountType);
  }

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
  // Local only — "Log out" means this browser. Global would revoke every
  // session for the user (and flake parallel E2E that share storageState).
  const { error } = await supabase.auth.signOut({ scope: "local" });

  // Still redirect on failure: the local cookies are cleared either way, so
  // leaving the user on the dashboard would be worse than a stale server session.
  if (error) {
    console.error("[auth] signOut failed", error);
  }

  redirect(authPath(locale, "login"));
}
