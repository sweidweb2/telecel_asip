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

    // Text Pack v2 locked About copy.
    expect(
      screen.getByRole("heading", { level: 1, name: "Started in 2019. Still building." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/launched in Barcelona/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Explore the portfolio" }).length,
    ).toBeGreaterThan(0);
    for (const name of [
      "Built around founders who know the problem first-hand.",
      "Help ambitious founders build stronger companies.",
      "African technology companies built for local relevance and global scale.",
      "A Telecel Group programme.",
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
