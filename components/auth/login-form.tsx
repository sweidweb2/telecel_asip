"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { signIn } from "@/actions/auth";
import type { LoginLabels } from "@/components/auth/auth-labels";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { TurnstileField } from "@/components/marketing/turnstile-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTACT } from "@/constants/contact";
import type { Locale } from "@/constants/locales";
import { authPath, ROUTES } from "@/constants/routes";
import { useTurnstile } from "@/hooks/use-turnstile";
import { TURNSTILE_LOGIN_ACTION } from "@/types/turnstile";
import { loginSchemaFor, type LoginInput } from "@/validations/auth";

export function LoginForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: LoginLabels;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? ROUTES.dashboard;
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchemaFor(locale)),
    defaultValues: {
      email: "",
      password: "",
      turnstileToken: "",
    },
  });

  const turnstileToken = useWatch({ control, name: "turnstileToken" });
  const turnstile = useTurnstile({
    action: TURNSTILE_LOGIN_ACTION,
    onTokenChange: useCallback(
      (token: string) =>
        setValue("turnstileToken", token, {
          shouldValidate: token !== "",
          shouldDirty: true,
        }),
      [setValue],
    ),
  });

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      try {
        // Prefer watched token — hidden register + setValue can race on submit.
        const payload: LoginInput = {
          email: values.email ?? getValues("email") ?? "",
          password: values.password ?? getValues("password") ?? "",
          turnstileToken:
            turnstileToken || values.turnstileToken || getValues("turnstileToken") || "",
        };
        const result = await signIn(payload, redirectTo);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success(result.message ?? labels.successToast);
        router.push(result.redirectTo ?? ROUTES.dashboard);
        router.refresh();
      } finally {
        turnstile.reset();
      }
    });
  }

  const signupHref = (() => {
    const next = searchParams.get("next");
    const base = authPath(locale, "signup");
    return next ? `${base}?next=${encodeURIComponent(next)}` : base;
  })();

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <GoogleAuthButton
        label={labels.googleLabel}
        loadingLabel={labels.googleLoadingLabel}
        errorMessage={labels.googleError}
        redirectTo={redirectTo}
      />
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>{labels.dividerLabel}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">{labels.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={labels.emailPlaceholder}
          aria-invalid={Boolean(errors.email)}
          disabled={isPending}
          {...register("email", { setValueAs: (value) => value ?? "" })}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">{labels.passwordLabel}</Label>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            placeholder={labels.passwordPlaceholder}
            aria-invalid={Boolean(errors.password)}
            disabled={isPending}
            className="pr-11"
            {...register("password", { setValueAs: (value) => value ?? "" })}
          />
          <button
            type="button"
            className="absolute top-1/2 right-0.5 inline-flex size-9 min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={isPending}
            aria-label={
              isPasswordVisible ? labels.hidePassword : labels.showPassword
            }
            aria-pressed={isPasswordVisible}
            // Keep focus on the password field so the type swap does not glitch.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            <EyeIcon
              className={isPasswordVisible ? "hidden size-4" : "size-4"}
              aria-hidden
            />
            <EyeOffIcon
              className={isPasswordVisible ? "size-4" : "hidden size-4"}
              aria-hidden
            />
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="link"
            className="h-auto min-h-11 px-0 py-0 text-sm font-normal text-muted-foreground sm:min-h-0"
            disabled={isPending}
            onClick={() => setIsForgotOpen(true)}
          >
            {labels.forgotPasswordLink}
          </Button>
        </div>
      </div>
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{labels.forgotPasswordTitle}</DialogTitle>
            <DialogDescription>{labels.forgotPasswordBody}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-1">
            <p className="text-sm font-medium text-foreground">
              {labels.forgotPasswordEmailLabel}
            </p>
            <a
              href={CONTACT.emailHref}
              className="text-sm text-foreground underline-offset-4 hover:underline"
            >
              {CONTACT.email}
            </a>
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 sm:min-h-8"
                />
              }
            >
              {labels.forgotPasswordClose}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input
        type="hidden"
        value={turnstileToken ?? ""}
        readOnly
        aria-hidden
        tabIndex={-1}
      />
      <TurnstileField
        turnstile={turnstile}
        hasToken={Boolean(turnstileToken)}
        hint={labels.turnstileHint}
        error={errors.turnstileToken?.message}
        testId="login-turnstile"
      />
      <Button
        type="submit"
        className="min-h-11 w-full sm:min-h-8"
        disabled={isPending || !turnstileToken}
      >
        {isPending ? (
          <>
            <Loader2Icon className="animate-spin" />
            {labels.submittingLabel}
          </>
        ) : (
          labels.submitLabel
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {labels.noAccountPrompt}{" "}
        <Link
          href={signupHref}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {labels.signUpLink}
        </Link>
      </p>
    </form>
  );
}
