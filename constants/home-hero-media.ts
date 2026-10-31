/**
 * Ordered stills for the home Founder Continuum hero loop.
 * Soft crossfade only — no video until Telecel-approved footage lands.
 * Localized alts live on `HomePageCopy.hero.continuumAlts` (same order).
 */
export type HomeHeroContinuumSlide = {
  src: string;
  position?: string;
};

export const HOME_HERO_CONTINUUM: HomeHeroContinuumSlide[] = [
  {
    src: "/images/ASIP-108.jpg",
    position: "center 28%",
  },
  {
    src: "/images/ASIP-107.jpg",
    position: "center 36%",
  },
  {
    src: "/images/ASIP-110.jpg",
    position: "center 40%",
  },
  {
    src: "/images/ASIP-102.jpg",
    position: "center 38%",
  },
];

/** Seconds per still before soft dissolve into the next. */
export const HOME_HERO_CONTINUUM_BEAT_S = 12;
