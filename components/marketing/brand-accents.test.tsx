import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  renderEmphasis,
  SpectrumLine,
  stripEmphasis,
} from "@/components/marketing/brand-accents";

describe("brand accents", () => {
  it("wraps bracketed words in the sun emphasis and keeps the rest", () => {
    render(<h2>{renderEmphasis("Built to [scale].", "underline")}</h2>);

    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Built to scale.");
    const emph = heading.querySelector(".asip-emph");
    expect(emph).toHaveTextContent("scale");
    expect(emph).toHaveClass("asip-emph--underline");
  });

  it("returns copy without markers unchanged", () => {
    expect(renderEmphasis("African founders.")).toBe("African founders.");
  });

  it("strips markers for labels and metadata", () => {
    expect(stripEmphasis("AI that earns its [place] in the business.")).toBe(
      "AI that earns its place in the business.",
    );
  });

  it("draws the spectrum in logo order", () => {
    const { container } = render(<SpectrumLine />);
    const segments = [...container.querySelectorAll("span")].map(
      (span) => span.className,
    );
    expect(segments).toEqual([
      "bg-asip-magenta",
      "bg-brand-mid",
      "bg-asip-coral",
      "bg-asip-sky",
      "bg-asip-sun",
    ]);
  });
});
