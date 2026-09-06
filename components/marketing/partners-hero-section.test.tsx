import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PartnersHeroSection } from "@/components/marketing/partners-hero-section";
import { partnersCopyFor } from "@/constants/partners-copy";

describe("PartnersHeroSection", () => {
  it("renders headline and contact CTA", () => {
    const copy = partnersCopyFor("en").hero;

    const { container } = render(
      <PartnersHeroSection locale="en" copy={copy} />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: `${copy.titleLead} ${copy.titleAccent}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: copy.cta.label }),
    ).toHaveAttribute("href", "/en/contact");

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("partners-network"),
    );
  });
});
