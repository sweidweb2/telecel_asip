import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { authPath } from "@/constants/routes";
import { resolvePostAuthRedirect } from "@/lib/auth/role-landing";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const requestedLocale = searchParams.get("locale");
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
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        role = profile?.role ?? null;
      }

      const redirectTo = resolvePostAuthRedirect({ next, role, locale });
      return NextResponse.redirect(new URL(redirectTo, origin));
    }
  }

  return NextResponse.redirect(new URL(authPath(locale, "login"), origin));
}
