import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeValueSection } from "@/components/marketing/programme-value-section";
import { programmeCopyFor } from "@/constants/programme-copy";

describe("ProgrammeValueSection", () => {
  it("renders all seven value items with the section heading", () => {
    const copy = programmeCopyFor("en").value;

    render(<ProgrammeValueSection copy={copy} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();

    for (const item of copy.items) {
      expect(
        screen.getByRole("heading", { level: 3, name: item.title }),
      ).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }

    expect(copy.items).toHaveLength(7);
  });

  it("renders French titles from program copy", () => {
    const copy = programmeCopyFor("fr").value;

    render(<ProgrammeValueSection copy={copy} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Expertise pratique" }),
    ).toBeInTheDocument();
  });

  it("uses a light surface", () => {
    const copy = programmeCopyFor("en").value;
    const { container } = render(<ProgrammeValueSection copy={copy} />);
    const section = container.querySelector("section#value");

    expect(section).toHaveClass("bg-background");
    expect(section).toHaveClass("text-foreground");
  });
});
