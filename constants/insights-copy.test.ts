import { describe, expect, it } from "vitest";

import { insightsCopyFor } from "@/constants/insights-copy";

describe("insightsCopyFor", () => {
  it("keeps the same stream ids and register-interest CTA in English and French", () => {
    const en = insightsCopyFor("en");
    const fr = insightsCopyFor("fr");

    expect(en.streams.rows.map((row) => row.id)).toEqual(
      fr.streams.rows.map((row) => row.id),
    );
    // v2 launch categories only; empty streams stay hidden.
    expect(en.streams.rows).toHaveLength(2);
    expect(en.updates.slug).toBe("register-interest");
    expect(fr.updates.slug).toBe("register-interest");
    expect(en.updates.label).toBe("Register for updates");
    expect(fr.hero.title.length).toBeGreaterThan(0);
    // Placeholder example headlines ("[Startup] ...") are never public copy.
    expect(en.streams.rows.every((row) => !row.example.includes("["))).toBe(true);
  });
});
