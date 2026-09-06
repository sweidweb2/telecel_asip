import { describe, expect, it } from "vitest";

import { updateSiteSettingsSchema } from "@/validations/settings";

describe("updateSiteSettingsSchema", () => {
  it("accepts boolean flags", () => {
    const result = updateSiteSettingsSchema.safeParse({
      openApplications: true,
      newsletterSignupEnabled: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-booleans", () => {
    const result = updateSiteSettingsSchema.safeParse({
      openApplications: "true",
      newsletterSignupEnabled: 1,
    });
    expect(result.success).toBe(false);
  });
});
