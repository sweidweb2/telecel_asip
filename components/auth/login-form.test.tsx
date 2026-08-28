import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { loginLabelsFor } from "@/components/auth/auth-labels";
import { ROUTES } from "@/constants/routes";

const signIn = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());

vi.mock("@/actions/auth", () => ({ signIn }));

vi.mock("nextjs-toploader/app", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("next=/dashboard/users"),
}));

vi.mock("sonner", () => ({
  toast: { error: toastError, success: toastSuccess },
}));

function renderLoginForm() {
  return render(<LoginForm locale="en" labels={loginLabelsFor("en")} />);
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks submit and shows field errors when the form is empty", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("rejects a malformed email without calling the action", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "Testpass1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("forwards the ?next= destination to signIn and redirects on success", async () => {
    signIn.mockResolvedValue({
      status: "success",
      message: "Signed in.",
      redirectTo: ROUTES.users,
    });

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "Testpass1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    expect(signIn).toHaveBeenCalledWith(
      { email: "admin@example.com", password: "Testpass1" },
      ROUTES.users,
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith(ROUTES.users));
    expect(toastSuccess).toHaveBeenCalledWith("Signed in.");
  });

  it("shows the server message and stays put when sign in fails", async () => {
    signIn.mockResolvedValue({
      status: "error",
      message: "Invalid email or password.",
    });

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "Testpass1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Invalid email or password."),
    );
    expect(push).not.toHaveBeenCalled();
  });
});
