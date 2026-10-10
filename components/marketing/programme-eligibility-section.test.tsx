import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeEligibilitySection } from "@/components/marketing/programme-eligibility-section";
import { programmeCopyFor } from "@/constants/programme-copy";

describe("ProgrammeEligibilitySection", () => {
  it("renders the checklist title and all eligibility items", () => {
    const copy = programmeCopyFor("en").eligibility;

    render(<ProgrammeEligibilitySection copy={copy} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();

    for (const item of copy.items) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }

    expect(copy.items).toHaveLength(6);
  });

  it("does not render the cohort notice on the public page", () => {
    const copy = programmeCopyFor("en").eligibility;

    render(<ProgrammeEligibilitySection copy={copy} />);

    expect(screen.queryByText(copy.notice)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/when applications open, replace/i),
    ).not.toBeInTheDocument();
  });

  it("renders real programme photography beside the checklist", () => {
    const copy = programmeCopyFor("en").eligibility;
    render(<ProgrammeEligibilitySection copy={copy} />);
    const img = screen.getByRole("img", { name: copy.imageAlt });

    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("founders-working.webp"),
    );
  });
});
