import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateUserDialog } from "@/components/users/user-dialogs";

const createUser = vi.hoisted(() => vi.fn());
const updateUser = vi.hoisted(() => vi.fn());
const deleteUser = vi.hoisted(() => vi.fn());
const hardDeleteUser = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock("@/actions/users", () => ({
  createUser,
  updateUser,
  deleteUser,
  hardDeleteUser,
}));

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}));

vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

async function openDialog() {
  const user = userEvent.setup();
  render(<CreateUserDialog actorRole="admin" />);
  await user.click(screen.getByRole("button", { name: /create user/i }));
  await screen.findByLabelText("Full name");
  return user;
}

// The trigger and the footer button share a label, so scope to the dialog.
function submit(user: ReturnType<typeof userEvent.setup>) {
  const dialog = within(screen.getByRole("dialog"));
  return user.click(dialog.getByRole("button", { name: /create user/i }));
}

describe("CreateUserDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports validation errors and does not call the action", async () => {
    const user = await openDialog();

    // Submit stays disabled while pristine — dirty the form with a short name.
    await user.type(screen.getByLabelText("Full name"), "A");
    await submit(user);

    expect(
      await screen.findByText("Full name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rejects a password that has no number", { timeout: 10_000 }, async () => {
    const user = await openDialog();

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "onlyletters");
    await submit(user);

    expect(
      await screen.findByText("Password must include a number"),
    ).toBeInTheDocument();
    expect(createUser).not.toHaveBeenCalled();
  });

  it(
    "submits a normalised payload with the default admin role",
    async () => {
      createUser.mockResolvedValue({
        status: "success",
        message: "User created successfully.",
      });

      const user = await openDialog();

      await user.type(screen.getByLabelText("Full name"), "  Ada Lovelace  ");
      await user.type(screen.getByLabelText("Email"), "Ada@Example.com");
      await user.type(
        screen.getByLabelText("Password", { exact: true }),
        "Testpass1",
      );
      await submit(user);

      await waitFor(() => expect(createUser).toHaveBeenCalledTimes(1));
      expect(createUser).toHaveBeenCalledWith({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "Testpass1",
        role: "admin",
      });
      expect(toastSuccess).toHaveBeenCalledWith("User created successfully.");
      await waitFor(() => expect(refresh).toHaveBeenCalled());
    },
    10_000,
  );

  it(
    "surfaces the server error and keeps the dialog open",
    { timeout: 10_000 },
    async () => {
    createUser.mockResolvedValue({
      status: "error",
      message: "A user with this email already exists.",
    });

    const user = await openDialog();

    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(
      screen.getByLabelText("Password", { exact: true }),
      "Testpass1",
    );
    await submit(user);

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(
        "A user with this email already exists.",
      ),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    },
  );
});
