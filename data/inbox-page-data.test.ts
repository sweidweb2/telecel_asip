import { beforeEach, describe, expect, it, vi } from "vitest";

const checkStaffRole = vi.fn();
const range = vi.fn();
const or = vi.fn(() => ({ range }));
const eqStatus = vi.fn();
const orderId = vi.fn();
const orderCreated = vi.fn();
const maybeSingle = vi.fn();

function wireChain() {
  eqStatus.mockImplementation(() => ({
    or,
    range,
    order: orderCreated,
    maybeSingle,
  }));
  orderId.mockImplementation(() => ({ range, or, eq: eqStatus }));
  orderCreated.mockImplementation(() => ({
    order: orderId,
    range,
    or,
    eq: eqStatus,
  }));
}

wireChain();

function makeSelectChain() {
  return {
    order: orderCreated,
    eq: eqStatus,
    or,
    range,
  };
}

const select = vi.fn(() => makeSelectChain());
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/admin/current-user-role", () => ({
  checkStaffRole: (...args: unknown[]) => checkStaffRole(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

vi.mock("@/data/inbox-stats", () => ({
  fetchInboxTableStats: vi.fn(async () => ({
    total: 1,
    unread: 1,
    reviewed: 0,
    last7Days: 1,
  })),
}));

vi.mock("@/lib/admin/apply-inbox-status-filter", () => ({
  applyInboxStatusFilter: <T>(request: T) => request,
}));

import { getApplicationById, getApplicationsPageData } from "@/data/applications";
import { getInterestRegistrationById, getInterestRegistrationsPageData } from "@/data/interest-registrations";
import { getContactMessageById, getContactMessagesPageData } from "@/data/contact-messages";

const baseQuery = {
  page: 1,
  pageSize: 10 as const,
  search: "",
  inboxStatus: "inbox" as const,
};

describe("inbox page data loaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    wireChain();
    select.mockImplementation(() => makeSelectChain());
  });

  it("returns forbidden for applications when not admin", async () => {
    checkStaffRole.mockResolvedValue(false);
    range.mockResolvedValue({ data: [], error: null, count: 0 });

    const result = await getApplicationsPageData(baseQuery);
    expect(result.status).toBe("forbidden");
  });

  it("returns applications list for admins", async () => {
    checkStaffRole.mockResolvedValue(true);
    range.mockResolvedValue({
      data: [
        {
          id: "a1",
          full_name: "Ada",
          email: "ada@example.com",
          inbox_status: "unread",
        },
      ],
      error: null,
      count: 1,
    });

    const result = await getApplicationsPageData(baseQuery);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.list.total).toBe(1);
    expect(result.list.applications[0]?.full_name).toBe("Ada");
    expect(result.stats.unread).toBe(1);
  });

  it("returns interest registrations for admins", async () => {
    checkStaffRole.mockResolvedValue(true);
    range.mockResolvedValue({
      data: [{ id: "r1", full_name: "Bo", email: "bo@example.com" }],
      error: null,
      count: 1,
    });

    const result = await getInterestRegistrationsPageData(baseQuery);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.list.registrations[0]?.full_name).toBe("Bo");
  });

  it("returns contact messages for admins", async () => {
    checkStaffRole.mockResolvedValue(true);
    range.mockResolvedValue({
      data: [
        {
          id: "c1",
          full_name: "Cy",
          email: "cy@example.com",
          enquiry_type: "general",
        },
      ],
      error: null,
      count: 1,
    });

    const result = await getContactMessagesPageData({
      ...baseQuery,
      enquiryType: "all",
    });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.list.messages[0]?.full_name).toBe("Cy");
  });

  it("loads a full application by id for the shared dialog", async () => {
    checkStaffRole.mockResolvedValue(true);
    maybeSingle.mockResolvedValue({
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        problem_product: "essay",
        traction: "users",
        programme_fit: "fit",
      },
      error: null,
    });

    const result = await getApplicationById(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.record.problem_product).toBe("essay");
  });

  it("returns not_found for an invalid application id", async () => {
    const result = await getApplicationById("not-a-uuid");
    expect(result).toEqual({ status: "not_found" });
    expect(from).not.toHaveBeenCalled();
  });

  it("loads registration and contact details by id", async () => {
    checkStaffRole.mockResolvedValue(true);
    maybeSingle
      .mockResolvedValueOnce({
        data: { id: "11111111-1111-4111-8111-111111111111", pitch: "hello" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "11111111-1111-4111-8111-111111111111", message: "body" },
        error: null,
      });

    const registration = await getInterestRegistrationById(
      "11111111-1111-4111-8111-111111111111",
    );
    const message = await getContactMessageById(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(registration.status).toBe("ok");
    expect(message.status).toBe("ok");
    if (registration.status === "ok") {
      expect(registration.record.pitch).toBe("hello");
    }
    if (message.status === "ok") {
      expect(message.record.message).toBe("body");
    }
  });
});
