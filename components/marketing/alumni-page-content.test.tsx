import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlumniPageContent } from "@/components/marketing/alumni-page-content";
import { alumniCopyFor } from "@/constants/alumni-copy";

describe("AlumniPageContent", () => {
  it("renders Eleanor copy sections and the founders CTA", () => {
    const copy = alumniCopyFor("en");
    render(<AlumniPageContent locale="en" />);

    expect(
      screen.getByRole("heading", { level: 1, name: /The cohort ends/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: copy.purpose.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: copy.benefits.title }),
    ).toBeInTheDocument();
    for (const item of copy.benefits.items) {
      expect(
        screen.getByRole("heading", { level: 3, name: item.title }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getAllByRole("link", { name: copy.hero.primaryCta.label }).length,
    ).toBeGreaterThanOrEqual(1);
  });
});
