import { describe, expect, it } from "vitest";

import {
  contactMessageSchema,
  contactMessageSchemaFor,
  deleteContactMessageSchema,
  parseContactMessageListQuery,
  updateContactMessageSchema,
} from "@/validations/contact-message";

const validInput = {
  enquiryType: "partner",
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+233 20 123 4567",
  subject: "Partnership inquiry",
  message:
    "I would like to learn more about partnering with ASIP for the next cohort.",
  turnstileToken: "test-turnstile-token",
};

describe("contactMessageSchema", () => {
  it("accepts a valid message", () => {
    const result = contactMessageSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects an unknown enquiry route", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      enquiryType: "investor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      email: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone with too few digits", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      phone: ".......",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a short message", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      message: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing turnstile token", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      turnstileToken: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/security check/i);
    }
  });

  it("returns french validation messages", () => {
    const result = contactMessageSchemaFor("fr").safeParse({
      ...validInput,
      fullName: "A",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/caractères/i);
    }
  });
});

describe("updateContactMessageSchema / deleteContactMessageSchema", () => {
  const id = "33333333-3333-4333-8333-333333333333";

  it("accepts an admin update without turnstile", () => {
    const { turnstileToken: _t, ...fields } = validInput;
    void _t;
    expect(updateContactMessageSchema.safeParse({ id, ...fields }).success).toBe(
      true,
    );
  });

  it("accepts a delete id", () => {
    expect(deleteContactMessageSchema.safeParse({ id }).success).toBe(true);
  });
});

describe("parseContactMessageListQuery", () => {
  it("accepts a plain search term", () => {
    const query = parseContactMessageListQuery({ search: "ada" });
    expect(query.search).toBe("ada");
  });

  it("keeps dots so email search works", () => {
    const query = parseContactMessageListQuery({ search: "ada@x.com" });
    expect(query.search).toBe("ada@x.com");
  });

  it("clears search containing PostgREST filter metacharacters", () => {
    expect(parseContactMessageListQuery({ search: "a%b" }).search).toBe("");
    expect(parseContactMessageListQuery({ search: "a_b" }).search).toBe("");
  });

  it("keeps a known enquiry route and falls back to all otherwise", () => {
    expect(parseContactMessageListQuery({ enquiryType: "media" }).enquiryType)
      .toBe("media");
    expect(parseContactMessageListQuery({ enquiryType: "nope" }).enquiryType)
      .toBe("all");
    expect(parseContactMessageListQuery({}).enquiryType).toBe("all");
  });

  it("defaults inbox filter to inbox", () => {
    expect(parseContactMessageListQuery({}).inboxStatus).toBe("inbox");
    expect(
      parseContactMessageListQuery({ inboxStatus: "archived" }).inboxStatus,
    ).toBe("archived");
  });
});
