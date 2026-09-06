import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PartnersPropositionSection } from "@/components/marketing/partners-proposition-section";
import { partnersCopyFor } from "@/constants/partners-copy";

describe("PartnersPropositionSection", () => {
  it("renders the proposition title, body, and stage image", () => {
    const copy = partnersCopyFor("en").proposition;

    const { container } = render(
      <PartnersPropositionSection locale="en" copy={copy} />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();

    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("partners-stage"),
    );
  });
});
