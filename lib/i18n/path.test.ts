import { describe, expect, it } from "vitest";

import {
  getLocaleFromPath,
  stripLocaleFromPath,
  swapLocaleInPath,
} from "@/lib/i18n/path";
import { localeUrl, pageAlternates } from "@/lib/seo/alternates";

describe("swapLocaleInPath", () => {
  it("swaps locale on nested paths", () => {
    expect(swapLocaleInPath("/en/portfolio", "fr")).toBe("/fr/portfolio");
    expect(swapLocaleInPath("/fr/about", "en")).toBe("/en/about");
  });

  it("swaps locale on home", () => {
    expect(swapLocaleInPath("/en", "fr")).toBe("/fr");
    expect(swapLocaleInPath("/fr", "en")).toBe("/en");
  });

  it("prefixes locale when missing", () => {
    expect(swapLocaleInPath("/portfolio", "fr")).toBe("/fr/portfolio");
    expect(swapLocaleInPath("/", "en")).toBe("/en");
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
    const alt = pageAlternates("en", "/portfolio");
    expect(alt.canonical).toBe(localeUrl("en", "/portfolio"));
    expect(alt.languages).toMatchObject({
      en: localeUrl("en", "/portfolio"),
      fr: localeUrl("fr", "/portfolio"),
      "x-default": localeUrl("en", "/portfolio"),
    });
  });
});
