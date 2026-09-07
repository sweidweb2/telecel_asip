import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeTelecelConnectionSection } from "@/components/marketing/home-telecel-connection-section";
import { homeCopyFor } from "@/constants/home-copy";
import { TELECEL_GROUP_URL } from "@/components/layout/site-footer-labels";

describe("HomeTelecelConnectionSection", () => {
  it("renders Connecting Energies copy and Telecel CTA", () => {
    const copy = homeCopyFor("en");

    render(<HomeTelecelConnectionSection copy={copy.telecel} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.telecel.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.telecel.prompt)).toBeInTheDocument();
    expect(screen.getByText(copy.telecel.description)).toBeInTheDocument();

    const cta = screen.getByRole("link", { name: copy.telecel.ctaLabel });
    expect(cta).toHaveAttribute("href", TELECEL_GROUP_URL);
    expect(cta).toHaveAttribute("target", "_blank");
  });
});
