import { describe, expect, it } from "vitest";

import {
  articleMatchesTab,
  categoryToTabId,
  BLOG_STREAM_CATEGORY_LABELS,
  BLOG_TAB_IDS,
} from "@/constants/blog-ui";
import { RECOMMENDED_BLOG_CATEGORIES } from "@/constants/blog-categories";
import { blogLabelsFor } from "@/components/marketing/blog-labels";

describe("blog-ui stream tabs", () => {
  it("exposes all + five ASIP streams", () => {
    expect(BLOG_TAB_IDS).toEqual([
      "all",
      "founder-stories",
      "portfolio-news",
      "programme-updates",
      "founder-resources",
      "partner-perspectives",
    ]);
  });

  it("maps canonical EN labels case-insensitively", () => {
    expect(categoryToTabId("Founder Stories")).toBe("founder-stories");
    expect(categoryToTabId("  portfolio news ")).toBe("portfolio-news");
    expect(categoryToTabId("Program Updates")).toBe("programme-updates");
  });

  it("maps FR stream labels to the same tab ids", () => {
    expect(categoryToTabId("Récits de fondateurs")).toBe("founder-stories");
    expect(categoryToTabId("Actualités du portefeuille")).toBe("portfolio-news");
    expect(categoryToTabId("Regards de partenaires")).toBe(
      "partner-perspectives",
    );
  });

  it("falls back to all for unknown categories", () => {
    expect(categoryToTabId("Design")).toBe("all");
    expect(categoryToTabId("")).toBe("all");
  });

  it("matches when any category on the article hits the stream", () => {
    expect(
      articleMatchesTab(
        ["General", "Founder Stories"],
        "founder-stories",
      ),
    ).toBe(true);
    // Founder & Portfolio Stories is one public category in v2.
    expect(articleMatchesTab(["Portfolio News"], "founder-stories")).toBe(
      true,
    );
    expect(articleMatchesTab(["Portfolio News"], "programme-updates")).toBe(
      false,
    );
    expect(articleMatchesTab(["anything"], "all")).toBe(true);
  });

  it("keeps recommended CMS categories aligned with stream labels", () => {
    expect([...RECOMMENDED_BLOG_CATEGORIES]).toEqual(
      Object.values(BLOG_STREAM_CATEGORY_LABELS),
    );
  });

  it("labels tabs in en and fr with the same tab ids", () => {
    const en = blogLabelsFor("en");
    const fr = blogLabelsFor("fr");
    expect(en.tabs.map((t) => t.id)).toEqual(fr.tabs.map((t) => t.id));
    expect(en.tabs.map((t) => t.id)).toEqual(
      BLOG_TAB_IDS.filter((id) => id !== "portfolio-news"),
    );
    expect(en.emptyStreamState.length).toBeGreaterThan(0);
    expect(fr.emptyStreamState.length).toBeGreaterThan(0);
  });
});
