import { describe, expect, it } from "vitest";

import { mapPgActionError } from "@/lib/admin/pg-action-error";

const base = {
  unauthorized: "unauthorized",
  notFound: "not found",
  genericError: "generic",
} as const;

describe("mapPgActionError", () => {
  it("maps auth and not-found codes", () => {
    expect(mapPgActionError({ code: "42501" }, base)).toBe("unauthorized");
    expect(mapPgActionError({ code: "PGRST116" }, base)).toBe("not found");
    expect(mapPgActionError({ code: "P0002" }, base)).toBe("not found");
  });

  it("maps FK write vs delete when overrides are set", () => {
    const messages = {
      ...base,
      foreignKeyWrite: "bad owner",
      foreignKeyDelete: "in use",
    };
    expect(mapPgActionError({ code: "23503" }, messages, "write")).toBe(
      "bad owner",
    );
    expect(mapPgActionError({ code: "23503" }, messages, "delete")).toBe(
      "in use",
    );
  });

  it("maps unique violations", () => {
    const messages = {
      ...base,
      uniqueViolation: "label taken",
      uniqueConstraint: "cohorts_year_public_label",
    };
    expect(
      mapPgActionError(
        { code: "23505", message: "cohorts_year_public_label_uidx" },
        messages,
      ),
    ).toBe("label taken");
    expect(
      mapPgActionError(
        { code: "23505", message: "cohort_partners_pkey" },
        messages,
      ),
    ).toBe("generic");
  });
});
