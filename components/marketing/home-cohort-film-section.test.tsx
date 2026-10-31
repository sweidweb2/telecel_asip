import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HomeCohortFilmSection } from "@/components/marketing/home-cohort-film-section";
import { HOME_COHORT_FILM } from "@/constants/home-cohort-film";
import { homeCopyFor } from "@/constants/home-copy";

describe("HomeCohortFilmSection", () => {
  const copy = homeCopyFor("en").cohortFilm;

  it("renders framing copy and a play control without mounting the video", () => {
    const { container } = render(
      <HomeCohortFilmSection copy={copy} />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: copy.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(copy.description)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: copy.playLabel }),
    ).toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("mounts the video source only after play is pressed", async () => {
    const user = userEvent.setup();
    HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <HomeCohortFilmSection copy={copy} />,
    );

    await user.click(screen.getByRole("button", { name: copy.playLabel }));

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video?.querySelector("source")?.getAttribute("src")).toBe(
      HOME_COHORT_FILM.src,
    );
  });
});
