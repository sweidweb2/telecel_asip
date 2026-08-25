import { describe, expect, it } from "vitest";

import {
  interestRegistrationSchema,
  interestRegistrationSchemaFor,
} from "@/validations/interest-registration";

const validInput = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+233 20 123 4567",
  companyName: "Analytical Engines",
  sector: "Fintech",
  country: "Ghana",
  pitch:
    "We help African SMEs access working capital through a mobile-first credit platform.",
  consent: true as const,
};

describe("interestRegistrationSchema", () => {
  it("accepts a valid registration", () => {
    const result = interestRegistrationSchema.safeParse(validInput);
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

  it("rejects a short pitch", () => {
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
