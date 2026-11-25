import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@/types/database";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

/**
 * Supabase client for `/auth/callback` that records session cookies so the
 * route can attach them to the final `NextResponse.redirect()`. Using
 * `cookies()` from `next/headers` alone can drop Set-Cookie on redirects.
 */
export function createAuthCallbackClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
  }

  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(incoming) {
        incoming.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.push(...incoming);
      },
    },
  });

  return {
    supabase,
    /**
     * Build a redirect that carries every cookie written during
     * `exchangeCodeForSession` (httpOnly / secure / sameSite preserved).
     */
    redirect(destination: string): NextResponse {
      const response = NextResponse.redirect(destination);
      response.headers.set("Cache-Control", "private, no-store");
      for (const cookie of cookiesToSet) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
      return response;
    },
  };
}

/** Prefer proxy host in production so redirects stay on the public site URL. */
export function publicRequestOrigin(request: Request): string {
  const { origin } = new URL(request.url);
  if (process.env.NODE_ENV === "development") return origin;

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return origin;

  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${forwardedProto}://${forwardedHost}`;
}
