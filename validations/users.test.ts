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
    expect(result.role).toBe("editor");
    expect(result.password).toBe("Password1");
  });

  it("requires a password and rejects empty or weak values", () => {
    expect(
      createUserSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "",
        role: "viewer",
      }).success,
    ).toBe(false);

    expect(
      createUserSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "   ",
        role: "admin",
      }).success,
    ).toBe(false);

    expect(
      createUserSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "weak",
        role: "editor",
      }).success,
    ).toBe(false);

    expect(
      createUserSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "Password1",
        role: "editor",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid emails and short names", () => {
    expect(
      createUserSchema.safeParse({
        fullName: "Ada Lovelace",
        email: "not-an-email",
        password: "Password1",
        role: "admin",
      }).success,
    ).toBe(false);

    expect(
      createUserSchema.safeParse({
        fullName: "A",
        email: "ada@example.com",
        password: "Password1",
        role: "viewer",
      }).success,
    ).toBe(false);
  });

  it("requires a UUID when updating a user and accepts any role", () => {
    expect(
      updateUserSchema.safeParse({
        id: "not-a-uuid",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        role: "admin",
      }).success,
    ).toBe(false);

    expect(
      updateUserSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        role: "viewer",
      }).success,
    ).toBe(true);
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
      pageSize: 10,
      search: "ada@example.com",
      role: "admin",
      sort: "created_at",
      dir: "desc",
    });

    expect(
      parseUserListQuery({ page: "-1", pageSize: "999", role: "owner" }),
    ).toEqual({
      page: 1,
      pageSize: 10,
      search: "",
      role: "all",
      sort: "created_at",
      dir: "desc",
    });

    expect(
      parseUserListQuery({
        sort: "email",
        dir: "asc",
      }),
    ).toMatchObject({ sort: "email", dir: "asc" });

    expect(parseUserListQuery({ sort: "nope", dir: "sideways" })).toMatchObject(
      { sort: "created_at", dir: "desc" },
    );
  });
});
