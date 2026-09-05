import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeAll } from "vitest";

import { ImpactCaseStudiesSection } from "@/components/marketing/impact-case-studies-section";
import { impactCopyFor } from "@/constants/impact-copy";
import type { ImpactCaseStudyPublic } from "@/types/founder-story";

const copy = impactCopyFor("en").caseStudy;

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

function story(
  id: string,
  name: string,
  extras: Partial<ImpactCaseStudyPublic> = {},
): ImpactCaseStudyPublic {
  return {
    id,
    startupId: id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    founderNames: [],
    sector: "Health",
    country: "KE",
    coverImageUrl: null,
    imageFocalX: 50,
    imageFocalY: 50,
    barrier: "A specific operating barrier.",
    support: "A named ASIP introduction.",
    outcome: "A verified next step.",
    stat: null,
    status: "live",
    ...extras,
  };
}

describe("ImpactCaseStudiesSection", () => {
  it("shows reserved coming-soon seats instead of generic success copy when empty", () => {
    render(
      <ImpactCaseStudiesSection locale="en" copy={copy} stories={[]} />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(copy.comingSoon)).toHaveLength(3);
    expect(screen.queryByText(copy.body)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: copy.readStory }),
    ).not.toBeInTheDocument();
  });

  it("renders published stories and load more when there are more than three", async () => {
    const user = userEvent.setup();
    const stories = [
      story("1", "Primed"),
      story("2", "Weza"),
      story("3", "Qataloog"),
      story("4", "Proxalys"),
    ];

    render(
      <ImpactCaseStudiesSection locale="en" copy={copy} stories={stories} />,
    );

    expect(screen.getByText("Primed")).toBeInTheDocument();
    expect(screen.getByText("Qataloog")).toBeInTheDocument();
    expect(screen.queryByText("Proxalys")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: copy.loadMore }));
    expect(screen.getByText("Proxalys")).toBeInTheDocument();
  });
});
