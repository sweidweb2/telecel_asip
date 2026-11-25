import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/validations/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "asweid657@gmail.com",
      password: "ali@1234",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "ali@1234",
    });

    expect(result.success).toBe(false);
  });

  it("maps undefined fields to friendly messages instead of Zod type noise", () => {
    const result = loginSchema.safeParse({
      email: undefined,
      password: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      for (const issue of result.error.issues) {
        expect(issue.message.toLowerCase()).not.toContain("expected string");
        expect(issue.message.toLowerCase()).not.toContain("received undefined");
      }
    }
  });
});

describe("registerSchema", () => {
  it("accepts matching passwords that meet strength rules", () => {
    const result = registerSchema.safeParse({
      fullName: "ASIP Admin",
      email: "dev@example.com",
      password: "ali@1234",
      confirmPassword: "ali@1234",
      type: "startup",
    });

    expect(result.success).toBe(true);
  });

  it("accepts investor account type", () => {
    const result = registerSchema.safeParse({
      fullName: "ASIP Investor",
      email: "investor@example.com",
      password: "ali@1234",
      confirmPassword: "ali@1234",
      type: "investor",
    });

    expect(result.success).toBe(true);
  });

  it("rejects admin as a public account type", () => {
    const result = registerSchema.safeParse({
      fullName: "ASIP Admin",
      email: "dev@example.com",
      password: "ali@1234",
      confirmPassword: "ali@1234",
      type: "admin",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "ASIP Admin",
      email: "dev@example.com",
      password: "ali@1234",
      confirmPassword: "ali@9999",
      type: "startup",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a weak password", () => {
    const result = registerSchema.safeParse({
      fullName: "ASIP Admin",
      email: "dev@example.com",
      password: "short",
      confirmPassword: "short",
      type: "startup",
    });

    expect(result.success).toBe(false);
  });

  it("returns french validation messages", async () => {
    const { registerSchemaFor } = await import("@/validations/auth");
    const result = registerSchemaFor("fr").safeParse({
      fullName: "A",
      email: "bad",
      password: "short",
      confirmPassword: "other",
      type: "startup",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/caractères|valide|lettre/i);
    }
  });
});
