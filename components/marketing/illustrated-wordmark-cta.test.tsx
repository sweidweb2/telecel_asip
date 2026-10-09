import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IllustratedWordmarkCta } from "@/components/marketing/illustrated-wordmark-cta";

describe("IllustratedWordmarkCta", () => {
  it("renders the headline and both actions", () => {
    render(
      <IllustratedWordmarkCta
        title="The next chapter starts with the builders."
        description="ASIP is preparing its 2026 chapter."
        primary={{ href: "/en/register-interest", label: "Register interest" }}
        secondary={{ href: "/en/contact", label: "Discuss a partnership" }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "The next chapter starts with the builders.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register interest" })).toHaveAttribute(
      "href",
      "/en/register-interest",
    );
    expect(
      screen.getByRole("link", { name: "Discuss a partnership" }),
    ).toHaveAttribute("href", "/en/contact");
  });

  it("omits the outline action when only one link is passed", () => {
    render(
      <IllustratedWordmarkCta
        title="Meet the founders building Africa’s next chapter."
        description="Explore ventures across ASIP cohorts."
        primary={{ href: "/en/founders", label: "Explore the founders" }}
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
