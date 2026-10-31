import { describe, expect, it } from "vitest";

import { homeCopyFor } from "@/constants/home-copy";
import {
  HOME_HERO_CONTINUUM,
  HOME_HERO_CONTINUUM_BEAT_S,
} from "@/constants/home-hero-media";

describe("HOME_HERO_CONTINUUM", () => {
  it("defines 3–4 looping stills; alts live in home copy", () => {
    expect(HOME_HERO_CONTINUUM.length).toBeGreaterThanOrEqual(3);
    expect(HOME_HERO_CONTINUUM.length).toBeLessThanOrEqual(4);
    expect(HOME_HERO_CONTINUUM_BEAT_S).toBeGreaterThanOrEqual(10);

    for (const media of HOME_HERO_CONTINUUM) {
      expect(media.src).toMatch(/^\/images\/.+\.(jpe?g|webp)$/i);
      expect(media.position?.length).toBeGreaterThan(0);
    }

    for (const locale of ["en", "fr"] as const) {
      expect(homeCopyFor(locale).hero.continuumAlts).toHaveLength(
        HOME_HERO_CONTINUUM.length,
      );
    }
  });
});
