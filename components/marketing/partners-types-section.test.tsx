import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PartnersTypesSection } from "@/components/marketing/partners-types-section";
import { partnersCopyFor } from "@/constants/partners-copy";

describe("PartnersTypesSection", () => {
  it("renders all six partner type routes with value and examples", () => {
    const copy = partnersCopyFor("en").types;

    render(<PartnersTypesSection copy={copy} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();

    for (const row of copy.rows) {
      expect(screen.getAllByText(row.type).length).toBeGreaterThan(0);
      expect(screen.getAllByText(row.value).length).toBeGreaterThan(0);
      expect(screen.getAllByText(row.examples).length).toBeGreaterThan(0);
    }
  });
});
