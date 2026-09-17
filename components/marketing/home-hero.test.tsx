import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeHero } from "@/components/marketing/home-hero";
import { homeCopyFor } from "@/constants/home-copy";
import { HOME_HERO_CONTINUUM } from "@/constants/home-hero-media";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

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

describe("HomeHero", () => {
  beforeEach(() => {
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
    vi.unstubAllGlobals();
  });

  it("renders brand, headline, LCP continuum still, and CTAs", () => {
    const copy = homeCopyFor("en");
    const intake = intakeCtaFor("en", false);

    render(
      <HomeHero locale="en" copy={copy.hero} intake={intake} />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("ASIP")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: copy.hero.primaryCta.label }),
    ).toHaveAttribute("href", "/en/founders");
    expect(
      screen.getByRole("link", { name: intake.label }),
    ).toHaveAttribute("href", intake.href);

    const slides = document.querySelectorAll(".home-hero-continuum-slide");
    expect(slides).toHaveLength(1);
    expect(slides[0]).toHaveAttribute("data-lcp", "true");
    expect(slides[0]?.querySelector("img")).toHaveAttribute(
      "src",
      HOME_HERO_CONTINUUM[0]!.src,
    );
  });

  it("swaps intake CTA when applications are open", () => {
    const copy = homeCopyFor("en");
    const intake = intakeCtaFor("en", true);

    render(
      <HomeHero locale="en" copy={copy.hero} intake={intake} />,
    );

    expect(
      screen.getByRole("link", { name: intake.label }),
    ).toHaveAttribute("href", intake.href);
  });
});
