import { describe, expect, it } from "vitest";

import {
  HTTP_ERROR_ROUTES,
  httpErrorHref,
  httpErrorKindFromCode,
  httpErrorPathFor,
} from "@/constants/http-errors";

describe("http-errors", () => {
  it("maps known codes to kinds", () => {
    expect(httpErrorKindFromCode(403)).toBe("403");
    expect(httpErrorKindFromCode("404")).toBe("404");
    expect(httpErrorKindFromCode("500")).toBe("500");
    expect(httpErrorKindFromCode("503")).toBe("503");
    expect(httpErrorKindFromCode("502")).toBe("generic");
    expect(httpErrorKindFromCode(undefined)).toBe("generic");
  });

  it("resolves dedicated paths", () => {
    expect(httpErrorPathFor("403")).toBe(HTTP_ERROR_ROUTES.forbidden);
    expect(httpErrorPathFor("500")).toBe(HTTP_ERROR_ROUTES.serverError);
    expect(httpErrorPathFor("generic")).toBe(HTTP_ERROR_ROUTES.generic);
  });

  it("builds hrefs with digest and generic code", () => {
    expect(httpErrorHref("500", { digest: "abc" })).toBe("/error/500?digest=abc");
    expect(httpErrorHref("generic", { code: "502" })).toBe("/error?code=502");
  });
});
