import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ImpactCaseStudyCard } from "@/components/marketing/impact-case-study-card";
import { impactCopyFor } from "@/constants/impact-copy";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";

// The card still supports a pending seat; give it a label for these tests.
const copy = {
  ...impactCopyFor("en").caseStudy,
  comingSoon: "Founder story coming soon",
};

function story(
  overrides: Partial<ImpactCaseStudyPublic> = {},
): ImpactCaseStudyPublic {
  return {
    id: "story-1",
    startupId: "startup-1",
    title: "From introductions to institutional growth",
    name: "Herconomy",
    slug: "herconomy",
    founderNames: ["Adaora"],
    sector: "Fintech",
    country: "NG",
    coverImageUrl: null,
    imageFocalX: 50,
    imageFocalY: 50,
    barrier: "Raising capital without a local investor network.",
    support: "ASIP opened mentor and customer introductions.",
    outcome: "The team closed a first institutional round.",
    stat: "$974K revenue",
    status: "live",
    ...overrides,
  };
}

describe("ImpactCaseStudyCard", () => {
  it("foregrounds the founder story and links through in Telecel red", () => {
    render(
      <ImpactCaseStudyCard locale="en" copy={copy} story={story()} />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "From introductions to institutional growth" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Adaora")).toBeInTheDocument();
    expect(screen.getByText("Fintech")).toBeInTheDocument();
    expect(screen.getByText("NG")).toBeInTheDocument();
    expect(
      screen.queryByText("Raising capital without a local investor network."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(copy.steps.barrier)).not.toBeInTheDocument();
    expect(screen.queryByText(copy.steps.support)).not.toBeInTheDocument();
    expect(screen.queryByText(copy.steps.outcome)).not.toBeInTheDocument();
    expect(screen.getByText("$974K revenue")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Herconomy From introductions to institutional growth.*Read full story/i,
      }),
    ).toHaveAttribute("href", "/en/founders/herconomy");
  });

  it("keeps layout when outcome, stat, and tags are missing", () => {
    render(
      <ImpactCaseStudyCard
        locale="en"
        copy={copy}
        story={story({
          sector: null,
          country: null,
          outcome: null,
          stat: null,
          founderNames: [],
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "From introductions to institutional growth" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("$974K revenue")).not.toBeInTheDocument();
    expect(screen.queryByText(copy.steps.barrier)).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Herconomy From introductions to institutional growth.*Read full story/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders a pending seat with name and tags, without fake copy", () => {
    render(
      <ImpactCaseStudyCard
        locale="en"
        copy={copy}
        story={story({
          status: "pending",
          barrier: null,
          support: null,
          outcome: null,
          stat: null,
          coverImageUrl: null,
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "From introductions to institutional growth" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fintech")).toBeInTheDocument();
    expect(screen.getByText("NG")).toBeInTheDocument();
    expect(screen.getByText(copy.comingSoon)).toBeInTheDocument();
    expect(screen.queryByText("$974K revenue")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(copy.steps.barrier)).not.toBeInTheDocument();
  });

  it("renders an anonymous reserved seat without a fake founder name", () => {
    render(<ImpactCaseStudyCard locale="en" copy={copy} />);

    expect(screen.getByText(copy.comingSoon)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
