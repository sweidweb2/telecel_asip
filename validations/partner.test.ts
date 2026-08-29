import { describe, expect, it } from "vitest";

import {
  createPartnerSchema,
  parsePartnerListQuery,
  updatePartnerSchema,
  PARTNER_NAME_MAX,
  PARTNER_PAGE_SIZE,
  PARTNER_SORT_ORDER_MAX,
} from "@/validations/partner";

const base = {
  name: "Accelerator²",
  org: "Telecel",
  type: "corporate" as const,
  contribution: "Pilots and challenge briefs.",
  isActive: true,
  logoPermission: true,
  link: "https://example.com",
  sortOrder: 10,
};

describe("createPartnerSchema", () => {
  it("accepts a complete partner and coerces a string sort order", () => {
    const parsed = createPartnerSchema.parse({ ...base, sortOrder: "25" });
    expect(parsed.sortOrder).toBe(25);
    expect(parsed.name).toBe("Accelerator²");
  });

  it("defaults a blank sort order to 0 and allows optional fields to be empty", () => {
    const parsed = createPartnerSchema.parse({
      name: "Amina Diallo",
      org: "",
      type: "mentors",
      contribution: "",
      isActive: false,
      logoPermission: false,
      link: "",
      sortOrder: "",
    });
    expect(parsed.sortOrder).toBe(0);
    expect(parsed.org).toBe("");
    expect(parsed.link).toBe("");
  });

  it("rejects a short name, an over-long name, and a non-http link", () => {
    expect(createPartnerSchema.safeParse({ ...base, name: "A" }).success).toBe(
      false,
    );
    expect(
      createPartnerSchema.safeParse({
        ...base,
        name: "a".repeat(PARTNER_NAME_MAX + 1),
      }).success,
    ).toBe(false);
    expect(
      createPartnerSchema.safeParse({ ...base, link: "ftp://example.com" })
        .success,
    ).toBe(false);
  });

  it("rejects an unknown partner type and an out-of-range sort order", () => {
    expect(
      createPartnerSchema.safeParse({ ...base, type: "philanthropy" }).success,
    ).toBe(false);
    expect(
      createPartnerSchema.safeParse({ ...base, sortOrder: -1 }).success,
    ).toBe(false);
    expect(
      createPartnerSchema.safeParse({
        ...base,
        sortOrder: PARTNER_SORT_ORDER_MAX + 1,
      }).success,
    ).toBe(false);
  });

  it("rejects a one-character organisation but allows it to be omitted", () => {
    expect(createPartnerSchema.safeParse({ ...base, org: "X" }).success).toBe(
      false,
    );
    const withoutOrg = { ...base, org: undefined };
    expect(createPartnerSchema.safeParse(withoutOrg).success).toBe(true);
  });
});

describe("updatePartnerSchema", () => {
  it("requires a uuid id", () => {
    expect(
      updatePartnerSchema.safeParse({ ...base, id: "not-a-uuid" }).success,
    ).toBe(false);
    expect(
      updatePartnerSchema.safeParse({
        ...base,
        id: "00000000-0000-4000-8000-000000000000",
      }).success,
    ).toBe(true);
  });
});

describe("parsePartnerListQuery", () => {
  it("falls back to defaults when params are missing", () => {
    expect(parsePartnerListQuery({})).toEqual({
      page: 1,
      search: "",
      type: "all",
      status: "all",
      pageSize: PARTNER_PAGE_SIZE,
    });
  });

  it("reads valid params and takes the first value of an array", () => {
    const query = parsePartnerListQuery({
      page: ["3", "9"],
      search: "aws",
      type: "technology",
      status: "historical",
    });
    expect(query).toMatchObject({
      page: 3,
      search: "aws",
      type: "technology",
      status: "historical",
    });
  });

  it("swallows invalid values instead of throwing", () => {
    const query = parsePartnerListQuery({
      page: "-4",
      type: "philanthropy",
      status: "archived",
    });
    expect(query.page).toBe(1);
    expect(query.type).toBe("all");
    expect(query.status).toBe("all");
  });

  it("keeps punctuation and ilike wildcards in the search term", () => {
    for (const search of [
      "Telecel, Inc",
      "AWS (Amazon)",
      "50% growth",
      "a_b",
    ]) {
      expect(parsePartnerListQuery({ search }).search).toBe(search);
    }
  });

  it("trims the search term and drops one over the length limit", () => {
    expect(parsePartnerListQuery({ search: "  aws  " }).search).toBe("aws");
    expect(parsePartnerListQuery({ search: "a".repeat(101) }).search).toBe("");
  });
});
