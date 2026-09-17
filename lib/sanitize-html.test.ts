import { describe, expect, it } from "vitest";

import { sanitizeBlogHtml } from "@/lib/sanitize-html";

describe("sanitizeBlogHtml", () => {
  it("keeps safe absolute and relative hrefs", () => {
    expect(
      sanitizeBlogHtml('<a href="https://example.com/path">x</a>'),
    ).toContain('href="https://example.com/path"');
    expect(sanitizeBlogHtml('<a href="/insights/foo">x</a>')).toContain(
      'href="/insights/foo"',
    );
    expect(sanitizeBlogHtml('<a href="#section">x</a>')).toContain(
      'href="#section"',
    );
    expect(sanitizeBlogHtml('<a href="mailto:hi@example.com">x</a>')).toContain(
      'href="mailto:hi@example.com"',
    );
  });

  it("strips protocol-relative and javascript hrefs", () => {
    const protocolRelative = sanitizeBlogHtml(
      '<a href="//evil.example/phish">x</a>',
    );
    expect(protocolRelative).not.toContain("evil.example");
    expect(protocolRelative).not.toContain("href=");

    const javascript = sanitizeBlogHtml('<a href="javascript:alert(1)">x</a>');
    expect(javascript).not.toContain("javascript:");
    expect(javascript).not.toContain("href=");
  });

  it("removes script tags", () => {
    const clean = sanitizeBlogHtml("<p>Hi</p><script>alert(1)</script>");
    expect(clean).toContain("<p>Hi</p>");
    expect(clean).not.toContain("script");
  });
});
