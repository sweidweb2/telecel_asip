import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeAudienceSection } from "@/components/marketing/programme-audience-section";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { programmeCopyFor } from "@/constants/programme-copy";

describe("ProgrammeAudienceSection", () => {
  it("renders audience copy, mentor image, and register CTA", () => {
    const copy = programmeCopyFor("en").audience;

    render(
      <ProgrammeAudienceSection
        locale="en"
        copy={copy}
        openApplications={false}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();
    expect(screen.getByAltText(MARKETING_MEDIA.programme.alt.en)).toHaveAttribute(
      "src",
      expect.stringContaining("programme-mentor"),
    );
    expect(
      screen.getByRole("link", { name: /register interest/i }),
    ).toHaveAttribute("href", "/en/register-interest");

    for (const item of copy.highlights) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("promotes Apply when applications are open", () => {
    const copy = programmeCopyFor("en").audience;

    render(
      <ProgrammeAudienceSection locale="en" copy={copy} openApplications />,
    );

    expect(
      screen.getByRole("link", { name: /apply to asip/i }),
    ).toHaveAttribute("href", "/en/apply");
  });
});
