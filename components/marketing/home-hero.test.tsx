import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeHero } from "@/components/marketing/home-hero";
import { homeCopyFor } from "@/constants/home-copy";
import { HOME_HERO_CONTINUUM } from "@/constants/home-hero-media";

describe("HomeHero", () => {
  it("renders brand, headline, continuum stills, and CTAs", () => {
    const copy = homeCopyFor("en");

    render(
      <HomeHero locale="en" copy={copy.hero} openApplications={false} />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("ASIP")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: copy.hero.primaryCta.label }),
    ).toHaveAttribute("href", "/en/founders");
    expect(
      screen.getByRole("link", { name: "Register interest" }),
    ).toHaveAttribute("href", "/en/register-interest");

    const images = document.querySelectorAll(
      ".home-hero-continuum-slide img",
    );
    expect(images).toHaveLength(HOME_HERO_CONTINUUM.length);
  });

  it("swaps intake CTA when applications are open", () => {
    const copy = homeCopyFor("en");

    render(
      <HomeHero locale="en" copy={copy.hero} openApplications />,
    );

    expect(
      screen.getByRole("link", { name: "Apply to ASIP" }),
    ).toHaveAttribute("href", "/en/apply");
  });
});
