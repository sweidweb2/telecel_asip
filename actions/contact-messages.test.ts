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
  TURNSTILE_CONTACT_ACTION: "contact",
  verifyTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeSharedRateLimit: vi.fn(async () => true),
}));

vi.mock("@/lib/admin/authorize-editor", () => ({
  authorizeEditor: vi.fn(),
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
  deleteContactMessage,
  submitContactMessage,
  updateContactMessage,
  updateContactMessageInboxStatus,
} from "@/actions/contact-messages";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { consumeSharedRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const validSubmit = {
  enquiryType: "partner" as const,
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+233 20 123 4567",
  subject: "Partnership inquiry",
  message:
    "I would like to learn more about partnering with ASIP for the next cohort.",
  turnstileToken: "test-turnstile-token",
};

const messageId = "33333333-3333-4333-8333-333333333333";

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

describe("submitContactMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
  });

  it("rejects invalid payloads before Turnstile", async () => {
    const result = await submitContactMessage({
      ...validSubmit,
      message: "short",
    });

    expect(result.status).toBe("error");
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
  });

  it("rejects when Turnstile fails", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);

    const result = await submitContactMessage(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Security check failed. Please try again.",
    });
  });

  it("rejects when rate limited", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(false);

    const result = await submitContactMessage(validSubmit);

    expect(result).toEqual({
      status: "error",
      message: "Too many submissions. Please wait and try again later.",
    });
  });

  it("inserts on success", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);

    const result = await submitContactMessage(validSubmit);

    expect(result.status).toBe("success");
    expect(insertMock).toHaveBeenCalledWith({
      enquiry_type: "partner",
      full_name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+233 20 123 4567",
      subject: "Partnership inquiry",
      message: validSubmit.message,
    });
    expect(consumeSharedRateLimit).toHaveBeenCalled();
  });
});

describe("contact message admin mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when authorizeEditor fails", async () => {
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage contact messages.",
    });

    const result = await updateContactMessage({
      id: messageId,
      enquiryType: "partner",
      fullName: validSubmit.fullName,
      email: validSubmit.email,
      phone: validSubmit.phone,
      subject: validSubmit.subject,
      message: validSubmit.message,
    });

    expect(result.status).toBe("error");
  });

  it("updates, deletes, and changes inbox status", async () => {
    const supabase = mockSessionSupabase();
    supabase.maybeSingle.mockResolvedValue({
      data: { id: messageId },
      error: null,
    });
    vi.mocked(authorizeEditor).mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: supabase as never,
    });

    expect(
      (
        await updateContactMessage({
          id: messageId,
          enquiryType: "partner",
          fullName: validSubmit.fullName,
          email: validSubmit.email,
          phone: validSubmit.phone,
          subject: `${validSubmit.subject} edited`,
          message: validSubmit.message,
        })
      ).status,
    ).toBe("success");

    expect((await deleteContactMessage({ id: messageId })).status).toBe(
      "success",
    );

    expect(
      (
        await updateContactMessageInboxStatus({
          id: messageId,
          inboxStatus: "reviewed",
        })
      ).status,
    ).toBe("success");
  });
});
