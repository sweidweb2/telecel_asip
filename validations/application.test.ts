import { describe, expect, it } from "vitest";

import {
  applicationSchema,
  applicationSchemaFor,
  deleteApplicationSchema,
  parseApplicationListQuery,
  toUpdateApplicationInput,
  updateApplicationSchema,
} from "@/validations/application";

const validInput = {
  fullName: "Ada Lovelace",
  founderRole: "Founder & CEO",
  email: "ada@example.com",
  phone: "+233 20 123 4567",
  country: "Ghana",
  linkedin: "https://linkedin.com/in/ada",
  companyName: "Analytical Engines",
  website: "https://analyticalengines.example",
  companyCountry: "Ghana",
  sector: "Fintech",
  problemProduct:
    "African SMEs lack working capital. We build a mobile-first credit platform that underwrites inventory loans in days, not months.",
  traction:
    "120 active merchants, $40k GMV last quarter, one bank pilot live.",
  programmeFit:
    "We need market access and investor intros to expand beyond Accra.",
  commsOptIn: true,
  consent: true as const,
};

describe("applicationSchema", () => {
  it("accepts a valid application", () => {
    const result = applicationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts optional LinkedIn and website", () => {
    const withoutUrls = applicationSchema.safeParse({
      ...validInput,
      linkedin: "",
      website: "",
    });
    expect(withoutUrls.success).toBe(true);

    const withUrls = applicationSchema.safeParse(validInput);
    expect(withUrls.success).toBe(true);
  });

  it("rejects invalid LinkedIn or website URLs when provided", () => {
    const badLinkedin = applicationSchema.safeParse({
      ...validInput,
      linkedin: "not-a-url",
    });
    const badWebsite = applicationSchema.safeParse({
      ...validInput,
      website: "ftp://example.com",
    });
    expect(badLinkedin.success).toBe(false);
    expect(badWebsite.success).toBe(false);
  });

  it("requires apply-only sections", () => {
    const result = applicationSchema.safeParse({
      ...validInput,
      problemProduct: "short",
      traction: "x",
      programmeFit: "y",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases and trims email", () => {
    const result = applicationSchema.safeParse({
      ...validInput,
      email: "  Ada@Example.COM  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("ada@example.com");
    }
  });

  it("rejects missing consent", () => {
    const result = applicationSchema.safeParse({
      ...validInput,
      consent: false,
    });
    expect(result.success).toBe(false);
  });

  it("returns french validation messages", () => {
    const result = applicationSchemaFor("fr").safeParse({
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

describe("toUpdateApplicationInput", () => {
  it("maps DB nullables to empty strings for optional URL fields", () => {
    const mapped = toUpdateApplicationInput({
      id: "11111111-1111-4111-8111-111111111111",
      full_name: "Ama Mensah",
      founder_role: "Founder",
      email: "ama@example.com",
      phone: "+233200000000",
      country: "Ghana",
      linkedin: null,
      company_name: "Example",
      website: null,
      company_country: "Ghana",
      sector: "Fintech",
      problem_product: "x".repeat(40),
      traction: "y".repeat(20),
      programme_fit: "z".repeat(20),
      consent: true,
      comms_opt_in: true,
      user_id: null,
      inbox_status: "unread",
      created_at: "2026-01-01T00:00:00Z",
    });
    expect(mapped.linkedin).toBe("");
    expect(mapped.website).toBe("");
    expect(mapped.fullName).toBe("Ama Mensah");
    expect(mapped.commsOptIn).toBe(true);
  });
});

describe("updateApplicationSchema / deleteApplicationSchema", () => {
  const id = "11111111-1111-4111-8111-111111111111";

  it("accepts an admin update without consent", () => {
    const { consent: _c, ...fields } = validInput;
    void _c;
    const result = updateApplicationSchema.safeParse({ id, ...fields });
    expect(result.success).toBe(true);
  });

  it("accepts a delete id", () => {
    expect(deleteApplicationSchema.safeParse({ id }).success).toBe(true);
    expect(deleteApplicationSchema.safeParse({ id: "bad" }).success).toBe(
      false,
    );
  });
});

describe("parseApplicationListQuery", () => {
  it("accepts a plain search term", () => {
    const query = parseApplicationListQuery({ search: "ada" });
    expect(query.search).toBe("ada");
  });

  it("clears search containing a dot", () => {
    const query = parseApplicationListQuery({ search: "a.b" });
    expect(query.search).toBe("");
  });

  it("defaults inbox filter to inbox and accepts unread", () => {
    expect(parseApplicationListQuery({}).inboxStatus).toBe("inbox");
    expect(parseApplicationListQuery({ inboxStatus: "unread" }).inboxStatus).toBe(
      "unread",
    );
  });
});
