import { describe, expect, it } from "vitest";

import { UNSAVED_CHANGES_MESSAGE } from "@/hooks/use-unsaved-changes-guard";

describe("UNSAVED_CHANGES_MESSAGE", () => {
  it("matches the staff leave-confirm copy", () => {
    expect(UNSAVED_CHANGES_MESSAGE).toBe(
      "You have unsaved changes. Leave this page?",
    );
  });
});
