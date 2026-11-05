import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BentoCard, BentoGrid } from "@/components/marketing/bento";
import { CountUpStat } from "@/components/marketing/count-up-stat";
import { MarqueeStrip } from "@/components/marketing/marquee-strip";
import { MobilePathwayBar } from "@/components/marketing/mobile-pathway-bar";
import { QuoteCard } from "@/components/marketing/quote-card";

class MockObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("refresh phase 2 components", () => {
  it("spans bento cards across the six-column grid", () => {
    render(
      <BentoGrid>
        <BentoCard span={4} tall tone="mint">
          Mentors
        </BentoCard>
      </BentoGrid>,
    );
    const card = screen.getByText("Mentors");
    expect(card).toHaveClass("md:col-span-4", "md:row-span-2");
  });

  it("renders a quote with attribution as a figure", () => {
    render(<QuoteCard quote="We found our first enterprise customer." name="Ada" role="Founder, Example" />);
    const figure = screen.getByRole("figure");
    expect(within(figure).getByText("We found our first enterprise customer.")).toBeInTheDocument();
    expect(within(figure).getByText("Founder, Example")).toBeInTheDocument();
  });

  it("server-renders the final stat value for screen readers", () => {
    render(<CountUpStat value={1200} suffix="+" label="founders reached" />);
    expect(screen.getByText("1,200+ founders reached")).toHaveClass("sr-only");
  });

  it("reads the ticker list once and hides the loop copy", () => {
    render(<MarqueeStrip items={["Ghana", "Kenya"]} label="Countries in the ASIP portfolio" />);
    const region = screen.getByRole("region", { name: "Countries in the ASIP portfolio" });
    const lists = region.querySelectorAll("ul");
    expect(lists).toHaveLength(2);
    expect(lists[0]).not.toHaveAttribute("aria-hidden");
    expect(lists[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("renders nothing for an empty ticker", () => {
    const { container } = render(<MarqueeStrip items={[]} label="Empty" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the phone pathway bar inert until the hero scrolls away", () => {
    render(
      <MobilePathwayBar
        prompt="I am"
        investor={{ href: "/en/founders", label: "Investor" }}
        startup={{ href: "/en/register-interest", label: "Startup" }}
      />,
    );
    const bar = screen.getByRole("group", { hidden: true });
    expect(bar).toHaveAttribute("inert");
    expect(bar).toHaveClass("translate-y-full", "md:hidden");
  });
});
