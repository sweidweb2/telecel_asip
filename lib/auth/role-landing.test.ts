import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  isPathAllowedForRole,
  resolvePostAuthRedirect,
  roleHomePath,
} from "@/lib/auth/role-landing";

describe("roleHomePath", () => {
  it("routes each role to its shell or marketing home", () => {
    expect(roleHomePath("admin", "en")).toBe(ROUTES.admin);
    expect(roleHomePath("editor", "en")).toBe(ROUTES.dashboard);
    expect(roleHomePath("viewer", "en")).toBe("/en");
    expect(roleHomePath(null, "fr")).toBe("/fr");
  });
});

describe("isPathAllowedForRole", () => {
  it("keeps admins on /admin and editors on /dashboard", () => {
    expect(isPathAllowedForRole("/admin/users", "admin")).toBe(true);
    expect(isPathAllowedForRole("/dashboard", "admin")).toBe(false);
    expect(isPathAllowedForRole("/dashboard/blogs", "editor")).toBe(true);
    expect(isPathAllowedForRole("/admin", "editor")).toBe(false);
    expect(isPathAllowedForRole("/en/apply", "viewer")).toBe(true);
    expect(isPathAllowedForRole("/dashboard", "viewer")).toBe(false);
  });
});

describe("resolvePostAuthRedirect", () => {
  it("prefers a safe allowed next path", () => {
    expect(
      resolvePostAuthRedirect({
        next: "/dashboard/users",
        role: "editor",
        locale: "en",
      }),
    ).toBe("/dashboard/users");
  });

  it("rejects cross-shell next and falls back to role home", () => {
    expect(
      resolvePostAuthRedirect({
        next: "/admin/users",
        role: "editor",
        locale: "en",
      }),
    ).toBe(ROUTES.dashboard);
    expect(
      resolvePostAuthRedirect({
        next: "/dashboard",
        role: "admin",
        locale: "en",
      }),
    ).toBe(ROUTES.admin);
  });
});
