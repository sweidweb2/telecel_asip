import { describe, expect, it } from "vitest";

import {
  interestRegistrationSchema,
  interestRegistrationSchemaFor,
  parseInterestRegistrationListQuery,
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
  turnstileToken: "test-turnstile-token",
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

  it("rejects a missing turnstile token", () => {
    const result = interestRegistrationSchema.safeParse({
      ...validInput,
      turnstileToken: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/security check/i);
    }
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
