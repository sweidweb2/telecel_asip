import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeHero } from "@/components/marketing/home-hero";
import { homeCopyFor } from "@/constants/home-copy";
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

vi.mock("@/components/marketing/home-hero-continuum", () => ({
  HomeHeroContinuum: () => <div data-testid="home-hero-continuum" />,
}));

vi.mock("@/components/marketing/home-hero-signal", () => ({
  HomeHeroSignal: () => null,
}));

describe("HomeHero", () => {
  it("renders headline and Founder | Investor pathways without brand lockup", () => {
    const copy = homeCopyFor("en");
    const intake = intakeCtaFor("en", false);

    render(
      <HomeHero
        locale="en"
        copy={copy.hero}
        pathways={copy.pathways}
        intake={intake}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument();
    expect(screen.queryByText("ASIP")).not.toBeInTheDocument();
    expect(
      screen.queryByText(copy.hero.endorsement),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("home-hero-continuum")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: copy.pathways.groupLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /I'm a Founder/i }),
    ).toHaveAttribute("href", "#founders");
    expect(
      screen.getByRole("link", { name: /I'm an Investor/i }),
    ).toHaveAttribute("href", "#investors");
  });

  it("keeps Founder and Investor as the only two primary hero CTAs", () => {
    const copy = homeCopyFor("en");
    const intake = intakeCtaFor("en", true);

    render(
      <HomeHero
        locale="en"
        copy={copy.hero}
        pathways={copy.pathways}
        intake={intake}
      />,
    );

    const pathwayGroup = screen.getByRole("group", {
      name: copy.pathways.groupLabel,
    });
    expect(pathwayGroup.querySelectorAll("a")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /I'm a Founder/i }),
    ).toHaveAttribute("href", "#founders");
    expect(
      screen.queryByRole("link", { name: "Startup" }),
    ).not.toBeInTheDocument();
  });
});
