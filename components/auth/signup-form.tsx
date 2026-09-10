"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useTransition } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { signUp } from "@/actions/auth";
import type { SignupLabels } from "@/components/auth/auth-labels";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { TurnstileField } from "@/components/marketing/turnstile-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/constants/locales";
import { authPath } from "@/constants/routes";
import { useTurnstile } from "@/hooks/use-turnstile";
import { TURNSTILE_SIGNUP_ACTION } from "@/types/turnstile";
import { registerSchemaFor, type RegisterInput } from "@/validations/auth";

export function SignupForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: SignupLabels;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? undefined;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchemaFor(locale)) as Resolver<RegisterInput>,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      turnstileToken: "",
    },
  });

  const turnstileToken = useWatch({ control, name: "turnstileToken" });
  const turnstile = useTurnstile({
    action: TURNSTILE_SIGNUP_ACTION,
    onTokenChange: useCallback(
      (token: string) =>
        setValue("turnstileToken", token, {
          shouldValidate: token !== "",
          shouldDirty: true,
        }),
      [setValue],
    ),
  });

  function onSubmit(values: RegisterInput) {
    startTransition(async () => {
      try {
        const payload: RegisterInput = {
          fullName: values.fullName ?? getValues("fullName") ?? "",
          email: values.email ?? getValues("email") ?? "",
          password: values.password ?? getValues("password") ?? "",
          confirmPassword:
            values.confirmPassword ?? getValues("confirmPassword") ?? "",
          turnstileToken:
            turnstileToken ||
            values.turnstileToken ||
            getValues("turnstileToken") ||
            "",
        };
        const result = await signUp(payload, redirectTo);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success(result.message ?? labels.successToast);

        if (result.redirectTo) {
          router.push(result.redirectTo);
          router.refresh();
          return;
        }

        const loginBase = authPath(locale, "login");
        const loginHref = redirectTo
          ? `${loginBase}?next=${encodeURIComponent(redirectTo)}`
          : loginBase;
        router.push(loginHref);
      } finally {
        turnstile.reset();
      }
    });
  }

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
        <Label htmlFor="fullName">{labels.nameLabel}</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder={labels.namePlaceholder}
          aria-invalid={Boolean(errors.fullName)}
          disabled={isPending}
          {...register("fullName", { setValueAs: (value) => value ?? "" })}
        />
        {errors.fullName ? (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        ) : null}
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
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          disabled={isPending}
          {...register("password", { setValueAs: (value) => value ?? "" })}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">{labels.confirmPasswordLabel}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          disabled={isPending}
          {...register("confirmPassword", {
            setValueAs: (value) => value ?? "",
          })}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>
      <input
        type="hidden"
        name="turnstileToken"
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
        testId="signup-turnstile"
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
        {labels.hasAccountPrompt}{" "}
        <Link
          href={
            redirectTo
              ? `${authPath(locale, "login")}?next=${encodeURIComponent(redirectTo)}`
              : authPath(locale, "login")
          }
          className="text-foreground underline-offset-4 hover:underline"
        >
          {labels.loginLink}
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        {labels.viewerNote}
      </p>
    </form>
  );
}
