import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "127.0.0.1" : null),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: vi.fn(async () => "en" as const),
}));


vi.mock("@/lib/rate-limit", () => ({
  consumeSharedRateLimit: vi.fn(async () => true),
  releaseSharedRateLimit: vi.fn(async () => undefined),
}));

vi.mock("@/lib/admin/authorize-role", () => ({
  authorizeEditor: vi.fn(),
}));

vi.mock("@/lib/admin/get-auth-user", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/data/settings", () => ({
  getOpenApplications: vi.fn(),
  getOpenApplicationsFresh: vi.fn(),
}));

vi.mock("@/data/users", () => ({
  getCurrentUserProfile: vi.fn(),
}));

const insertMock = vi.fn();
const updateEqMock = vi.fn();
const deleteEqMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: insertMock,
    })),
  })),
}));

import {
  deleteInterestRegistration,
  updateInterestRegistration,
  updateInterestRegistrationInboxStatus,
} from "@/actions/interest-registrations";
import { submitInterestRegistration } from "@/actions/submit-interest-registration";
import {
  getOpenApplications,
  getOpenApplicationsFresh,
} from "@/data/settings";
import { getCurrentUserProfile } from "@/data/users";
import { authorizeEditor } from "@/lib/admin/authorize-role";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { consumeSharedRateLimit } from "@/lib/rate-limit";

const validSubmit = {
  fullName: "Ada Lovelace",
  founderRole: "Founder & CEO",
  email: "ada@example.com",
  phone: "+233 20 123 4567",
  country: "Ghana",
  linkedin: "",
  companyName: "Analytical Engines",
  website: "",
  companyCountry: "Ghana",
  sector: "Fintech",
  pitch: "",
  commsOptIn: false,
  consent: true as const,
};

const regId = "22222222-2222-4222-8222-222222222222";

function mockSessionSupabase() {
  const maybeSingle = vi.fn();
  const select = vi.fn(() => ({ maybeSingle }));
  updateEqMock.mockReturnValue({ select });
  deleteEqMock.mockReturnValue({ select });
  return {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: updateEqMock })),
      delete: vi.fn(() => ({ eq: deleteEqMock })),
    })),
    maybeSingle,
  };
}

describe("submitInterestRegistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
    vi.mocked(getOpenApplications).mockResolvedValue(false);
    vi.mocked(getOpenApplicationsFresh).mockResolvedValue(false);
    vi.mocked(getAuthUser).mockResolvedValue({
      id: "user-1",
      email: "ada@example.com",
    } as Awaited<ReturnType<typeof getAuthUser>>);
    vi.mocked(getCurrentUserProfile).mockResolvedValue({
      id: "user-1",
      email: "ada@example.com",
      full_name: "Ada Lovelace",
      role: "viewer",
      type: "startup",
    });
  });

  it("rejects when applications are open", async () => {
    vi.mocked(getOpenApplicationsFresh).mockResolvedValue(true);

    const result = await submitInterestRegistration(validSubmit);

    expect(result).toEqual({
      status: "error",
      message:
        "Applications are open. Submit an official application instead of registering interest.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects when the visitor is not signed in", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const result = await submitInterestRegistration(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Sign in to register your interest.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects non-startup accounts before rate limits", async () => {
    vi.mocked(getCurrentUserProfile).mockResolvedValue({
      id: "user-1",
      email: "ada@example.com",
      full_name: "Ada Lovelace",
      role: "admin",
      type: "admin",
    });

    const result = await submitInterestRegistration(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Only startup accounts can register interest.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads before rate limits", async () => {
    const result = await submitInterestRegistration({
      ...validSubmit,
      fullName: "A",
    });

    expect(result.status).toBe("error");
  });

  it("rejects when rate limited", async () => {
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(false);

    const result = await submitInterestRegistration(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Too many submissions. Please wait and try again later.",
    });
  });

  it("inserts with session email and user_id on success", async () => {

    const result = await submitInterestRegistration({
      ...validSubmit,
      email: "spoofed@example.com",
    });

    expect(result.status).toBe("success");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        email: "ada@example.com",
        company_name: "Analytical Engines",
        linkedin: null,
        website: null,
        locale: "en",
        source_path: "/en/register-interest",
        consent_version: "2026-09-17",
      }),
    );
    expect(consumeSharedRateLimit).toHaveBeenCalled();
  });
});

describe("interest registration admin mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when authorizeEditor fails", async () => {
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage registrations.",
    });

    const result = await updateInterestRegistration({
      id: regId,
      fullName: validSubmit.fullName,
      founderRole: validSubmit.founderRole,
      email: validSubmit.email,
      phone: validSubmit.phone,
      country: validSubmit.country,
      linkedin: "",
      companyName: validSubmit.companyName,
      website: "",
      companyCountry: validSubmit.companyCountry,
      sector: validSubmit.sector,
      pitch: "",
      commsOptIn: false,
    });

    expect(result).toEqual({
      status: "error",
      message: "You do not have permission to manage registrations.",
    });
  });

  it("updates and deletes successfully", async () => {
    const supabase = mockSessionSupabase();
    supabase.maybeSingle.mockResolvedValue({ data: { id: regId }, error: null });
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: supabase as never,
    });

    const updateResult = await updateInterestRegistration({
      id: regId,
      fullName: validSubmit.fullName,
      founderRole: validSubmit.founderRole,
      email: validSubmit.email,
      phone: validSubmit.phone,
      country: validSubmit.country,
      linkedin: "",
      companyName: validSubmit.companyName,
      website: "",
      companyCountry: validSubmit.companyCountry,
      sector: validSubmit.sector,
      pitch: "",
      commsOptIn: false,
    });
    expect(updateResult.status).toBe("success");

    const deleteResult = await deleteInterestRegistration({ id: regId });
    expect(deleteResult.status).toBe("success");

    const inboxResult = await updateInterestRegistrationInboxStatus({
      id: regId,
      inboxStatus: "archived",
    });
    expect(inboxResult.status).toBe("success");
  });
});
