/**
 * Home Module 02 — Cohort 3 film.
 * Click-to-play only: the MP4 is not requested until the visitor presses play.
 * Poster alt lives on `HomePageCopy.cohortFilm.posterAlt`.
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
