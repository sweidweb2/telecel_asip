import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactProgressSection } from "@/components/marketing/impact-progress-section";
import { impactCopyFor } from "@/constants/impact-copy";

describe("ImpactProgressSection", () => {
  it("renders the framing heading and a single narrative paragraph", () => {
    const copy = impactCopyFor("en");

    const { container } = render(<ImpactProgressSection copy={copy.progress} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.progress.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.progress.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.progress.description)).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(container.querySelector("ul")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders the French framing copy", () => {
    const copy = impactCopyFor("fr");

    render(<ImpactProgressSection copy={copy.progress} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.progress.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.progress.description)).toBeInTheDocument();
  });
});
