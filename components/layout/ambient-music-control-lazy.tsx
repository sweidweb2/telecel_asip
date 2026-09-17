"use client";

import dynamic from "next/dynamic";

/** Defer ambient music control JS until after hydration (muted by default). */
export const AmbientMusicControlLazy = dynamic(
  () =>
    import("@/components/layout/ambient-music-control").then(
      (m) => m.AmbientMusicControl,
    ),
  { ssr: false, loading: () => null },
);
