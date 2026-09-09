import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteSettingsForm } from "@/components/settings/site-settings-form";

const updateSiteSettings = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("@/actions/settings", () => ({
  updateSiteSettings,
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
    updateSiteSettings.mockResolvedValue({
      status: "success",
      message: "Settings saved.",
    });
    const user = userEvent.setup();

    render(
      <SiteSettingsForm openApplications={false} backupTime="off" />,
    );

    await user.click(screen.getAllByRole("switch")[0]!);
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateSiteSettings).toHaveBeenCalledTimes(1));
    expect(updateSiteSettings).toHaveBeenCalledWith({
      openApplications: true,
      newsletterSignupEnabled: false,
      backupTime: "off",
    });
    expect(toastSuccess).toHaveBeenCalledWith("Settings saved.");
  });

  it("shows newsletter as a phase 1 note, not a toggle", () => {
    render(
      <SiteSettingsForm openApplications={false} backupTime="weekly_sun_03" />,
    );

    expect(screen.getByText(/hidden — phase 1/i)).toBeTruthy();
    expect(screen.queryByRole("switch", { name: /newsletter/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /run backup now/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/automated backup schedule/i)).toBeTruthy();
  });
});
