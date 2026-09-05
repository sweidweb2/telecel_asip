import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeHero } from "@/components/marketing/programme-hero";
import { programmeCopyFor } from "@/constants/programme-copy";

describe("ProgrammeHero", () => {
  it("renders the programme copy and both CTAs", () => {
    const copy = programmeCopyFor("en");

    render(<ProgrammeHero locale="en" copy={copy.hero} openApplications={false} />);

    expect(
      screen.getByRole("heading", { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.hero.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.hero.description)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /register interest/i }),
    ).toHaveAttribute("href", "/en/register-interest");
    expect(
      screen.getByRole("link", { name: copy.hero.secondaryCta.label }),
    ).toHaveAttribute("href", "/en/founders");
  });

  it("promotes Apply when applications are open", () => {
    const copy = programmeCopyFor("en");

    render(<ProgrammeHero locale="en" copy={copy.hero} openApplications />);

    expect(
      screen.getByRole("link", { name: /apply to asip/i }),
    ).toHaveAttribute("href", "/en/apply");
  });
});
