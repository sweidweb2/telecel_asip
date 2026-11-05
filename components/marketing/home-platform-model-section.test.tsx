import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HomePlatformModelSection } from "@/components/marketing/home-platform-model-section";
import { homeCopyFor } from "@/constants/home-copy";

vi.mock("@/components/marketing/platform-stage-carousel", () => ({
  PlatformStageCarousel: ({
    activeStepId,
    onStepSelect,
  }: {
    activeStepId: string;
    onStepSelect: (id: string) => void;
  }) => (
    <div
      data-testid="platform-stage-carousel"
      data-active-step={activeStepId}
    >
      <button type="button" onClick={() => onStepSelect("connect")}>
        Carousel Connect
      </button>
      <button
        type="button"
        aria-label="Next stage"
        onClick={() => onStepSelect("build")}
      >
        Next
      </button>
    </div>
  ),
}));

const copy = homeCopyFor("en").platform;

describe("HomePlatformModelSection", () => {
  it("renders platform title and the first step in the spinner hub", () => {
    render(<HomePlatformModelSection copy={copy} />);

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();

    const first = copy.steps[0]!;
    expect(screen.getByText(first.title)).toBeInTheDocument();
    expect(screen.getByTestId("platform-stage-carousel")).toHaveAttribute(
      "data-active-step",
      first.id,
    );
  });

  it("updates selection when a spinner option is pressed", async () => {
    const user = userEvent.setup();
    render(<HomePlatformModelSection copy={copy} />);

    await user.click(screen.getByRole("button", { name: /05\s*Scale/i }));

    expect(screen.getByTestId("platform-stage-carousel")).toHaveAttribute(
      "data-active-step",
      "scale",
    );
    expect(
      screen.getByRole("button", { name: /05\s*Scale/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("syncs spinner selection when a carousel slide is chosen", async () => {
    const user = userEvent.setup();
    render(<HomePlatformModelSection copy={copy} />);

    await user.click(screen.getByRole("button", { name: "Carousel Connect" }));

    expect(
      screen.getByRole("button", { name: /03\s*Open access/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("platform-stage-carousel")).toHaveAttribute(
      "data-active-step",
      "connect",
    );
  });

  it("syncs spinner when carousel next arrow advances the stage", async () => {
    const user = userEvent.setup();
    render(<HomePlatformModelSection copy={copy} />);

    await user.click(screen.getByRole("button", { name: "Next stage" }));

    expect(
      screen.getByRole("button", { name: /02\s*Build/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("platform-stage-carousel")).toHaveAttribute(
      "data-active-step",
      "build",
    );
  });

  it("marks previous spinner numbers as reached when a later step is active", async () => {
    const user = userEvent.setup();
    render(<HomePlatformModelSection copy={copy} />);

    await user.click(screen.getByRole("button", { name: /03\s*Open access/i }));

    const discover = screen.getByRole("button", { name: /01\s*Discover/i });
    const build = screen.getByRole("button", { name: /02\s*Build/i });
    const connect = screen.getByRole("button", { name: /03\s*Open access/i });
    const commercialise = screen.getByRole("button", {
      name: /04\s*Commercialize/i,
    });

    expect(discover).toHaveClass("bg-white");
    expect(build).toHaveClass("bg-white");
    expect(connect).toHaveClass("bg-white", "scale-110");
    expect(commercialise).toHaveClass("bg-asip-ink");
  });

  it("loops from last stage back to first via spinner selection", async () => {
    const user = userEvent.setup();
    render(<HomePlatformModelSection copy={copy} />);

    await user.click(screen.getByRole("button", { name: /05\s*Scale/i }));
    expect(screen.getByTestId("platform-stage-carousel")).toHaveAttribute(
      "data-active-step",
      "scale",
    );

    await user.click(screen.getByRole("button", { name: /01\s*Discover/i }));
    expect(screen.getByTestId("platform-stage-carousel")).toHaveAttribute(
      "data-active-step",
      "discover",
    );
  });
});
