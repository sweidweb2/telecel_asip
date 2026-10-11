import { describe, expect, it } from "vitest";

import { publicStartupDescription } from "@/lib/marketing/public-startup-description";

describe("publicStartupDescription", () => {
  it("drops the booklet impact block and keeps the company description", () => {
    expect(
      publicStartupDescription(
        "Agrodata installs hives for pollination. Impact Achievements 100% yield improvements",
      ),
    ).toBe("Agrodata installs hives for pollination.");
  });

  it("leaves a description with no impact block unchanged", () => {
    expect(publicStartupDescription("A payments platform for merchants.")).toBe(
      "A payments platform for merchants.",
    );
  });
});
