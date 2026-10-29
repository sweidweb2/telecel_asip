import type { Locale } from "@/constants/locales";
import type { MarketingMedia } from "@/constants/marketing-media";

/**
 * Ordered stills for the home Founder Continuum hero loop.
 * Soft crossfade only — no video until Telecel-approved footage lands.
 */
export const HOME_HERO_CONTINUUM: MarketingMedia[] = [
  {
    src: "/images/ASIP-108.jpg",
    alt: {
      en: "ASIP founder focused in conversation at a programme table",
      fr: "Fondateur ASIP concentré en conversation à une table du programme",
    },
    position: "center 28%",
  },
  {
    src: "/images/ASIP-107.jpg",
    alt: {
      en: "ASIP founders listening during a programme pitch session",
      fr: "Fondateurs ASIP à l’écoute lors d’une session de pitch du programme",
    },
    position: "center 36%",
  },
  {
    src: "/images/ASIP-110.jpg",
    alt: {
      en: "ASIP founders collaborating at a programme working table",
      fr: "Fondateurs ASIP collaborant autour d’une table de travail du programme",
    },
    position: "center 40%",
  },
  {
    src: "/images/ASIP-102.jpg",
    alt: {
      en: "ASIP mentor and founders in conversation at a programme event",
      fr: "Mentor et fondateurs ASIP en conversation lors d’un événement du programme",
    },
    position: "center 38%",
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
