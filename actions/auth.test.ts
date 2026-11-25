import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient, getRequestLocale, redirect } =
  vi.hoisted(() => ({
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

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "127.0.0.1" : null),
  })),
}));


import { signIn, signInWithGoogle, signOut, signUp } from "@/actions/auth";

const validSignup = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  password: "Testpass1",
  confirmPassword: "Testpass1",
  type: "startup" as const,
};

const validLogin = {
  email: "ada@example.com",
  password: "Testpass1",
};

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
      type: "startup",
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

    const result = await signUp(validSignup);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message.toLowerCase()).toMatch(/already|exist/i);
    }
  });

  it("passes account_type into signup metadata", async () => {
    const signUpMock = vi.fn().mockResolvedValue({
      data: {
        user: { id: "u1", identities: [{ id: "i1" }] },
        session: null,
      },
      error: null,
    });
    createClient.mockResolvedValue({
      auth: { signUp: signUpMock },
    });

    const result = await signUp({
      ...validSignup,
      type: "investor",
    });

    expect(result.status).toBe("success");
    expect(signUpMock).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: {
            full_name: "Ada Lovelace",
            account_type: "investor",
          },
        }),
      }),
    );
  });

  it("signs in successfully", async () => {
    createClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: "u1" } },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: "editor" },
              error: null,
            }),
          })),
        })),
      })),
    });

    await expect(signIn(validLogin)).resolves.toMatchObject({
      status: "success",
      redirectTo: "/dashboard",
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

    const result = await signIn(validLogin);
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

  it("forwards signup account_type on the Google OAuth callback URL", async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth" },
      error: null,
    });
    createClient.mockResolvedValue({ auth: { signInWithOAuth } });

    await signInWithGoogle("/en/apply", "investor");

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo:
          "http://localhost:3000/auth/callback?next=%2Fen%2Fapply&locale=en&account_type=investor",
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
            "http://localhost:3000/auth/callback?next=%2Fen&locale=en",
        },
      }),
    );
  });

  it("signs out locally and redirects to login", async () => {
    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    createClient.mockResolvedValue({
      auth: {
        signOut: signOutMock,
      },
    });

    await signOut();
    expect(signOutMock).toHaveBeenCalledWith({ scope: "local" });
    expect(redirect).toHaveBeenCalled();
  });
});
