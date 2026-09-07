import { describe, expect, it } from "vitest";

import { MARKETING_MEDIA } from "@/constants/marketing-media";

describe("MARKETING_MEDIA", () => {
  it("defines localized accessible text and optimized assets", () => {
    for (const media of Object.values(MARKETING_MEDIA)) {
      expect(media.src).toMatch(/^\/asip-media\/.+\.webp$/);
      expect(media.alt.en.length).toBeGreaterThan(10);
      expect(media.alt.fr.length).toBeGreaterThan(10);
    }
  });
});
