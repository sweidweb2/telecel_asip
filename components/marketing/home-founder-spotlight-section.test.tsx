import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeFounderSpotlightSection } from "@/components/marketing/home-founder-spotlight-section";
import { homeCopyFor } from "@/constants/home-copy";
import { labAfricaBlueprintCopyFor } from "@/constants/lab-africa-blueprint-copy";

const copy = homeCopyFor("en").founders;

describe("HomeFounderSpotlightSection", () => {
  it("renders spotlight copy, CTA, and light ecosystem blueprint", () => {
    const blueprint = labAfricaBlueprintCopyFor("en");

    render(
      <HomeFounderSpotlightSection
        locale="en"
        copy={copy}
        countryReach={[
          { countryCode: "NG", founderCount: 18 },
          { countryCode: "KE", founderCount: 4 },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.cta.label })).toHaveAttribute(
      "href",
      "/en/founders",
    );
    expect(screen.getByText("Spotlight")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /Verified ASIP public portfolio footprint.*Nigeria: 18.*Kenya: 4/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(blueprint.titleBlock.title)).toBeInTheDocument();
    expect(screen.getByText(blueprint.titleBlock.detail)).toBeInTheDocument();
  });

  it("localizes the CTA href for French", () => {
    const frCopy = homeCopyFor("fr").founders;
    render(
      <HomeFounderSpotlightSection locale="fr" copy={frCopy} countryReach={[]} />,
    );

    expect(
      screen.getByRole("link", { name: frCopy.cta.label }),
    ).toHaveAttribute("href", "/fr/founders");
  });
});
