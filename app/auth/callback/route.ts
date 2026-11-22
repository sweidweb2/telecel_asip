import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { authPath } from "@/constants/routes";
import { resolvePostAuthRedirect } from "@/lib/auth/role-landing";
import { createClient } from "@/lib/supabase/server";
import {
  REGISTER_ACCOUNT_TYPES,
  type RegisterAccountType,
} from "@/validations/auth";

/** New Google signups only — avoid flipping type on every return login. */
const NEW_PROFILE_WINDOW_MS = 5 * 60 * 1000;

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
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, type, created_at")
          .eq("id", user.id)
          .maybeSingle();
        role = profile?.role ?? null;

        // Apply signup Google account_type to brand-new viewer profiles only.
        if (
          accountType &&
          profile &&
          profile.role === "viewer" &&
          profile.type !== "admin" &&
          profile.type !== accountType
        ) {
          const createdAt = Date.parse(profile.created_at);
          const isRecent =
            Number.isFinite(createdAt) &&
            Date.now() - createdAt < NEW_PROFILE_WINDOW_MS;
          if (isRecent) {
            const { error: typeError } = await supabase
              .from("profiles")
              .update({ type: accountType })
              .eq("id", user.id);
            if (typeError) {
              console.error(
                "[auth/callback] failed to apply account_type",
                typeError.message,
              );
            }
          }
        }
      }

      const redirectTo = resolvePostAuthRedirect({ next, role, locale });
      return NextResponse.redirect(new URL(redirectTo, origin));
    }
  }

  return NextResponse.redirect(new URL(authPath(locale, "login"), origin));
}
