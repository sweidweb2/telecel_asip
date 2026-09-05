import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  firstSearchParam,
  parseAdminListQuery,
  pickSearchParams,
} from "@/validations/admin-list-query";

describe("firstSearchParam", () => {
  it("returns the string as-is", () => {
    expect(firstSearchParam("ada")).toBe("ada");
  });

  it("returns the first array entry", () => {
    expect(firstSearchParam(["a", "b"])).toBe("a");
  });

  it("returns undefined for missing values", () => {
    expect(firstSearchParam(undefined)).toBeUndefined();
  });
});

describe("pickSearchParams", () => {
  it("applies defaults and first-value extraction", () => {
    expect(
      pickSearchParams(
        { page: ["2"], search: undefined, status: "draft" },
        { page: "1", search: "", status: "all" },
      ),
    ).toEqual({ page: "2", search: "", status: "draft" });
  });
});

describe("parseAdminListQuery", () => {
  const schema = z.object({
    page: z.coerce.number().int().min(1).max(10_000).catch(1),
    search: z.string().trim().max(100).catch(""),
    status: z.enum(["all", "draft", "published"]).catch("all"),
  });

  it("parses and attaches pageSize", () => {
    expect(
      parseAdminListQuery({
        input: { page: "3", search: "  hello ", status: "draft" },
        schema,
        pageSize: 20,
        defaults: { page: "1", search: "", status: "all" },
      }),
    ).toEqual({
      page: 3,
      search: "hello",
      status: "draft",
      pageSize: 20,
    });
  });

  it("falls back via defaults and schema catch", () => {
    expect(
      parseAdminListQuery({
        input: {},
        schema,
        pageSize: 12,
        defaults: { page: "1", search: "", status: "all" },
      }),
    ).toEqual({
      page: 1,
      search: "",
      status: "all",
      pageSize: 12,
    });
  });
});
