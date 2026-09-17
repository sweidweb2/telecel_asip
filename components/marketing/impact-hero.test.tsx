import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactHero } from "@/components/marketing/impact-hero";
import { impactCopyFor } from "@/constants/impact-copy";

describe("ImpactHero", () => {
  it("renders the credibility headline, support copy, and founders CTA", () => {
    const copy = impactCopyFor("en");

    render(<ImpactHero locale="en" copy={copy.hero} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "The story is what happened next.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.hero.description)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: copy.hero.cta.label }),
    ).toHaveAttribute("href", "/en/founders");
    expect(
      screen.getByRole("img", {
        name: /founders, mentors, and partners celebrating demo day/i,
      }),
    ).toBeInTheDocument();
  });
});
