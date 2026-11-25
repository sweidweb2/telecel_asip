import { describe, expect, it } from "vitest";

import { investorInterestSchema } from "@/validations/investor-interest";

const valid = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "",
  organization: "Ada Capital",
  jobTitle: "",
  linkedin: "",
  investorType: "angel" as const,
  focusNote: "",
  consent: true,
  commsOptIn: false,
};

describe("investorInterestSchema", () => {
  it("accepts a minimal investor interest payload", () => {
    expect(investorInterestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing consent", () => {
    expect(
      investorInterestSchema.safeParse({ ...valid, consent: false }).success,
    ).toBe(false);
  });

  it("rejects admin as investor type", () => {
    expect(
      investorInterestSchema.safeParse({
        ...valid,
        investorType: "admin",
      }).success,
    ).toBe(false);
  });
});
