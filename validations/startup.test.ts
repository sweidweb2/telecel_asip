import { describe, expect, it } from "vitest";

import {
  createStartupSchema,
  parsePortfolioPageParam,
  parseStartupListQuery,
  updateStartupSchema,
} from "@/validations/startup";

const validBase = {
  name: "Acme Health",
  slug: "acme-health",
  description: "A health-tech startup for African clinics.",
  status: "draft" as const,
  foundedAt: "2020-01-15",
  details: {
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
  },
};

describe("createStartupSchema", () => {
  it("accepts a valid startup payload", () => {
    const result = createStartupSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createStartupSchema.safeParse({ ...validBase, name: " " });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug", () => {
    const result = createStartupSchema.safeParse({
      ...validBase,
      slug: "Bad Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects amount raised above funding goal", () => {
    const result = createStartupSchema.safeParse({
      ...validBase,
      details: {
        ...validBase.details,
        fundingGoal: 100,
        amountRaised: 200,
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-http website", () => {
    const result = createStartupSchema.safeParse({
      ...validBase,
      details: { ...validBase.details, websiteUrl: "ftp://example.com" },
    });
    expect(result.success).toBe(false);
  });

  it("allows empty optional details", () => {
    const result = createStartupSchema.safeParse({
      ...validBase,
      foundedAt: "",
      details: {
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
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.foundedAt === "" || result.data.foundedAt === undefined).toBe(
        true,
      );
      expect(
        result.data.details.fundingGoal === undefined ||
          result.data.details.fundingGoal === null,
      ).toBe(true);
    }
  });
});

describe("updateStartupSchema", () => {
  it("requires a uuid id", () => {
    const bad = updateStartupSchema.safeParse({ ...validBase, id: "nope" });
    expect(bad.success).toBe(false);

    const good = updateStartupSchema.safeParse({
      ...validBase,
      id: "11111111-1111-4111-8111-111111111111",
    });
    expect(good.success).toBe(true);
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
