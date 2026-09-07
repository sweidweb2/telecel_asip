import { describe, expect, it } from "vitest";

import { newsletterSubscribeSchema } from "@/validations/newsletter";

describe("newsletterSubscribeSchema", () => {
  it("accepts a valid subscribe payload", () => {
    const result = newsletterSubscribeSchema.safeParse({
      email: "ada@example.com",
      consent: true,
      sourcePage: "/en/insights",
      turnstileToken: "token",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing consent", () => {
    const result = newsletterSubscribeSchema.safeParse({
      email: "ada@example.com",
      consent: false,
      turnstileToken: "token",
    });
    expect(result.success).toBe(false);
  });
});
