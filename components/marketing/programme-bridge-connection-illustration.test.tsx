import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgrammeBridgeConnectionIllustration } from "@/components/marketing/programme-bridge-connection-illustration";

describe("ProgrammeBridgeConnectionIllustration", () => {
  it("renders the charcoal bridge sketch image", () => {
    const { container } = render(<ProgrammeBridgeConnectionIllustration />);
    const img = container.querySelector("img");

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      expect.stringContaining("eligibility-bridge-connection.png"),
    );
  });
});
