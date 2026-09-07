import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeOutcomesSection } from "@/components/marketing/home-outcomes-section";
import { homeCopyFor } from "@/constants/home-copy";

describe("HomeOutcomesSection", () => {
  it("renders impact copy, features, register CTA, and the CTA image", () => {
    const copy = homeCopyFor("en").outcomes;

    const { container } = render(
      <HomeOutcomesSection
        locale="en"
        copy={copy}
        openApplications={false}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();

    for (const feature of copy.features) {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    }

    expect(
      screen.getByRole("link", { name: /register interest/i }),
    ).toHaveAttribute("href", "/en/register-interest");
    expect(
      screen.getByRole("link", { name: copy.cta.label }),
    ).toHaveAttribute("href", "/en/impact");

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("window.webp"),
    );
    expect(img).toHaveAttribute("alt", copy.imageAlt);
  });

  it("promotes Apply when applications are open", () => {
    const copy = homeCopyFor("en").outcomes;

    render(
      <HomeOutcomesSection
        locale="en"
        copy={copy}
        openApplications={true}
      />,
    );

    expect(
      screen.getByRole("link", { name: /apply to asip/i }),
    ).toHaveAttribute("href", "/en/apply");
  });
});
