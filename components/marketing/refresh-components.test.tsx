import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CountUpStat } from "@/components/marketing/count-up-stat";
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

  it("keeps the phone pathway bar inert until the hero scrolls away", () => {
    render(
      <MobilePathwayBar
        prompt="Choose your route"
        investor={{ href: "#investors", label: "I'm an Investor" }}
        startup={{ href: "#founders", label: "I'm a Founder" }}
      />,
    );
    const bar = screen.getByRole("group", { hidden: true });
    expect(bar).toHaveAttribute("inert");
    expect(bar).toHaveClass("translate-y-full", "md:hidden");
  });

  it("lists the Founder route before the Investor route, matching the hero", () => {
    render(
      <MobilePathwayBar
        prompt="Choose your route"
        investor={{ href: "#investors", label: "I'm an Investor" }}
        startup={{ href: "#founders", label: "I'm a Founder" }}
      />,
    );
    const links = screen.getAllByRole("link", { hidden: true });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#founders", "#investors"]);
  });
});
