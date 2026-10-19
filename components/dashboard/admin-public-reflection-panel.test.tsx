import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminPublicReflectionPanel } from "@/components/dashboard/admin-public-reflection-panel";

describe("AdminPublicReflectionPanel", () => {
  it("shows reflected and unreflected surfaces for a resource", () => {
    render(<AdminPublicReflectionPanel resourceId="impactMetrics" />);

    expect(
      screen.getByRole("heading", { name: "Where impact metrics appear" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Reflected")).toBeInTheDocument();
    expect(screen.getByText("Not reflected")).toBeInTheDocument();
    expect(screen.getByText("/{locale} (home)")).toBeInTheDocument();
    expect(screen.getByText("/{locale}/impact")).toBeInTheDocument();
  });
});
