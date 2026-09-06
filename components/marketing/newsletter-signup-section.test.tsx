import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NewsletterSignupSection } from "@/components/marketing/newsletter-signup-section";
import { newsletterSignupLabelsFor } from "@/components/marketing/newsletter-signup-labels";

vi.mock("@/actions/newsletter", () => ({
  subscribeNewsletter: vi.fn(),
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

describe("NewsletterSignupSection", () => {
  it("shows the inactive note and disables the email field when off", () => {
    const labels = newsletterSignupLabelsFor("en");
    render(
      <NewsletterSignupSection
        locale="en"
        enabled={false}
        labels={labels}
        sourcePage="/en/insights"
      />,
    );

    expect(screen.getByText(labels.inactiveNote)).toBeInTheDocument();
    expect(screen.getByLabelText(labels.emailLabel)).toBeDisabled();
  });

  it("keeps the email field enabled when the toggle is on", () => {
    const labels = newsletterSignupLabelsFor("en");
    render(
      <NewsletterSignupSection
        locale="en"
        enabled
        labels={labels}
        sourcePage="/en/insights"
      />,
    );

    expect(screen.queryByText(labels.inactiveNote)).not.toBeInTheDocument();
    expect(screen.getByLabelText(labels.emailLabel)).toBeEnabled();
  });
});
