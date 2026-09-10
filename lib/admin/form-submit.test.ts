import { describe, expect, it } from "vitest";

import {
  firstInvalidEditorStep,
  isAdminFormSubmitDisabled,
} from "@/lib/admin/form-submit";

describe("isAdminFormSubmitDisabled", () => {
  it("disables when pristine with no external changes", () => {
    expect(
      isAdminFormSubmitDisabled({
        isPending: false,
        isDirty: false,
        errors: {},
      }),
    ).toBe(true);
  });

  it("enables when dirty and error-free", () => {
    expect(
      isAdminFormSubmitDisabled({
        isPending: false,
        isDirty: true,
        errors: {},
      }),
    ).toBe(false);
  });

  it("enables when a pending image is selected even if fields are pristine", () => {
    expect(
      isAdminFormSubmitDisabled({
        isPending: false,
        isDirty: false,
        errors: {},
        hasExternalChanges: true,
      }),
    ).toBe(false);
  });

  it("stays disabled when there are field errors", () => {
    expect(
      isAdminFormSubmitDisabled({
        isPending: false,
        isDirty: true,
        errors: { name: { type: "required", message: "Required" } },
        hasExternalChanges: true,
      }),
    ).toBe(true);
  });

  it("stays disabled while pending", () => {
    expect(
      isAdminFormSubmitDisabled({
        isPending: true,
        isDirty: true,
        errors: {},
        hasExternalChanges: true,
      }),
    ).toBe(true);
  });
});

const EDITOR_STEPS = [
  { id: "core", fields: ["name", "slug"] },
  { id: "profile", fields: ["details.cohort", "details.featured"] },
  { id: "details", fields: ["details.websiteUrl", "details.industry"] },
] as const;

describe("firstInvalidEditorStep", () => {
  it("returns undefined when there are no errors", () => {
    expect(firstInvalidEditorStep({}, EDITOR_STEPS)).toBeUndefined();
  });

  it("returns the first step that owns an error path", () => {
    expect(
      firstInvalidEditorStep(
        { details: { industry: { type: "too_small", message: "Required" } } },
        EDITOR_STEPS,
      ),
    ).toBe("details");
  });

  it("prefers an earlier step when several have errors", () => {
    expect(
      firstInvalidEditorStep(
        {
          slug: { type: "too_small", message: "Required" },
          details: { industry: { type: "too_small", message: "Required" } },
        },
        EDITOR_STEPS,
      ),
    ).toBe("core");
  });

  it("falls back to the first step when errors are unmapped", () => {
    expect(
      firstInvalidEditorStep(
        { unknown: { type: "custom", message: "Nope" } },
        EDITOR_STEPS,
      ),
    ).toBe("core");
  });
});
