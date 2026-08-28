import { describe, expect, it } from "vitest";

import {
  getLocaleFromPath,
  stripLocaleFromPath,
  swapLocaleInPath,
} from "@/lib/i18n/path";
import { localeUrl, pageAlternates } from "@/lib/seo/alternates";

describe("swapLocaleInPath", () => {
  it("swaps locale on nested paths", () => {
    expect(swapLocaleInPath("/en/founders", "fr")).toBe("/fr/founders");
    expect(swapLocaleInPath("/fr/about", "en")).toBe("/en/about");
  });

  it("swaps locale on home", () => {
    expect(swapLocaleInPath("/en", "fr")).toBe("/fr");
    expect(swapLocaleInPath("/fr", "en")).toBe("/en");
  });

  it("prefixes locale when missing", () => {
    expect(swapLocaleInPath("/founders", "fr")).toBe("/fr/founders");
    expect(swapLocaleInPath("/", "en")).toBe("/en");
  });

  it("maps bare auth routes to localized auth pages", () => {
    expect(swapLocaleInPath("/login", "fr")).toBe("/fr/login");
    expect(swapLocaleInPath("/signup", "en")).toBe("/en/signup");
    expect(swapLocaleInPath("/register", "fr")).toBe("/fr/signup");
  });

  it("swaps locale on localized auth pages", () => {
    expect(swapLocaleInPath("/en/login", "fr")).toBe("/fr/login");
    expect(swapLocaleInPath("/fr/signup", "en")).toBe("/en/signup");
  });

  it("maps dashboard to locale home", () => {
    expect(swapLocaleInPath("/dashboard/settings", "fr")).toBe("/fr");
  });
});

describe("stripLocaleFromPath", () => {
  it("strips leading locale", () => {
    expect(stripLocaleFromPath("/en/about")).toBe("/about");
    expect(stripLocaleFromPath("/fr")).toBe("/");
    expect(stripLocaleFromPath("/en")).toBe("/");
  });
});

describe("getLocaleFromPath", () => {
  it("reads locale from path", () => {
    expect(getLocaleFromPath("/en/faq")).toBe("en");
    expect(getLocaleFromPath("/fr")).toBe("fr");
    expect(getLocaleFromPath("/dashboard")).toBeNull();
  });
});

describe("pageAlternates", () => {
  it("sets canonical and hreflang languages", () => {
    const alt = pageAlternates("en", "/founders");
    expect(alt.canonical).toBe(localeUrl("en", "/founders"));
    expect(alt.languages).toMatchObject({
      en: localeUrl("en", "/founders"),
      fr: localeUrl("fr", "/founders"),
      "x-default": localeUrl("en", "/founders"),
    });
  });
});
