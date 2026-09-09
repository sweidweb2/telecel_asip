import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  FLOAT_TILE_HALF,
  layoutFloatField,
  PartnersNetwork,
  truncatePartnerCardName,
} from "@/components/marketing/partners-network";
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

const partners: PartnerPublicItem[] = [
  {
    id: "p1",
    name: "Cloudworx",
    org: null,
    type: "technology",
    logo_url: "/partners/cloudworx.png",
    link: "https://example.com",
  },
  {
    id: "p2",
    name: "FMO Ventures",
    org: "FMO",
    type: "investors",
    logo_url: "/partners/fmo-ventures.png",
    link: null,
  },
  {
    id: "p3",
    name: "Accelerator²",
    org: null,
    type: "corporate",
    logo_url: "/partners/a2.png",
    link: null,
  },
];

describe("truncatePartnerCardName", () => {
  it("keeps short names and truncates longer ones at 15 chars", () => {
    expect(truncatePartnerCardName("Cloudworx")).toBe("Cloudworx");
    expect(truncatePartnerCardName("Telecel Innovation Hub")).toBe(
      "Telecel Innovat...",
    );
    expect(truncatePartnerCardName("123456789012345")).toBe("123456789012345");
    expect(truncatePartnerCardName("1234567890123456")).toBe(
      "123456789012345...",
    );
  });
});

describe("layoutFloatField", () => {
  it("keeps tile AABBs from intersecting", () => {
    const { slots } = layoutFloatField(14);
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        const a = slots[i]!;
        const b = slots[j]!;
        const overlapX =
          Math.abs(a.cx - b.cx) < FLOAT_TILE_HALF.w * 2;
        const overlapY =
          Math.abs(a.cy - b.cy) < FLOAT_TILE_HALF.h * 2;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });

  it("keeps equal top and bottom padding around the logo field", () => {
    const { heightRem, slots } = layoutFloatField(14);
    const tops = slots.map((slot) => slot.cy - FLOAT_TILE_HALF.h);
    const bottoms = slots.map((slot) => slot.cy + FLOAT_TILE_HALF.h);
    const padTop = Math.min(...tops);
    const padBottom = heightRem - Math.max(...bottoms);
    expect(padTop).toBeCloseTo(padBottom, 5);
  });
});

describe("PartnersNetwork", () => {
  it("defaults to All and filters by type tab", async () => {
    const user = userEvent.setup();
    const copy = partnersCopyFor("en");

    render(
      <PartnersNetwork
        locale="en"
        partners={partners}
        typeRows={copy.types.rows}
      />,
    );

    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute(
      "data-active",
      "",
    );
    expect(screen.getAllByAltText(/Cloudworx/i).length).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/FMO Ventures/i).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("tab", { name: "Technology partners" }));

    expect(screen.getAllByAltText(/Cloudworx/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByAltText(/FMO Ventures/i)).toHaveLength(0);
    expect(screen.queryAllByAltText(/Accelerator/i)).toHaveLength(0);
  });

  it("shows a truncated name card when a partner has no logo", () => {
    const copy = partnersCopyFor("en");
    const noLogo: PartnerPublicItem[] = [
      {
        id: "n1",
        name: "Very Long Partner Org Name",
        org: null,
        type: "technology",
        logo_url: null,
        link: null,
      },
    ];

    render(
      <PartnersNetwork
        locale="en"
        partners={noLogo}
        typeRows={copy.types.rows}
      />,
    );

    expect(screen.getAllByText("Very Long Partn...").length).toBeGreaterThan(0);
    expect(screen.queryByAltText(/Very Long/i)).not.toBeInTheDocument();
  });
});
