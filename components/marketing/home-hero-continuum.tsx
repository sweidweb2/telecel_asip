"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  HOME_HERO_CONTINUUM,
  HOME_HERO_CONTINUUM_BEAT_S,
} from "@/constants/home-hero-media";
import { cn } from "@/lib/utils";

const CROSSFADE_MS = 1100;

/**
 * Mounts at most two continuum stills (active + outgoing) so the LCP viewport
 * does not decode four full-bleed images at once.
 */
export function HomeHeroContinuum() {
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
        const isLcp = !hasCycled && index === 0;

        return (
          <div
            key={slide.src}
            className={cn("home-hero-continuum-slide absolute inset-0")}
            data-active={isActive ? "true" : "false"}
            data-lcp={isLcp ? "true" : undefined}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              priority={isLcp}
              fetchPriority={isLcp ? "high" : "low"}
              loading={isLcp ? "eager" : "lazy"}
              decoding="async"
              className="object-cover"
              style={{ objectPosition: slide.position ?? "center" }}
              sizes="100vw"
              quality={75}
            />
          </div>
        );
      })}
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(20,51,59,.97)_0%,rgba(20,51,59,.88)_36%,rgba(20,51,59,.45)_62%,rgba(20,51,59,.18)_82%,rgba(20,51,59,.08)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,51,59,.55)_0%,transparent_42%)]" />
    </>
  );
}
