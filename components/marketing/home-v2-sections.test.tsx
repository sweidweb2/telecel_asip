import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeAfricaMap } from "@/components/marketing/home-africa-map";
import {
  HomeAiAdvantageSection,
  HomeFounderStoriesSection,
  HomePathwaysSection,
  HomeProofStrip,
  oneLineProposition,
} from "@/components/marketing/home-v2-sections";
import { homeV2CopyFor } from "@/constants/home-v2-copy";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";
import type { StartupPublicListItem } from "@/types/startup";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const copy = homeV2CopyFor("en");

function startup(overrides: Partial<StartupPublicListItem> = {}): StartupPublicListItem {
  return {
    id: overrides.slug ?? "s1",
    name: "Example Co",
    slug: "example-co",
    logo_url: null,
    description: "Example Co builds payment tools for informal retailers. It started in Lagos.",
    founded_at: null,
    cohort: "ASIP 2023",
    country_code: "NG",
    sector: "FinTech",
    founder_names: ["Ada Founder"],
    cover_image_url: null,
    public_outcome: null,
    featured: false,
    image_focal_x: 50,
    image_focal_y: 50,
    ...overrides,
  };
}

describe("oneLineProposition", () => {
  it("keeps only the first sentence", () => {
    expect(oneLineProposition("One idea here. A second sentence.")).toBe("One idea here.");
  });

  it("caps long sentences at 20 words with an ellipsis", () => {
    const long = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");
    const result = oneLineProposition(long);
    expect(result.endsWith("…")).toBe(true);
    expect(result.replace("…", "").split(" ")).toHaveLength(20);
  });

  it("returns an empty string for an empty description", () => {
    expect(oneLineProposition("")).toBe("");
  });
});

describe("HomeAiAdvantageSection status", () => {
  it("shows the closed status and never says Apply while closed", () => {
    render(<HomeAiAdvantageSection locale="en" copy={copy.ai} intake={intakeCtaFor("en", false)} />);
    expect(screen.getByRole("status")).toHaveTextContent("Applications are not currently open.");
    expect(screen.queryByRole("link", { name: /\bapply\b/i })).not.toBeInTheDocument();
  });

  it("switches to the open status when applications are open", () => {
    render(<HomeAiAdvantageSection locale="en" copy={copy.ai} intake={intakeCtaFor("en", true)} />);
    expect(screen.getByRole("status")).toHaveTextContent("Applications are open.");
  });
});

describe("HomeProofStrip", () => {
  it("renders nothing when no metric is cleared", () => {
    const { container } = render(<HomeProofStrip copy={copy.proof} metrics={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows at most four metrics", () => {
    const metrics = Array.from({ length: 6 }, (_, i) => ({
      id: `m${i}`,
      claim_label: `Metric ${i}`,
      value: String(i + 1),
      unit: null,
    }));
    render(<HomeProofStrip copy={copy.proof} metrics={metrics} />);
    expect(screen.getAllByText(/^Metric \d$/)).toHaveLength(4);
  });
});

describe("HomePathwaysSection", () => {
  const intake = intakeCtaFor("en", false);

  it("exposes the #founders and #investors anchors used by the hero", () => {
    const { container } = render(
      <HomePathwaysSection locale="en" founder={copy.founder} investor={copy.investor} intake={intake} />,
    );
    expect(container.querySelector("#founders")).not.toBeNull();
    expect(container.querySelector("#investors")).not.toBeNull();
  });

  it("hides portfolio counts when they are unavailable or zero", () => {
    const { container, rerender } = render(
      <HomePathwaysSection locale="en" founder={copy.founder} investor={copy.investor} intake={intake} stats={null} />,
    );
    expect(container.querySelector("#investors dl")).toBeNull();

    rerender(
      <HomePathwaysSection
        locale="en"
        founder={copy.founder}
        investor={copy.investor}
        intake={intake}
        stats={{ companies: 0, markets: 0, sectors: 0 }}
      />,
    );
    expect(container.querySelector("#investors dl")).toBeNull();
  });

  it("shows company and market counts, not sectors", () => {
    render(
      <HomePathwaysSection
        locale="en"
        founder={copy.founder}
        investor={copy.investor}
        intake={intake}
        stats={{ companies: 42, markets: 12, sectors: 26 }}
      />,
    );
    expect(screen.getByText(copy.investor.statLabels.companies)).toBeInTheDocument();
    expect(screen.getByText(copy.investor.statLabels.markets)).toBeInTheDocument();
    expect(screen.queryByText(copy.investor.statLabels.sectors)).not.toBeInTheDocument();
  });
});

describe("HomeFounderStoriesSection", () => {
  it("renders nothing without published startups", () => {
    const { container } = render(
      <HomeFounderStoriesSection locale="en" copy={copy.stories} startups={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows five text cards when the lead has no photo, three when it does", () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      startup({ id: `s${i}`, slug: `s${i}`, name: `Company ${i}` }),
    );
    const { unmount } = render(
      <HomeFounderStoriesSection locale="en" copy={copy.stories} startups={many} />,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    unmount();

    const withPhoto = [startup({ id: "p", slug: "p", name: "Photo Co", cover_image_url: "https://example.com/p.jpg" }), ...many];
    render(<HomeFounderStoriesSection locale="en" copy={copy.stories} startups={withPhoto} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent("Photo Co");
  });

  it("shows a one-line proposition instead of the full description", () => {
    render(<HomeFounderStoriesSection locale="en" copy={copy.stories} startups={[startup()]} />);
    expect(screen.getByText("Example Co builds payment tools for informal retailers.")).toBeInTheDocument();
    expect(screen.queryByText(/started in Lagos/)).not.toBeInTheDocument();
  });
});

describe("HomeAfricaMap", () => {
  it("renders nothing without portfolio countries", () => {
    const { container } = render(
      <HomeAfricaMap locale="en" copy={copy.map} portfolioCountries={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("makes only portfolio markets interactive and links to the filtered directory", () => {
    render(<HomeAfricaMap locale="en" copy={copy.map} portfolioCountries={["NG", "ke"]} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Nigeria/ })[0]).toHaveAttribute(
      "href",
      "/en/founders?country=NG",
    );
  });
});
