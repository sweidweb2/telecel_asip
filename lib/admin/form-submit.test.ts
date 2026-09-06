import { describe, expect, it } from "vitest";

import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";

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
