import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteSettingsForm } from "@/components/settings/site-settings-form";

const updateSiteSettings = vi.hoisted(() => vi.fn());
const runBackupNow = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());

vi.mock("@/actions/settings", () => ({
  updateSiteSettings,
  runBackupNow,
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
      <SiteSettingsForm
        openApplications={false}
        newsletterSignupEnabled={false}
        backupTime="off"
      />,
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

  it("shows backup schedule and run now control", () => {
    render(
      <SiteSettingsForm
        openApplications={false}
        newsletterSignupEnabled={false}
        backupTime="daily_03"
      />,
    );

    expect(
      screen.getByRole("button", { name: /run backup now/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/automated backup schedule/i)).toBeTruthy();
  });
});
