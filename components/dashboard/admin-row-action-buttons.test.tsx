import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminInboxArchiveButton } from "@/components/dashboard/admin-inbox-archive-button";
import { AdminRowActionButtons } from "@/components/dashboard/admin-row-action-buttons";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

function renderWithTooltips(ui: ReactNode) {
  return render(<TooltipProvider delay={0}>{ui}</TooltipProvider>);
}

async function expectOnlyTooltip(label: string) {
  await waitFor(() => {
    const open = document.querySelectorAll(
      '[data-slot="tooltip-content"][data-open]',
    );
    expect(open).toHaveLength(1);
    expect(open[0]).toHaveTextContent(label);
  });
}

describe("editor row action tooltips", () => {
  it("shows only the hovered action", async () => {
    const user = userEvent.setup();
    renderWithTooltips(
      <AdminRowActionButtons
        viewLabel="View Ada"
        editLabel="Edit Ada"
        deleteLabel="Delete Ada"
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.hover(screen.getByRole("button", { name: "View Ada" }));
    await expectOnlyTooltip("View");

    await user.unhover(screen.getByRole("button", { name: "View Ada" }));
    await user.hover(screen.getByRole("button", { name: "Edit Ada" }));
    await expectOnlyTooltip("Edit");

    await user.unhover(screen.getByRole("button", { name: "Edit Ada" }));
    await user.hover(screen.getByRole("button", { name: "Delete Ada" }));
    await expectOnlyTooltip("Delete");
  });

  it("shows Edit on a record edit link", async () => {
    const user = userEvent.setup();
    renderWithTooltips(
      <AdminRowEditLink href="/dashboard/blogs/1" label="Edit North note" />,
    );

    await user.hover(screen.getByRole("button", { name: "Edit North note" }));
    await expectOnlyTooltip("Edit");
  });

  it("shows Delete on the row delete icon, not the confirm copy", async () => {
    const user = userEvent.setup();
    renderWithTooltips(
      <AdminDeleteDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Delete blog?"
        description="This permanently deletes the post."
        confirmLabel="Delete blog"
        triggerLabel="Delete North note"
        isPending={false}
        onConfirm={vi.fn()}
      />,
    );

    await user.hover(screen.getByRole("button", { name: "Delete North note" }));
    await expectOnlyTooltip("Delete");
  });

  it("shows Archive or Unarchive for the inbox control", async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithTooltips(
      <AdminInboxArchiveButton
        id="11111111-1111-4111-8111-111111111111"
        inboxStatus="unread"
        updateAction={vi.fn()}
      />,
    );

    await user.hover(screen.getByRole("button", { name: "Archive" }));
    await expectOnlyTooltip("Archive");

    rerender(
      <TooltipProvider delay={0}>
        <AdminInboxArchiveButton
          id="11111111-1111-4111-8111-111111111111"
          inboxStatus="archived"
          updateAction={vi.fn()}
        />
      </TooltipProvider>,
    );

    await user.hover(screen.getByRole("button", { name: "Unarchive" }));
    await expectOnlyTooltip("Unarchive");
  });
});
