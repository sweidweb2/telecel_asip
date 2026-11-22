import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/marketing/contact-form";
import { contactLabelsFor } from "@/components/marketing/contact-labels";

vi.mock("@/actions/submit-contact-message", () => ({
  submitContactMessage: vi.fn(),
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

describe("ContactForm", () => {
  it("owns enquiry type state via the route picker", async () => {
    const user = userEvent.setup();
    const labels = contactLabelsFor("en");

    render(<ContactForm locale="en" labels={labels} />);

    const partner = screen.getByRole("radio", { name: /investor \/ partner enquiry/i });
    await user.click(partner);
    expect(partner).toBeChecked();
  });
});
