import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";

import { AboutHero } from "@/components/marketing/about-hero";
import { marketingCopyFor } from "@/constants/marketing-copy";

describe("AboutHero", () => {
  it("renders the v2 hero copy and CTA", () => {
    const copy = marketingCopyFor("en", "about");

    render(
      <AboutHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        heroChips={copy.heroChips}
        action={<Link href="/en/founders">Explore the founders</Link>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Started in 2019. Still building." }),
    ).toBeInTheDocument();
    expect(screen.getByText("About ASIP")).toBeInTheDocument();
    expect(screen.getByText(/launched in Barcelona/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore the founders" }),
    ).toBeInTheDocument();
  });
});
