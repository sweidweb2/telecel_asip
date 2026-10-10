import type { Locale } from "@/constants/locales";
import type { MarketingMedia } from "@/constants/marketing-media";

/**
 * Ordered stills for the home Founder Continuum hero loop.
 * Soft crossfade only — no video until Telecel-approved footage lands.
 */
export const HOME_HERO_CONTINUUM: MarketingMedia[] = [
  {
    src: "/asip-media/home-founder.webp",
    alt: {
      en: "ASIP founder in conversation at a programme event",
      fr: "Fondateur ASIP en conversation lors d’un événement du programme",
    },
    position: "center 38%",
  },
  {
    src: "/asip-media/founders-community.webp",
    alt: {
      en: "ASIP founders and programme community together",
      fr: "Fondateurs ASIP et communauté du programme",
    },
    position: "center 42%",
  },
  {
    src: "/asip-media/programme-workshop.webp",
    alt: {
      en: "ASIP founders collaborating in a programme workshop",
      fr: "Fondateurs ASIP collaborant lors d’un atelier du programme",
    },
    position: "center 40%",
  },
  {
    src: "/asip-media/founder-pitch.webp",
    alt: {
      en: "ASIP founder pitching on the Accelerating Innovators stage",
      fr: "Fondateur ASIP présentant son projet sur la scène Accelerating Innovators",
    },
    position: "center 30%",
  },
];

/** Seconds per still before soft dissolve into the next. */
export const HOME_HERO_CONTINUUM_BEAT_S = 12;

export function homeHeroContinuumAlt(
  locale: Locale,
  index = 0,
): string {
  const slide = HOME_HERO_CONTINUUM[index] ?? HOME_HERO_CONTINUUM[0];
  return slide?.alt[locale] ?? "";
}
