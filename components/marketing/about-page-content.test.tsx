import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AboutCeoMessageSection } from "@/components/marketing/about-ceo-message-section";
import { AboutPageContent } from "@/components/marketing/about-page-content";
import { marketingCopyFor } from "@/constants/marketing-copy";

describe("AboutPageContent", () => {
  it("renders the approved about narrative and hides the unpublished leadership message", () => {
    render(
      <AboutPageContent locale="en" copy={marketingCopyFor("en", "about")} />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Supporting the founders who are shaping Africa’s next chapter.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Telecel Group Program supporting African founders/i)
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "Explore the portfolio" }).length,
    ).toBeGreaterThan(0);
    for (const name of [
      "Backing founders, building for Africa.",
      "Help ambitious founders build stronger companies.",
      "African technology companies built for local relevance and global scale.",
      "A Telecel Group Program.",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    for (const year of ["2019", "2025", "2026"]) {
      expect(screen.getByText(year)).toBeInTheDocument();
    }
    expect(screen.getByText(/Portfolio Support Year/)).toBeInTheDocument();

    expect(
      screen.queryByLabelText(/Leadership portrait/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /leadership/i })).not.toBeInTheDocument();
  });
});

describe("AboutCeoMessageSection", () => {
  it("renders nothing until approved copy is published", () => {
    const { container } = render(
      <AboutCeoMessageSection
        message={{
          published: false,
          imageLabel: "Leadership portrait, to be supplied by Telecel Group",
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the approved message and image treatment when published", () => {
    render(
      <AboutCeoMessageSection
        message={{
          published: true,
          eyebrow: "Leadership",
          title: "A message from Telecel Group",
          paragraphs: ["Approved leadership copy for the about page."],
          attribution: "Jane Example",
          role: "Group leadership",
          imageLabel: "Approved leadership portrait",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "A message from Telecel Group" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Approved leadership copy for the about page."),
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Example")).toBeInTheDocument();
    expect(screen.getByLabelText("Approved leadership portrait")).toBeInTheDocument();
  });
});
