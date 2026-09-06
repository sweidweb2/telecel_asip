import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/components/marketing/contact-form";
import { contactLabelsFor } from "@/components/marketing/contact-labels";

vi.mock("@/actions/contact-messages", () => ({
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
  it("routes enquiry type through the controlled picker", async () => {
    const onEnquiryTypeChange = vi.fn();
    const user = userEvent.setup();
    const labels = contactLabelsFor("en");

    render(
      <ContactForm
        locale="en"
        labels={labels}
        enquiryType="general"
        onEnquiryTypeChange={onEnquiryTypeChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: /partner enquiry/i }));
    expect(onEnquiryTypeChange).toHaveBeenCalledWith("partner");
  });
});
