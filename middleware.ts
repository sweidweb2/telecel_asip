import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/constants/locales";
import { PUBLIC_PAGE_SLUG_SET } from "@/constants/public-pages";
import { authPath, ROUTES } from "@/constants/routes";
import { staffRoleFromAppMetadata } from "@/lib/admin/staff-role-from-app-metadata";
import type { Database } from "@/types/database";

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) {
    return cookie;
  }

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .find(Boolean);

  if (preferred?.startsWith("fr")) {
    return "fr";
  }

  return DEFAULT_LOCALE;
}

function withLocaleHeaders(
  response: NextResponse,
  locale: Locale,
  request: NextRequest,
): NextResponse {
  response.headers.set(LOCALE_HEADER, locale);
  // Only Set-Cookie when the preferred locale changes — avoids blocking
  // shared HTML CDN caching on every marketing response.
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (existing !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

/**
 * Locale negotiation and auth checks read the locale cookie, `Accept-Language`
 * and the Supabase session, so these redirects must never enter a shared cache:
 * a stored 307 would pin the first visitor's language (or destination) for
 * everyone hitting the same unprefixed URL.
 */
function withNoStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

function copyCookies(from: NextResponse, to: NextResponse): void {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function isAuthPage(pathname: string): boolean {
  if (
    pathname === ROUTES.login ||
    pathname === ROUTES.signup ||
    pathname === "/register"
  ) {
    return true;
  }

  const segments = pathname.split("/").filter(Boolean);
  return (
    segments.length === 2 &&
    isLocale(segments[0]) &&
    (segments[1] === "login" ||
      segments[1] === "signup" ||
      segments[1] === "register")
  );
}

/** Personalized intake — session gate + form; refresh cookies, never require login. */
function isIntakePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return (
    segments.length === 2 &&
    isLocale(segments[0]) &&
    (segments[1] === "apply" || segments[1] === "register-interest")
  );
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === ROUTES.dashboard ||
    pathname.startsWith(`${ROUTES.dashboard}/`) ||
    pathname === ROUTES.admin ||
    pathname.startsWith(`${ROUTES.admin}/`)
  );
}

async function refreshSupabaseSession(
  request: NextRequest,
  options?: { includeRole?: boolean },
): Promise<{
  response: NextResponse;
  userId: string | null;
  isAdmin: boolean;
  isEditor: boolean;
}> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      response: NextResponse.next({ request }),
      userId: null,
      isAdmin: false,
      isEditor: false,
    };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response, userId: null, isAdmin: false, isEditor: false };
  }

  // Login and intake only need a refreshed session. Staff redirects need a role.
  if (!options?.includeRole) {
    return { response, userId: user.id, isAdmin: false, isEditor: false };
  }

  // Auth Admin writes app_metadata.app_role. getUser() already loaded it, so
  // staff redirects skip get_staff_shell. Layouts still call that RPC for
  // name, email, and the real role check. Missing claim falls back to the RPC
  // for accounts created before the flag existed.
  const appRole = staffRoleFromAppMetadata(user.app_metadata);
  if (appRole) {
    return {
      response,
      userId: user.id,
      isAdmin: appRole === "admin",
      isEditor: appRole === "editor",
    };
  }

  const { data: shell, error } = await supabase
    .rpc("get_staff_shell")
    .maybeSingle();

  if (error || !shell) {
    return {
      response,
      userId: user.id,
      isAdmin: false,
      isEditor: false,
    };
  }

  return {
    response,
    userId: user.id,
    isAdmin: Boolean(shell.is_admin),
    isEditor: Boolean(shell.is_editor),
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = detectLocale(request);
  const needsSession =
    isProtectedPath(pathname) || isAuthPage(pathname) || isIntakePath(pathname);

  if (needsSession) {
    const { response, userId, isAdmin, isEditor } =
      await refreshSupabaseSession(request, {
        includeRole: isProtectedPath(pathname),
      });

    if (isProtectedPath(pathname) && !userId) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = authPath(locale, "login");
      loginUrl.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(loginUrl);
      copyCookies(response, redirect);
      return withNoStore(withLocaleHeaders(redirect, locale, request));
    }

    if (isProtectedPath(pathname) && userId) {
      // Role gate here avoids painting the wrong shell HTML for viewers.
      // Role comes from app_metadata.app_role on the getUser() result.
      // Layouts still call get_staff_shell for chrome fields and as the
      // source of truth; middleware and RSC do not share React.cache.
      const isAdminPath =
        pathname === ROUTES.admin || pathname.startsWith(`${ROUTES.admin}/`);
      const isDashboardPath =
        pathname === ROUTES.dashboard ||
        pathname.startsWith(`${ROUTES.dashboard}/`);

      if (isAdminPath && !isAdmin) {
        const target = request.nextUrl.clone();
        target.pathname = isEditor ? ROUTES.dashboard : `/${locale}`;
        target.search = "";
        const redirect = NextResponse.redirect(target);
        copyCookies(response, redirect);
        return withNoStore(withLocaleHeaders(redirect, locale, request));
      }

      if (isDashboardPath && !isEditor) {
        const target = request.nextUrl.clone();
        target.pathname = isAdmin ? ROUTES.admin : `/${locale}`;
        target.search = "";
        const redirect = NextResponse.redirect(target);
        copyCookies(response, redirect);
        return withNoStore(withLocaleHeaders(redirect, locale, request));
      }
    }

    if (isAuthPage(pathname) && userId) {
      // Signed-in users (viewer or admin) cannot open login/signup.
      // Send them to the locale home — viewers are not dashboard users.
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${locale}`;
      homeUrl.search = "";
      const redirect = NextResponse.redirect(homeUrl);
      copyCookies(response, redirect);
      return withNoStore(redirect);
    }

    // Auth / intake — continue with refreshed session cookies
    const segments = pathname.split("/").filter(Boolean);
    const first = segments[0];
    if (first && isLocale(first)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(LOCALE_HEADER, first);
      const next = NextResponse.next({
        request: { headers: requestHeaders },
      });
      copyCookies(response, next);
      return withLocaleHeaders(next, first, request);
    }

    response.headers.set(LOCALE_HEADER, locale);
    return response;
  }

  // Marketing / public — locale only (no Supabase session refresh)
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (pathname === "/") {
    const redirect = NextResponse.redirect(new URL(`/${locale}`, request.url));
    return withNoStore(withLocaleHeaders(redirect, locale, request));
  }

  if (first && isLocale(first)) {
    // Mutual intake gate: open_applications also drives nav CTA, banner, and SEO.
    // Wrong intake URL redirects in page render; Server Actions reject the inactive path.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, first);
    const next = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return withLocaleHeaders(next, first, request);
  }

  if (
    segments.length === 1 &&
    segments[0] !== "" &&
    PUBLIC_PAGE_SLUG_SET.has(segments[0])
  ) {
    const redirect = NextResponse.redirect(
      new URL(`/${locale}/${segments[0]}`, request.url)
    );
    return withNoStore(withLocaleHeaders(redirect, locale, request));
  }

  const response = NextResponse.next({ request });
  response.headers.set(LOCALE_HEADER, locale);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
