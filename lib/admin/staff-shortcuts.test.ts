import { describe, expect, it } from "vitest";

import { ROUTES } from "@/constants/routes";
import {
  isTypingTarget,
  staffNewItemHref,
} from "@/lib/admin/staff-shortcuts";

describe("staffNewItemHref", () => {
  it("maps list and detail paths to create routes", () => {
    expect(staffNewItemHref(ROUTES.blogs)).toBe(ROUTES.blogsNew);
    expect(staffNewItemHref(`${ROUTES.blogs}/abc`)).toBe(ROUTES.blogsNew);
    expect(staffNewItemHref(ROUTES.portfolio)).toBe(ROUTES.portfolioNew);
    expect(staffNewItemHref(`${ROUTES.partners}/x`)).toBe(ROUTES.partnersNew);
  });

  it("returns null when there is no create route", () => {
    expect(staffNewItemHref(ROUTES.dashboard)).toBeNull();
    expect(staffNewItemHref(ROUTES.users)).toBeNull();
    expect(staffNewItemHref(ROUTES.adminUsers)).toBeNull();
  });
});

describe("isTypingTarget", () => {
  it("detects form fields", () => {
    const input = document.createElement("input");
    const div = document.createElement("div");
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(div)).toBe(false);
  });
});
