import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactEvidenceRuleSection } from "@/components/marketing/impact-evidence-rule-section";
import { impactCopyFor } from "@/constants/impact-copy";

describe("ImpactEvidenceRuleSection", () => {
  it("renders the evidence rule headline and five publish checks", () => {
    const copy = impactCopyFor("en");

    render(<ImpactEvidenceRuleSection copy={copy.evidenceRule} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.evidenceRule.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.evidenceRule.description)).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Measurement period")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Last verified")).toBeInTheDocument();
    expect(screen.getByText("Permission")).toBeInTheDocument();
  });

  it("renders the French evidence rule copy", () => {
    const copy = impactCopyFor("fr");

    render(<ImpactEvidenceRuleSection copy={copy.evidenceRule} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.evidenceRule.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Responsable")).toBeInTheDocument();
  });
});
