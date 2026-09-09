import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PartnersPageContent } from "@/components/marketing/partners-page-content";
import { partnersCopyFor } from "@/constants/partners-copy";
import type { PartnerPublicItem } from "@/types/partner";

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: {
    alt: string;
    src?: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
  }) => {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props;
    void [_fill, _priority, _sizes];
    // eslint-disable-next-line @next/next/no-img-element -- Test double for next/image.
    return <img alt={alt} {...rest} />;
  },
}));

const activePartner: PartnerPublicItem = {
  id: "p1",
  name: "Cloudworx",
  org: null,
  type: "technology",
  logo_url: "/partners/cloudworx.png",
  link: "https://example.com",
};
const historicalPartner: PartnerPublicItem = {
  id: "p2",
  name: "Former Partner",
  org: "Former Co",
  type: "corporate",
  logo_url: null,
  link: null,
};

describe("PartnersPageContent", () => {
  it("assembles hero, proposition, types, network, historical, and CTA", () => {
    const copy = partnersCopyFor("en");

    render(
      <PartnersPageContent
        locale="en"
        active={[activePartner]}
        historical={[historicalPartner]}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: `${copy.hero.titleLead} ${copy.hero.titleAccent}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.proposition.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.types.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: copy.logos.title,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /previous chapters/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: copy.ctaSection.title }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: copy.hero.cta.label }).length,
    ).toBeGreaterThan(0);
  });
});
