import { describe, expect, it } from "vitest";

import { UNSAVED_CHANGES_MESSAGE } from "@/components/dashboard/unsaved-changes-guard";

describe("UNSAVED_CHANGES_MESSAGE", () => {
  it("matches the staff leave-confirm copy", () => {
    expect(UNSAVED_CHANGES_MESSAGE).toBe(
      "You have unsaved changes. If you leave now, they will be lost.",
    );
  });
});
