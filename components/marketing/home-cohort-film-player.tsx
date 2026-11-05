"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import "./home-cohort-film.css";

import { HOME_COHORT_FILM } from "@/constants/home-cohort-film";
import { cn } from "@/lib/utils";

type HomeCohortFilmPlayerProps = {
  playLabel: string;
  watchLabel: string;
  eyebrow: string;
  posterAlt: string;
  className?: string;
};

/**
 * Click-to-play film player.
 * Idle state is a compressed poster only — the MP4 is not requested until play.
 */
export function HomeCohortFilmPlayer({
  playLabel,
  watchLabel,
  eyebrow,
  posterAlt,
  className,
}: HomeCohortFilmPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const video = videoRef.current;
    if (!video) return;

    void video.play().catch(() => {
      // Autoplay after mount can still fail on some browsers; controls remain.
    });
  }, [isPlaying]);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-asip-ink",
        "ring-1 ring-asip-ink/15",
        className,
      )}
      style={{ aspectRatio: HOME_COHORT_FILM.aspectRatio }}
    >
      {isPlaying ? (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          controls
          playsInline
          preload="auto"
          poster={HOME_COHORT_FILM.posterSrc}
          controlsList="nodownload"
        >
          <source src={HOME_COHORT_FILM.src} type="video/mp4" />
        </video>
      ) : (
        <>
          <Image
            src={HOME_COHORT_FILM.posterSrc}
            alt={posterAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1152px"
            className="object-cover transition-transform duration-700 ease-out group-hover/film:scale-[1.03]"
            quality={75}
            loading="lazy"
            decoding="async"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--asip-ink)_35%,transparent)_0%,color-mix(in_srgb,var(--asip-ink)_12%,transparent)_38%,color-mix(in_srgb,var(--asip-ink)_55%,transparent)_100%)]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--asip-ink)_72%,transparent)_0%,transparent_100%)]"
          />

          <p className="pointer-events-none absolute top-4 left-4 z-10 text-[0.65rem] font-semibold tracking-[0.18em] text-white/80 uppercase sm:top-5 sm:left-5 sm:text-xs">
            ASIP · {eyebrow}
          </p>

          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className={cn(
              "group/play absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-4",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-asip-mint",
            )}
            aria-label={playLabel}
          >
            <span className="relative inline-flex items-center justify-center">
              <span
                aria-hidden
                className="home-cohort-film-pulse absolute size-20 rounded-full bg-white/35 sm:size-24"
              />
              <span
                className={cn(
                  "relative inline-flex size-14 items-center justify-center rounded-full sm:size-16",
                  "bg-white text-asip-ink shadow-[0_12px_40px_color-mix(in_srgb,var(--asip-ink)_35%,transparent)]",
                  "transition-transform duration-300 ease-out",
                  "group-hover/play:scale-105 group-active/play:scale-95",
                )}
              >
                <Play
                  className="size-6 fill-current translate-x-0.5 sm:size-7"
                  aria-hidden
                />
              </span>
            </span>
            <span
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border border-white/25 bg-asip-ink/45 px-4",
                "text-sm font-semibold tracking-wide text-white backdrop-blur-sm",
                "transition-colors duration-300 group-hover/play:border-white/45 group-hover/play:bg-asip-ink/60",
              )}
            >
              {watchLabel}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
