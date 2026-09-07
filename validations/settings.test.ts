import { describe, expect, it } from "vitest";

import { updateSiteSettingsSchema } from "@/validations/settings";

describe("updateSiteSettingsSchema", () => {
  it("accepts boolean flags and backup schedule", () => {
    const result = updateSiteSettingsSchema.safeParse({
      openApplications: true,
      newsletterSignupEnabled: false,
      backupTime: "daily_03",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-booleans", () => {
    const result = updateSiteSettingsSchema.safeParse({
      openApplications: "true",
      newsletterSignupEnabled: 1,
      backupTime: "daily_03",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown backup_time values including now", () => {
    expect(
      updateSiteSettingsSchema.safeParse({
        openApplications: true,
        newsletterSignupEnabled: false,
        backupTime: "now",
      }).success,
    ).toBe(false);
    expect(
      updateSiteSettingsSchema.safeParse({
        openApplications: true,
        newsletterSignupEnabled: false,
        backupTime: "daily_99",
      }).success,
    ).toBe(false);
  });

  it("requires backupTime", () => {
    expect(
      updateSiteSettingsSchema.safeParse({
        openApplications: true,
        newsletterSignupEnabled: false,
      }).success,
    ).toBe(false);
  });
});
