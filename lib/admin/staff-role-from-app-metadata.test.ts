import { describe, expect, it } from "vitest";

import { staffRoleFromAppMetadata } from "@/lib/admin/staff-role-from-app-metadata";

describe("staffRoleFromAppMetadata", () => {
  it("reads admin, editor, and viewer", () => {
    expect(staffRoleFromAppMetadata({ app_role: "admin" })).toBe("admin");
    expect(staffRoleFromAppMetadata({ app_role: "editor" })).toBe("editor");
    expect(staffRoleFromAppMetadata({ app_role: "viewer" })).toBe("viewer");
  });

  it("returns null when the claim is missing or unknown", () => {
    expect(staffRoleFromAppMetadata(null)).toBeNull();
    expect(staffRoleFromAppMetadata(undefined)).toBeNull();
    expect(staffRoleFromAppMetadata({})).toBeNull();
    expect(staffRoleFromAppMetadata({ app_role: "owner" })).toBeNull();
    expect(staffRoleFromAppMetadata({ app_role: 1 })).toBeNull();
  });
});
