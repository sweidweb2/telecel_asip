import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeImpactYearsSection } from "@/components/marketing/home-impact-years-section";
import { homeCopyFor } from "@/constants/home-copy";

describe("HomeImpactYearsSection", () => {
  const copy = homeCopyFor("en");

  it("still shows framing when there are no homepage metrics", () => {
    render(
      <HomeImpactYearsSection copy={copy.impactYears} metrics={[]} />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.impactYears.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.impactYears.description)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders framing copy and metric cells when metrics exist", () => {
    render(
      <HomeImpactYearsSection
        copy={copy.impactYears}
        metrics={[
          {
            id: "m1",
            value: "42",
            unit: null,
            claim_label: "startups supported",
          },
          {
            id: "m2",
            value: "9,600",
            unit: "jobs",
            claim_label: "roles created across the portfolio",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.impactYears.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.impactYears.description)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("startups supported")).toBeInTheDocument();
    expect(screen.getByText("9,600")).toBeInTheDocument();
    expect(screen.getByText("jobs")).toBeInTheDocument();
  });
});
