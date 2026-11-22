import { describe, expect, it } from "vitest";

import {
  createStartupSchema,
  parseActiveStartupFilters,
  parsePortfolioPageParam,
  parseShuffleSeed,
  parseStartupListQuery,
  updateStartupSchema,
} from "@/validations/startup";

const validCore = {
  name: "Acme Health",
  slug: "acme-health",
  description: "A health-tech startup for African clinics.",
  status: "draft" as const,
  foundedAt: "2020-01-15",
};

const emptyDetails = {
  websiteUrl: "",
  industry: "",
  category: "",
  location: "",
  foundingYear: "",
  team: "",
  size: "",
  problem: "",
  solution: "",
  targetMarket: "",
  businessModel: "",
  fundingGoal: "",
  amountRaised: "",
};

const validDetails = {
  websiteUrl: "https://example.com",
  industry: "Health",
  category: "SaaS",
  location: "Lagos, Nigeria",
  foundingYear: 2020,
  team: "Founders and early engineers",
  size: "1-10",
  problem: "Clinics lack digital records.",
  solution: "Lightweight EMR for low-bandwidth clinics.",
  targetMarket: "Private clinics in West Africa",
  businessModel: "SaaS subscription",
  fundingGoal: 500000,
  amountRaised: 120000,
};

describe("createStartupSchema", () => {
  it("accepts core fields with empty details", () => {
    const result = createStartupSchema.safeParse({
      ...validCore,
      details: emptyDetails,
    });
    expect(result.success).toBe(true);
  });

  it("accepts core fields with filled details", () => {
    const result = createStartupSchema.safeParse({
      ...validCore,
      details: validDetails,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createStartupSchema.safeParse({
      ...validCore,
      name: " ",
      details: emptyDetails,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug", () => {
    const result = createStartupSchema.safeParse({
      ...validCore,
      slug: "Bad Slug!",
      details: emptyDetails,
    });
    expect(result.success).toBe(false);
  });

  it("allows empty foundedAt", () => {
    const result = createStartupSchema.safeParse({
      ...validCore,
      foundedAt: "",
      details: emptyDetails,
    });
    expect(result.success).toBe(true);
  });

  it("accepts details after Server Action strips undefined number keys", () => {
    // Client zodResolver turns "" → undefined; RSC omits those keys on the wire.
    const { foundingYear, fundingGoal, amountRaised, ...rest } = emptyDetails;
    void foundingYear;
    void fundingGoal;
    void amountRaised;
    const result = createStartupSchema.safeParse({
      ...validCore,
      details: rest,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateStartupSchema", () => {
  it("requires a uuid id and details", () => {
    const bad = updateStartupSchema.safeParse({
      ...validCore,
      id: "nope",
      details: validDetails,
    });
    expect(bad.success).toBe(false);

    const good = updateStartupSchema.safeParse({
      ...validCore,
      id: "11111111-1111-4111-8111-111111111111",
      details: validDetails,
    });
    expect(good.success).toBe(true);
  });

  it("rejects amount raised above funding goal", () => {
    const result = updateStartupSchema.safeParse({
      ...validCore,
      id: "11111111-1111-4111-8111-111111111111",
      details: {
        ...validDetails,
        fundingGoal: 100,
        amountRaised: 200,
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-http website", () => {
    const result = updateStartupSchema.safeParse({
      ...validCore,
      id: "11111111-1111-4111-8111-111111111111",
      details: { ...validDetails, websiteUrl: "ftp://example.com" },
    });
    expect(result.success).toBe(false);
  });

  it("allows empty optional details", () => {
    const result = updateStartupSchema.safeParse({
      ...validCore,
      id: "11111111-1111-4111-8111-111111111111",
      foundedAt: "",
      details: emptyDetails,
    });
    expect(result.success).toBe(true);
  });
});

describe("parseStartupListQuery", () => {
  it("defaults page and status", () => {
    expect(parseStartupListQuery({})).toEqual({
      page: 1,
      search: "",
      status: "all",
      pageSize: 12,
    });
  });

  it("parses filters", () => {
    expect(
      parseStartupListQuery({
        page: "2",
        search: "acme",
        status: "active",
      }),
    ).toMatchObject({
      page: 2,
      search: "acme",
      status: "active",
    });
  });
});

describe("parsePortfolioPageParam", () => {
  it("clamps invalid values to 1", () => {
    expect(parsePortfolioPageParam(undefined)).toBe(1);
    expect(parsePortfolioPageParam("0")).toBe(1);
    expect(parsePortfolioPageParam("abc")).toBe(1);
  });

  it("parses positive pages", () => {
    expect(parsePortfolioPageParam("3")).toBe(3);
  });
});

describe("parseActiveStartupFilters", () => {
  it("normalizes the public directory filters", () => {
    expect(parseActiveStartupFilters({ cohort: "Cohort 4", country: "gh", sector: "Health", q: "clinic" })).toEqual({
      cohort: "Cohort 4",
      country: "GH",
      sector: "Health",
      query: "clinic",
    });
  });
});

describe("parseShuffleSeed", () => {
  it("accepts a non-negative integer seed", () => {
    expect(parseShuffleSeed("42")).toBe(42);
    expect(parseShuffleSeed(undefined)).toBeNull();
    expect(parseShuffleSeed("-1")).toBeNull();
  });
});
