import { describe, expect, it } from "vitest";

import {
  getAdminPageTitle,
  isAdminNavActive,
} from "@/constants/admin-nav";
import { ROUTES } from "@/constants/routes";

describe("isAdminNavActive", () => {
  it("matches admin home only exactly", () => {
    expect(isAdminNavActive(ROUTES.admin, ROUTES.admin)).toBe(true);
    expect(isAdminNavActive(ROUTES.adminUsers, ROUTES.admin)).toBe(false);
    expect(isAdminNavActive(ROUTES.adminSettings, ROUTES.admin)).toBe(false);
  });

  it("matches nested admin resource paths", () => {
    expect(isAdminNavActive(ROUTES.adminUsers, ROUTES.adminUsers)).toBe(true);
    expect(isAdminNavActive(ROUTES.adminSettings, ROUTES.adminSettings)).toBe(
      true,
    );
    expect(
      isAdminNavActive(`${ROUTES.adminSettings}/nested`, ROUTES.adminSettings),
    ).toBe(true);
    expect(isAdminNavActive(ROUTES.adminBackup, ROUTES.adminSettings)).toBe(
      false,
    );
  });
});

describe("getAdminPageTitle", () => {
  it("returns nav titles for admin routes", () => {
    expect(getAdminPageTitle(ROUTES.admin)).toBe("Overview");
    expect(getAdminPageTitle(ROUTES.adminUsers)).toBe("Users");
    expect(getAdminPageTitle(ROUTES.adminSettings)).toBe("Settings");
    expect(getAdminPageTitle(ROUTES.adminBackup)).toBe("Backup");
    expect(getAdminPageTitle(ROUTES.adminCatalog)).toBe("Catalog");
  });
});
