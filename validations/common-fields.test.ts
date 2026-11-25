import {
  describe,
  expect,
  it } from "vitest";

import {
  optionalHttpUrl,
  optionalMinLengthString,
  optionalPhone,
  requiredConsent,
  requiredPhone,
  trimmedEmail,
} from "@/validations/common-fields";

describe("common-fields", () => {
  it("accepts a valid required phone and rejects short values", () => {
    expect(requiredPhone("bad").safeParse("+233 20 000 0000").success).toBe(
      true,
    );
    expect(requiredPhone("bad").safeParse("123").success).toBe(false);
  });

  it("allows empty optional phone but validates when set", () => {
    expect(optionalPhone("bad").safeParse("").success).toBe(true);
    expect(optionalPhone("bad").safeParse("+233 20 000 0000").success).toBe(
      true,
    );
    expect(optionalPhone("bad").safeParse("abc").success).toBe(false);
  });

  it("rejects phones longer than the DB 20-char window", () => {
    // Former regex allowed optional + plus 20 chars (21 total).
    const tooLong = "+12345678901234567890";
    expect(tooLong.length).toBe(21);
    expect(requiredPhone("bad").safeParse(tooLong).success).toBe(false);
    expect(optionalPhone("bad").safeParse(tooLong).success).toBe(false);
  });

  it("validates optional http URLs", () => {
    const schema = optionalHttpUrl("bad");
    expect(schema.safeParse("").success).toBe(true);
    expect(schema.safeParse("https://example.com").success).toBe(true);
    expect(schema.safeParse("example.com").success).toBe(false);
  });

  it("normalizes email case", () => {
    const parsed = trimmedEmail("bad").safeParse("  Name@Example.COM ");
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toBe("name@example.com");
  });

  it("requires consent true", () => {
    expect(requiredConsent("need").safeParse(true).success).toBe(true);
    expect(requiredConsent("need").safeParse(false).success).toBe(false);
  });

  it("enforces optional min length when non-empty", () => {
    const schema = optionalMinLengthString(20, 100, "min", "max");
    expect(schema.safeParse("").success).toBe(true);
    expect(schema.safeParse("short").success).toBe(false);
    expect(schema.safeParse("x".repeat(20)).success).toBe(true);
  });
});
