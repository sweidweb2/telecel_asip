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

vi.mock("@/lib/turnstile", () => ({
  verifyTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: vi.fn(() => false),
  recordRateLimitHit: vi.fn(),
}));

vi.mock("@/lib/admin/authorize-editor", () => ({
  authorizeEditor: vi.fn(),
}));

vi.mock("@/lib/admin/get-auth-user", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/data/settings", () => ({
  getOpenApplications: vi.fn(),
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
  deleteApplication,
  submitApplication,
  updateApplication,
  updateApplicationInboxStatus,
} from "@/actions/applications";
import { getOpenApplications } from "@/data/settings";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isRateLimited, recordRateLimitHit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const validSubmit = {
  fullName: "Ada Lovelace",
  founderRole: "Founder & CEO",
  email: "ada@example.com",
  phone: "+233 20 123 4567",
  country: "Ghana",
  linkedin: "https://linkedin.com/in/ada",
  companyName: "Analytical Engines",
  website: "https://analyticalengines.example",
  companyCountry: "Ghana",
  sector: "Fintech",
  problemProduct:
    "African SMEs lack working capital. We build a mobile-first credit platform that underwrites inventory loans in days, not months.",
  traction:
    "120 active merchants, $40k GMV last quarter, one bank pilot live.",
  programmeFit:
    "We need market access and investor intros to expand beyond Accra.",
  commsOptIn: true,
  consent: true as const,
  turnstileToken: "test-turnstile-token",
};

const appId = "11111111-1111-4111-8111-111111111111";

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

describe("submitApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(isRateLimited).mockReturnValue(false);
    vi.mocked(getOpenApplications).mockResolvedValue(true);
    vi.mocked(getAuthUser).mockResolvedValue({
      id: "user-1",
      email: "ada@example.com",
    } as Awaited<ReturnType<typeof getAuthUser>>);
  });

  it("rejects when applications are closed", async () => {
    vi.mocked(getOpenApplications).mockResolvedValue(false);

    const result = await submitApplication(validSubmit);

    expect(result).toEqual({
      status: "error",
      message:
        "Applications are closed. Register your interest to hear when the next chapter opens.",
    });
    expect(getAuthUser).not.toHaveBeenCalled();
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects when the visitor is not signed in", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);

    const result = await submitApplication(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Sign in to submit an application.",
    });
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid payloads before Turnstile", async () => {
    const result = await submitApplication({
      ...validSubmit,
      fullName: "A",
    });

    expect(result.status).toBe("error");
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects when Turnstile fails", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);

    const result = await submitApplication(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Security check failed. Please try again.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    vi.mocked(isRateLimited).mockReturnValue(true);

    const result = await submitApplication(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Too many submissions. Please wait and try again later.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("inserts and records rate-limit hits on success", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);

    const result = await submitApplication(validSubmit);

    expect(result.status).toBe("success");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        company_name: "Analytical Engines",
        consent: true,
      }),
    );
    expect(recordRateLimitHit).toHaveBeenCalled();
  });

  it("stores empty LinkedIn and website as null", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);

    const result = await submitApplication({
      ...validSubmit,
      linkedin: "",
      website: "",
    });

    expect(result.status).toBe("success");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        linkedin: null,
        website: null,
      }),
    );
  });

  it("maps unique violations to a duplicate message", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    insertMock.mockResolvedValue({ error: { code: "23505" } });

    const result = await submitApplication(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "You already applied with this company and email.",
    });
  });
});

describe("application admin mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updateApplication returns unauthorized from authorizeEditor", async () => {
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage applications.",
    });

    const result = await updateApplication({
      id: appId,
      fullName: validSubmit.fullName,
      founderRole: validSubmit.founderRole,
      email: validSubmit.email,
      phone: validSubmit.phone,
      country: validSubmit.country,
      linkedin: validSubmit.linkedin,
      companyName: validSubmit.companyName,
      website: validSubmit.website,
      companyCountry: validSubmit.companyCountry,
      sector: validSubmit.sector,
      problemProduct: validSubmit.problemProduct,
      traction: validSubmit.traction,
      programmeFit: validSubmit.programmeFit,
      commsOptIn: validSubmit.commsOptIn,
    });

    expect(result).toEqual({
      status: "error",
      message: "You do not have permission to manage applications.",
    });
  });

  it("updateApplication succeeds when authorizeEditor and row update work", async () => {
    const supabase = mockSessionSupabase();
    supabase.maybeSingle.mockResolvedValue({ data: { id: appId }, error: null });
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: supabase as never,
    });

    const result = await updateApplication({
      id: appId,
      fullName: validSubmit.fullName,
      founderRole: validSubmit.founderRole,
      email: validSubmit.email,
      phone: validSubmit.phone,
      country: validSubmit.country,
      linkedin: validSubmit.linkedin,
      companyName: validSubmit.companyName,
      website: validSubmit.website,
      companyCountry: validSubmit.companyCountry,
      sector: validSubmit.sector,
      problemProduct: validSubmit.problemProduct,
      traction: validSubmit.traction,
      programmeFit: validSubmit.programmeFit,
      commsOptIn: validSubmit.commsOptIn,
    });

    expect(result.status).toBe("success");
    expect(result.message).toBe("Application updated successfully.");
  });

  it("deleteApplication returns not found when no row", async () => {
    const supabase = mockSessionSupabase();
    supabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: supabase as never,
    });

    const result = await deleteApplication({ id: appId });

    expect(result).toEqual({
      status: "error",
      message: "Application not found.",
    });
  });

  it("updateApplicationInboxStatus updates status", async () => {
    const supabase = mockSessionSupabase();
    supabase.maybeSingle.mockResolvedValue({ data: { id: appId }, error: null });
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: supabase as never,
    });

    const result = await updateApplicationInboxStatus({
      id: appId,
      inboxStatus: "reviewed",
    });

    expect(result.status).toBe("success");
    expect(result.message).toBe("Inbox status updated.");
  });
});
