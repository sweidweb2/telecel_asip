import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeAudienceSection } from "@/components/marketing/programme-audience-section";
import { MARKETING_MEDIA } from "@/constants/marketing-media";
import { programmeCopyFor } from "@/constants/programme-copy";
import { intakeCtaFor } from "@/lib/marketing/intake-cta";

describe("ProgrammeAudienceSection", () => {
  it("renders audience copy, mentor image, and register CTA", () => {
    const copy = programmeCopyFor("en").audience;
    const intake = intakeCtaFor("en", false);

    render(
      <ProgrammeAudienceSection
        locale="en"
        copy={copy}
        intake={intake}
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
      screen.getByRole("link", { name: intake.label }),
    ).toHaveAttribute("href", intake.href);

    for (const item of copy.highlights) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("promotes Apply when applications are open", () => {
    const copy = programmeCopyFor("en").audience;
    const intake = intakeCtaFor("en", true);

    render(
      <ProgrammeAudienceSection locale="en" copy={copy} intake={intake} />,
    );

    expect(
      screen.getByRole("link", { name: intake.label }),
    ).toHaveAttribute("href", intake.href);
  });

  it("uses the home platform ink primary surface", () => {
    const copy = programmeCopyFor("en").audience;
    const { container } = render(
      <ProgrammeAudienceSection
        locale="en"
        copy={copy}
        intake={intakeCtaFor("en", false)}
      />,
    );
    const section = container.querySelector("section#audience");

    expect(section).toHaveClass("bg-[#14333b]");
    expect(section).toHaveClass("text-white");
  });
});
