import { describe, expect, it } from "vitest";

import {
  createUserSchema,
  parseUserListQuery,
  updateUserSchema,
} from "@/validations/users";

describe("users validation", () => {
  it("accepts a valid create payload and normalizes its email", () => {
    const result = createUserSchema.parse({
      fullName: "Ada Lovelace",
      email: "ADA@EXAMPLE.COM",
      password: "Password1",
      role: "editor",
    });

    expect(result.email).toBe("ada@example.com");
  });

  it("rejects unsupported roles and weak passwords", () => {
    expect(
      createUserSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "weak",
        role: "owner",
      }).success,
    ).toBe(false);
  });

  it("requires a UUID when updating a user", () => {
    expect(
      updateUserSchema.safeParse({
        id: "not-a-uuid",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        role: "viewer",
      }).success,
    ).toBe(false);
  });

  it("validates and defaults list query parameters", () => {
    expect(
      parseUserListQuery({
        page: "2",
        pageSize: "25",
        search: " ada@example.com ",
        role: "admin",
      }),
    ).toEqual({
      page: 2,
      pageSize: 25,
      search: "ada@example.com",
      role: "admin",
    });

    expect(
      parseUserListQuery({ page: "-1", pageSize: "999", role: "owner" }),
    ).toEqual({ page: 1, pageSize: 10, search: "", role: "all" });
  });
});
