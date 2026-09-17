"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  HOME_HERO_CONTINUUM,
  HOME_HERO_CONTINUUM_BEAT_S,
} from "@/constants/home-hero-media";
import { cn } from "@/lib/utils";

const CROSSFADE_MS = 1100;
const CONTINUUM_QUALITY = 75;

type HomeHeroContinuumProps = {
  /** RSC LCP still — stays in the initial HTML; swapped out after the first beat. */
  lcpStill: ReactNode;
};

/**
 * Continuum cycle island. Initial paint uses the RSC `lcpStill` slot (no JS needed
 * for LCP). After the first beat, at most two client stills crossfade.
 */
export function HomeHeroContinuum({ lcpStill }: HomeHeroContinuumProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [hasCycled, setHasCycled] = useState(false);

  useEffect(() => {
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const beatMs = HOME_HERO_CONTINUUM_BEAT_S * 1000;
    const id = window.setInterval(() => {
      setHasCycled(true);
      setActiveIndex((current) => {
        setOutgoingIndex(current);
        return (current + 1) % HOME_HERO_CONTINUUM.length;
      });
    }, beatMs);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (outgoingIndex === null) return;
    const id = window.setTimeout(() => setOutgoingIndex(null), CROSSFADE_MS);
    return () => window.clearTimeout(id);
  }, [outgoingIndex]);

  if (!hasCycled) {
    return <>{lcpStill}</>;
  }

  const indices =
    outgoingIndex !== null && outgoingIndex !== activeIndex
      ? [outgoingIndex, activeIndex]
      : [activeIndex];

  return (
    <>
      {indices.map((index) => {
        const slide = HOME_HERO_CONTINUUM[index];
        if (!slide) return null;

        const isActive = index === activeIndex;

        return (
          <div
            key={slide.src}
            className={cn("home-hero-continuum-slide absolute inset-0")}
            data-active={isActive ? "true" : "false"}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              loading="lazy"
              fetchPriority="low"
              decoding="async"
              className="object-cover"
              style={{ objectPosition: slide.position ?? "center" }}
              sizes="100vw"
              quality={CONTINUUM_QUALITY}
            />
          </div>
        );
      })}
    </>
  );
}
