import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeHero } from "@/components/marketing/programme-hero";
import { programmeCopyFor } from "@/constants/programme-copy";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

describe("ProgrammeHero", () => {
  it("renders the programme copy and both CTAs", () => {
    const copy = programmeCopyFor("en");
    const intake = intakeCtaFor("en", false);

    render(<ProgrammeHero locale="en" copy={copy.hero} intake={intake} />);

    expect(
      screen.getByRole("heading", { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.hero.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.hero.description)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: intake.label }),
    ).toHaveAttribute("href", intake.href);
    expect(
      screen.getByRole("link", { name: copy.hero.secondaryCta.label }),
    ).toHaveAttribute("href", "/en/founders");
  });

  it("promotes Apply when applications are open", () => {
    const copy = programmeCopyFor("en");
    const intake = intakeCtaFor("en", true);

    render(<ProgrammeHero locale="en" copy={copy.hero} intake={intake} />);

    expect(
      screen.getByRole("link", { name: intake.label }),
    ).toHaveAttribute("href", intake.href);
  });
});
