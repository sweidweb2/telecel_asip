import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FoundersHeroSection } from "@/components/marketing/founders-hero-section";
import { marketingCopyFor } from "@/constants/marketing-copy";

describe("FoundersHeroSection", () => {
  it("renders the directory intro on the primary tree hero", () => {
    const copy = marketingCopyFor("en", "founders");
    render(
      <FoundersHeroSection
        locale="en"
        copy={{
          eyebrow: copy.eyebrow,
          title: copy.title,
          description: copy.description,
          cta: copy.cta,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: copy.cta?.label }),
    ).toHaveAttribute("href", "/en/impact");
  });
});
