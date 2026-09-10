import { beforeEach, describe, expect, it, vi } from "vitest";

const isCurrentUserEditor = vi.fn();
const range = vi.fn();
const or = vi.fn(() => ({ range }));
const eqStatus = vi.fn();
const orderId = vi.fn();
const orderCreated = vi.fn();

function wireChain() {
  eqStatus.mockImplementation(() => ({ or, range, order: orderCreated }));
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

vi.mock("@/lib/admin/is-current-user-editor", () => ({
  isCurrentUserEditor: (...args: unknown[]) => isCurrentUserEditor(...args),
}));

vi.mock("@/lib/admin/perf", () => ({
  traceAsync: (_name: string, _attrs: unknown, fn: () => unknown) => fn(),
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

import { getApplicationsPageData } from "@/data/applications";
import { getInterestRegistrationsPageData } from "@/data/interest-registrations";
import { getContactMessagesPageData } from "@/data/contact-messages";

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
    isCurrentUserEditor.mockResolvedValue(false);
    range.mockResolvedValue({ data: [], error: null, count: 0 });

    const result = await getApplicationsPageData(baseQuery);
    expect(result.status).toBe("forbidden");
  });

  it("returns applications list for admins", async () => {
    isCurrentUserEditor.mockResolvedValue(true);
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
    isCurrentUserEditor.mockResolvedValue(true);
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
    isCurrentUserEditor.mockResolvedValue(true);
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
});
