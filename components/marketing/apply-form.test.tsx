import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApplyForm } from "@/components/marketing/apply-form";
import { applyLabelsFor } from "@/components/marketing/apply-labels";

vi.mock("@/actions/submit-application", () => ({
  submitApplication: vi.fn(),
}));
vi.mock("@/actions/submit-interest-registration", () => ({
  submitInterestRegistration: vi.fn(),
}));
vi.mock("@/hooks/use-turnstile", () => ({
  useTurnstile: () => ({
    siteKey: "",
    setContainer: vi.fn(),
    render: vi.fn(),
    reset: vi.fn(),
  }),
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("ApplyForm", () => {
  it("keeps Register Interest short: no long-form pitch field (Text Pack v2)", () => {
    render(
      <ApplyForm
        locale="en"
        mode="register"
        labels={applyLabelsFor("en", "register")}
      />,
    );
    expect(screen.queryByLabelText(/short note/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/problem & product/i)).not.toBeInTheDocument();
  });

  it("shows apply narrative fields in apply mode", () => {
    render(
      <ApplyForm
        locale="en"
        mode="apply"
        labels={applyLabelsFor("en", "apply")}
      />,
    );
    expect(screen.getByLabelText(/problem & product/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/short note/i)).not.toBeInTheDocument();
  });
});
