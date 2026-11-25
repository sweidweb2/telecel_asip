import { describe, expect, it } from "vitest";

import { investorEngagementSchema } from "@/validations/investor-engagement";

const valid = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+233 20 000 0000",
  organization: "Ada Capital",
  jobTitle: "Partner",
  linkedin: "https://linkedin.com/in/ada",
  investorType: "vc" as const,
  stages: ["seed", "series_a"] as const,
  ticketSize: "250k_1m" as const,
  sectors: ["FinTech", "HealthTech"] as const,
  geographies: ["West Africa", "East Africa"] as const,
  engagementIntent: "introductions" as const,
  thesis:
    "We back African founders applying AI to real operating problems in regulated markets.",
  timeline: "this_quarter" as const,
  referredBy: "",
  message: "",
  consent: true,
  commsOptIn: true,
};

describe("investorEngagementSchema", () => {
  it("accepts a complete investor engagement payload", () => {
    expect(investorEngagementSchema.safeParse(valid).success).toBe(true);
  });

  it("requires at least one stage and sector", () => {
    expect(
      investorEngagementSchema.safeParse({ ...valid, stages: [] }).success,
    ).toBe(false);
    expect(
      investorEngagementSchema.safeParse({ ...valid, sectors: [] }).success,
    ).toBe(false);
  });

  it("rejects a short thesis", () => {
    expect(
      investorEngagementSchema.safeParse({
        ...valid,
        thesis: "Too short",
      }).success,
    ).toBe(false);
  });
});
