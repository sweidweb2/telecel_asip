import { describe, expect, it } from "vitest";

import {
  deleteInterestRegistrationSchema,
  interestRegistrationSchema,
  interestRegistrationSchemaFor,
  parseInterestRegistrationListQuery,
  updateInterestRegistrationSchema,
} from "@/validations/interest-registration";

const validInput = {
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

describe("interestRegistrationSchema", () => {
  it("accepts a valid registration without LinkedIn or website", () => {
    const result = interestRegistrationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts optional LinkedIn and website URLs", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      linkedin: "https://linkedin.com/in/ada",
      website: "https://analyticalengines.example",
    });
    expect(result.success).toBe(true);
  });

  it("lowercases and trims email", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      email: "  Ada@Example.COM  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      phone: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone with too few digits", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      phone: ".......",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short pitch when provided", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      pitch: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing consent", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      consent: false,
    });
    expect(result.success).toBe(false);
  });

  it("returns french validation messages", () => {
    const result = interestRegistrationSchemaFor("fr").safeParse({
      ...validInput,
      fullName: "A",
      consent: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/caractères|accepter/i);
    }
  });
});

describe("updateInterestRegistrationSchema / deleteInterestRegistrationSchema", () => {
  const id = "22222222-2222-4222-8222-222222222222";

  it("accepts an admin update without consent", () => {
    const { consent: _c, ...fields } = validInput;
    void _c;
    expect(
      updateInterestRegistrationSchema.safeParse({ id, ...fields }).success,
    ).toBe(true);
  });

  it("accepts a delete id", () => {
    expect(deleteInterestRegistrationSchema.safeParse({ id }).success).toBe(
      true,
    );
  });
});

describe("parseInterestRegistrationListQuery", () => {
  it("accepts a plain search term", () => {
    const query = parseInterestRegistrationListQuery({ search: "ada" });
    expect(query.search).toBe("ada");
  });

  it("clears search containing a dot", () => {
    const query = parseInterestRegistrationListQuery({ search: "a.b" });
    expect(query.search).toBe("");
  });
});
