import { describe, expect, it } from "vitest";

import {
  HOME_HERO_CONTINUUM,
  HOME_HERO_CONTINUUM_BEAT_S,
} from "@/constants/home-hero-media";

describe("HOME_HERO_CONTINUUM", () => {
  it("defines 3–4 looping stills with localized alts", () => {
    expect(HOME_HERO_CONTINUUM.length).toBeGreaterThanOrEqual(3);
    expect(HOME_HERO_CONTINUUM.length).toBeLessThanOrEqual(4);
    expect(HOME_HERO_CONTINUUM_BEAT_S).toBeGreaterThanOrEqual(10);

    for (const media of HOME_HERO_CONTINUUM) {
      expect(media.src).toMatch(/^\/images\/.+\.(jpe?g|webp)$/i);
      expect(media.alt.en.length).toBeGreaterThan(10);
      expect(media.alt.fr.length).toBeGreaterThan(10);
    }
  });
});
