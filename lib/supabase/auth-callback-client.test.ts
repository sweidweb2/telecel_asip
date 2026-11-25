import { describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      options: {
        cookies: {
          setAll: (
            cookies: Array<{ name: string; value: string; options?: object }>,
          ) => void;
        };
      },
    ) => {
      // Simulate exchange writing the session cookie.
      options.cookies.setAll([
        {
          name: "sb-access-token",
          value: "token",
          options: { path: "/", httpOnly: true, sameSite: "lax" },
        },
      ]);
      return {
        auth: {
          exchangeCodeForSession: vi.fn(),
          getUser: vi.fn(),
        },
      };
    },
  ),
}));

import { createAuthCallbackClient } from "@/lib/supabase/auth-callback-client";

describe("createAuthCallbackClient", () => {
  it("attaches exchanged session cookies to the redirect response", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

    const request = {
      cookies: {
        getAll: () => [],
        set: vi.fn(),
      },
    };

    const { redirect } = createAuthCallbackClient(request as never);
    const response = redirect("http://127.0.0.1:3000/en");

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/en");
    expect(response.cookies.get("sb-access-token")?.value).toBe("token");
  });
});
