import { type NextRequest, NextResponse } from "next/server";

import { applyGoogleSignupAccountType } from "@/actions/auth-callback";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { authPath } from "@/constants/routes";
import { getAuthCallbackProfile } from "@/data/profiles";
import { resolvePostAuthRedirect } from "@/lib/auth/role-landing";
import {
  createAuthCallbackClient,
  publicRequestOrigin,
} from "@/lib/supabase/auth-callback-client";
import {
  REGISTER_ACCOUNT_TYPES,
  type RegisterAccountType,
} from "@/validations/auth";

export const runtime = "nodejs";

function parseAccountType(value: string | null): RegisterAccountType | null {
  if (
    value &&
    (REGISTER_ACCOUNT_TYPES as readonly string[]).includes(value)
  ) {
    return value as RegisterAccountType;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = publicRequestOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const requestedLocale = searchParams.get("locale");
  const accountType = parseAccountType(searchParams.get("account_type"));
  const locale =
    requestedLocale && isLocale(requestedLocale)
      ? requestedLocale
      : DEFAULT_LOCALE;

  const loginUrl = new URL(authPath(locale, "login"), origin).toString();

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  const { supabase, redirect } = createAuthCallbackClient(request);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error(
      "[auth/callback] exchangeCodeForSession failed",
      error.message,
    );
    return redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = null;
  if (user?.id) {
    try {
      const profile = await getAuthCallbackProfile(supabase, user.id);
      role = profile?.role ?? null;

      if (accountType && profile) {
        await applyGoogleSignupAccountType({
          supabase,
          userId: user.id,
          accountType,
          profile,
        });
      }
    } catch (err) {
      console.error("[auth/callback] profile load failed", err);
    }
  }

  const redirectTo = resolvePostAuthRedirect({ next, role, locale });
  return redirect(new URL(redirectTo, origin).toString());
}
