import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AboutHero } from "@/components/marketing/about-hero";
import { marketingCopyFor } from "@/constants/marketing-copy";

describe("AboutHero", () => {
  it("renders centered copy, CTA, and decorative focus chips", () => {
    const copy = marketingCopyFor("en", "about");

    render(
      <AboutHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        heroChips={copy.heroChips}
        action={<a href="/en/founders">Explore the founders</a>}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Backing the builders shaping Africa’s next chapter.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("About ASIP")).toBeInTheDocument();
    expect(
      screen.getByText(/launched by Telecel Group in Barcelona in 2019/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore the founders" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Knowledge")).toBeInTheDocument();
    expect(screen.getByText("Barcelona · 2019")).toBeInTheDocument();
  });
});
