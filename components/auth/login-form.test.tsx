import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { loginLabelsFor } from "@/constants/auth-labels";
import { ROUTES } from "@/constants/routes";

const signIn = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());
const toastError = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const turnstileToken = vi.hoisted(() => ({ value: "test-turnstile-token" }));

vi.mock("@/actions/auth", () => ({ signIn, signInWithGoogle: vi.fn() }));

vi.mock("@/hooks/use-turnstile", async () => {
  const React = await import("react");
  return {
    useTurnstile: ({
      onTokenChange,
    }: {
      onTokenChange: (token: string) => void;
    }) => {
      React.useEffect(() => {
        onTokenChange(turnstileToken.value);
      }, [onTokenChange]);
      return {
        siteKey: "test-site-key",
        setContainer: vi.fn(),
        render: vi.fn(),
        reset: vi.fn(),
      };
    },
  };
});

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
    turnstileToken.value = "test-turnstile-token";
  });

  it("blocks submit when the security check has no token", async () => {
    turnstileToken.value = "";
    renderLoginForm();

    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("rejects a malformed email without calling the action", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "Testpass1");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled(),
    );
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
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(signIn).toHaveBeenCalledTimes(1));
    expect(signIn).toHaveBeenCalledWith(
      {
        email: "admin@example.com",
        password: "Testpass1",
        turnstileToken: "turnstile-widget-disabled",
      },
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
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled(),
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Invalid email or password."),
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("toggles password visibility with the eye control", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("placeholder", "Enter your password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("opens the forgot-password dialog with the contact email", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: "Forgot password?" }));

    expect(
      await screen.findByRole("heading", { name: "Reset password" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "info@telecelgroup.com" }),
    ).toHaveAttribute("href", "mailto:info@telecelgroup.com");
  });
});
