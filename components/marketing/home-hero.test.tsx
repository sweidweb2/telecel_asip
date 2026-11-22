import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeHero } from "@/components/marketing/home-hero";
import { homeV2CopyFor } from "@/constants/home-v2-copy";

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
  it("renders the v2 headline and only the Founder / Investor routes", () => {
    const copy = homeV2CopyFor("en");

    render(
      <HomeHero
        copy={copy.hero}
        continuumAlts={copy.hero.continuumAlts}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home-hero-continuum")).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: copy.hero.prompt }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "I'm a Founder" }),
    ).toHaveAttribute("href", "#founders");
    expect(
      screen.getByRole("link", { name: "I'm an Investor" }),
    ).toHaveAttribute("href", "#investors");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
