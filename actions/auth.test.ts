import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getRequestLocale, redirect } = vi.hoisted(() => ({
  createClient: vi.fn(),
  getRequestLocale: vi.fn(async () => "en" as const),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import { signIn, signInWithGoogle, signOut, signUp } from "@/actions/auth";

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid signup details", async () => {
    const result = await signUp({
      fullName: "A",
      email: "bad",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.status).toBe("error");
    expect(createClient).not.toHaveBeenCalled();
  });

  it("maps duplicate signup identities to email-exists", async () => {
    createClient.mockResolvedValue({
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: {
            user: { id: "u1", identities: [] },
            session: null,
          },
          error: null,
        }),
      },
    });

    const result = await signUp({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Testpass1",
      confirmPassword: "Testpass1",
    });

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message.toLowerCase()).toMatch(/already|exist/i);
    }
  });

  it("signs in successfully", async () => {
    createClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      },
    });

    await expect(
      signIn({ email: "ada@example.com", password: "Testpass1" }),
    ).resolves.toMatchObject({
      status: "success",
    });
  });

  it("maps invalid login credentials", async () => {
    createClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { message: "Invalid login credentials" },
        }),
      },
    });

    const result = await signIn({
      email: "ada@example.com",
      password: "wrong",
    });
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message.toLowerCase()).toMatch(/invalid|credential/i);
    }
  });

  it("starts Google OAuth with the safe destination and locale", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth" },
      error: null,
    });
    createClient.mockResolvedValue({ auth: { signInWithOAuth } });

    await expect(signInWithGoogle("/dashboard/users")).resolves.toEqual({
      status: "success",
      redirectTo: "https://accounts.google.com/oauth",
    });
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo:
          "http://localhost:3000/auth/callback?next=%2Fdashboard%2Fusers&locale=en",
      },
    });
  });

  it("does not forward an external Google OAuth destination", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth" },
      error: null,
    });
    createClient.mockResolvedValue({ auth: { signInWithOAuth } });

    await signInWithGoogle("//evil.example");

    expect(signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          redirectTo:
            "http://localhost:3000/auth/callback?next=%2Fdashboard&locale=en",
        },
      }),
    );
  });

  it("signs out and redirects to login", async () => {
    createClient.mockResolvedValue({
      auth: {
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    });

    await signOut();
    expect(redirect).toHaveBeenCalled();
  });
});
