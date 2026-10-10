import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeFounderSpotlightSection } from "@/components/marketing/home-founder-spotlight-section";
import { homeCopyFor } from "@/constants/home-copy";
import type { StartupPublicListItem } from "@/types/startup";

const copy = homeCopyFor("en").founders;

const startup: StartupPublicListItem = {
  id: "s1",
  name: "Chekkit Technologies",
  slug: "chekkit-technologies",
  logo_url: null,
  description: "Product authentication.",
  founded_at: null,
  cohort: "ASIP 2021",
  country_code: "NG",
  sector: "Supply chain",
  founder_names: [],
  cover_image_url: null,
  public_outcome: null,
  featured: true,
  image_focal_x: 50,
  image_focal_y: 50,
};

describe("HomeFounderSpotlightSection", () => {
  it("renders spotlight copy, CTA, real portfolio companies and markets", () => {
    render(
      <HomeFounderSpotlightSection
        locale="en"
        copy={copy}
        countryReach={[
          { countryCode: "NG", founderCount: 18 },
          { countryCode: "KE", founderCount: 4 },
        ]}
        startups={[startup]}
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
      screen.getByRole("link", { name: /Chekkit Technologies/ }),
    ).toHaveAttribute("href", expect.stringContaining("chekkit-technologies"));
    expect(screen.getByText("Kenya")).toBeInTheDocument();
    expect(screen.getAllByText("Nigeria").length).toBeGreaterThan(0);
  });

  it("shows the empty note when no companies are published", () => {
    render(
      <HomeFounderSpotlightSection
        locale="en"
        copy={copy}
        countryReach={[]}
        startups={[]}
      />,
    );

    expect(screen.getByText(copy.empty)).toBeInTheDocument();
  });

  it("localizes the CTA href for French", () => {
    const frCopy = homeCopyFor("fr").founders;
    render(
      <HomeFounderSpotlightSection
        locale="fr"
        copy={frCopy}
        countryReach={[]}
        startups={[]}
      />,
    );

    expect(
      screen.getByRole("link", { name: frCopy.cta.label }),
    ).toHaveAttribute("href", "/fr/founders");
  });
});
