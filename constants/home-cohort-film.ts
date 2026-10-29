import type { Locale } from "@/constants/locales";

/**
 * Home Module 02 — Cohort 3 film.
 * Click-to-play only: the MP4 is not requested until the visitor presses play.
 */
export const HOME_COHORT_FILM = {
  /** Served from `public/video/` — URL-safe name (no spaces). */
  src: "/video/asip-cohort-3.mp4",
  /**
   * Lightweight WebP stand-in until a true first-frame poster is extracted.
   * Keeps LCP/hero free of video bytes.
   */
  posterSrc: "/asip-media/founders-community.webp",
  /** Intrinsic poster aspect used for the player frame. */
  aspectRatio: "16 / 9",
} as const;

export function homeCohortFilmPosterAlt(locale: Locale): string {
  return locale === "fr"
    ? "Fondateurs ASIP de la Cohorte 3 réunis lors d’un événement du programme"
    : "ASIP Cohort 3 founders together at a programme event";
}
