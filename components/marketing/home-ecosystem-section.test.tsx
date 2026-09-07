import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeEcosystemSection } from "@/components/marketing/home-ecosystem-section";
import { homeCopyFor } from "@/constants/home-copy";

describe("HomeEcosystemSection", () => {
  it("renders six partner roles and partners CTA", () => {
    const copy = homeCopyFor("en");

    render(<HomeEcosystemSection locale="en" copy={copy.ecosystem} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.ecosystem.title }),
    ).toBeInTheDocument();
    expect(copy.ecosystem.roles).toHaveLength(6);
    for (const role of copy.ecosystem.roles) {
      expect(screen.getByRole("heading", { name: role.title })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("link", { name: copy.ecosystem.cta.label }),
    ).toHaveAttribute("href", "/en/partners");
  });
});
