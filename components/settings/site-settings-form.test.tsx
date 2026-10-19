import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteSettingsForm } from "@/components/settings/site-settings-form";

const updateEditorSiteSettings = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("@/actions/settings", () => ({
  updateEditorSiteSettings,
}));

vi.mock("@/components/dashboard/admin-editor-actions-bar", () => ({
  ADMIN_EDITOR_ACTIONS_SAFE_AREA: "",
  AdminEditorActionsBar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

describe("SiteSettingsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits toggled settings through the server action", async () => {
    updateEditorSiteSettings.mockResolvedValue({
      status: "success",
      message: "Settings saved.",
    });
    const user = userEvent.setup();

    render(
      <SiteSettingsForm
        openApplications={false}
        newsletterSignupEnabled={true}
      />,
    );

    await user.click(screen.getAllByRole("switch")[0]!);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(updateEditorSiteSettings).toHaveBeenCalledTimes(1),
    );
    expect(updateEditorSiteSettings).toHaveBeenCalledWith({
      openApplications: true,
      newsletterSignupEnabled: true,
    });
    expect(toastSuccess).toHaveBeenCalledWith("Settings saved.");
  });

  it("does not show a newsletter signup section", () => {
    render(
      <SiteSettingsForm
        openApplications={false}
        newsletterSignupEnabled={false}
      />,
    );

    expect(screen.queryByText("Newsletter signup")).toBeNull();
    expect(screen.queryByText(/phase 1 — informational only/i)).toBeNull();
    expect(screen.getAllByRole("switch")).toHaveLength(1);
    expect(screen.queryByRole("switch", { name: /newsletter/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /run backup now/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/automated backup schedule/i),
    ).not.toBeInTheDocument();
  });
});
