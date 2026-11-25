import { NextResponse } from "next/server";

import { applyGoogleSignupAccountType } from "@/actions/auth-callback";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { authPath } from "@/constants/routes";
import { getAuthCallbackProfile } from "@/data/profiles";
import { resolvePostAuthRedirect } from "@/lib/auth/role-landing";
import { createClient } from "@/lib/supabase/server";
import {
  REGISTER_ACCOUNT_TYPES,
  type RegisterAccountType,
} from "@/validations/auth";

function parseAccountType(value: string | null): RegisterAccountType | null {
  if (
    value &&
    (REGISTER_ACCOUNT_TYPES as readonly string[]).includes(value)
  ) {
    return value as RegisterAccountType;
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const requestedLocale = searchParams.get("locale");
  const accountType = parseAccountType(searchParams.get("account_type"));
  const locale =
    requestedLocale && isLocale(requestedLocale)
      ? requestedLocale
      : DEFAULT_LOCALE;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let role = null;
      if (user?.id) {
        const profile = await getAuthCallbackProfile(user.id);
        role = profile?.role ?? null;

        if (accountType && profile) {
          await applyGoogleSignupAccountType({
            userId: user.id,
            accountType,
            profile,
          });
        }
      }

      const redirectTo = resolvePostAuthRedirect({ next, role, locale });
      return NextResponse.redirect(new URL(redirectTo, origin));
    }
  }

  return NextResponse.redirect(new URL(authPath(locale, "login"), origin));
}
