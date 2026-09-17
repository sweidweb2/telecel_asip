import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHeroContinuum } from "@/components/marketing/home-hero-continuum";
import {
  HOME_HERO_CONTINUUM,
  HOME_HERO_CONTINUUM_BEAT_S,
} from "@/constants/home-hero-media";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    <img src={src} alt={alt} />
  ),
}));

describe("HomeHeroContinuum", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("mounts only the LCP still on first paint", () => {
    render(<HomeHeroContinuum />);
    const slides = document.querySelectorAll(".home-hero-continuum-slide");
    expect(slides).toHaveLength(1);
    expect(slides[0]?.querySelector("img")).toHaveAttribute(
      "src",
      HOME_HERO_CONTINUUM[0]!.src,
    );
  });

  it("crossfades with at most two stills mounted", () => {
    render(<HomeHeroContinuum />);

    act(() => {
      vi.advanceTimersByTime(HOME_HERO_CONTINUUM_BEAT_S * 1000);
    });

    const slides = document.querySelectorAll(".home-hero-continuum-slide");
    expect(slides.length).toBeGreaterThanOrEqual(1);
    expect(slides.length).toBeLessThanOrEqual(2);
    expect(
      document.querySelector(
        `.home-hero-continuum-slide[data-active="true"] img`,
      ),
    ).toHaveAttribute("src", HOME_HERO_CONTINUUM[1]!.src);
  });

  it("stays on the first still when reduced motion is preferred", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );

    render(<HomeHeroContinuum />);

    act(() => {
      vi.advanceTimersByTime(HOME_HERO_CONTINUUM_BEAT_S * 1000 * 3);
    });

    expect(document.querySelectorAll(".home-hero-continuum-slide")).toHaveLength(
      1,
    );
    expect(
      document.querySelector(".home-hero-continuum-slide img"),
    ).toHaveAttribute("src", HOME_HERO_CONTINUUM[0]!.src);
  });
});
