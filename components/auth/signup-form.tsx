"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useTransition } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { signUp } from "@/actions/auth";
import type { SignupLabels } from "@/constants/auth-labels";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import type { Locale } from "@/constants/locales";
import { authPath } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  REGISTER_ACCOUNT_TYPES,
  registerSchemaFor,
  type RegisterAccountType,
  type RegisterInput,
} from "@/validations/auth";

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
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchemaFor(locale)) as Resolver<RegisterInput>,
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      type: "startup",
    },
  });

  function onSubmit(values: RegisterInput) {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await signUp(values, redirectTo);

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
      } catch {
        toast.error(
          locale === "fr"
            ? "Une erreur s’est produite. Veuillez réessayer."
            : "Something went wrong. Please try again.",
        );
      }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-2">
        <Label id="account-type-label">{labels.accountTypeLabel}</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div
              role="group"
              aria-labelledby="account-type-label"
              className="grid grid-cols-2 gap-2"
            >
              {REGISTER_ACCOUNT_TYPES.map((option) => {
                const isSelected = field.value === option;
                const optionLabel =
                  option === "startup"
                    ? labels.startupLabel
                    : labels.investorLabel;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={isPending}
                    aria-pressed={isSelected}
                    onClick={() =>
                      field.onChange(option as RegisterAccountType)
                    }
                    className={cn(
                      buttonVariants({
                        variant: isSelected ? "default" : "outline",
                        size: "default",
                      }),
                      "min-h-11 w-full",
                    )}
                  >
                    {optionLabel}
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.type ? (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        ) : null}
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
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder={labels.passwordPlaceholder}
          aria-invalid={Boolean(errors.password)}
          disabled={isPending}
          showPasswordLabel={labels.showPassword}
          hidePasswordLabel={labels.hidePassword}
          {...register("password", { setValueAs: (value) => value ?? "" })}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">{labels.confirmPasswordLabel}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          disabled={isPending}
          showPasswordLabel={labels.showPassword}
          hidePasswordLabel={labels.hidePassword}
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
      <Button
        type="submit"
        className="min-h-11 w-full sm:min-h-8"
        disabled={isPending}
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
