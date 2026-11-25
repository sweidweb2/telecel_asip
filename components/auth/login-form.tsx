"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { signIn } from "@/actions/auth";
import type { LoginLabels } from "@/constants/auth-labels";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
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
import { authPath, publicPath } from "@/constants/routes";
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
  const redirectTo = searchParams.get("next") ?? undefined;
  const homePath = publicPath(locale, "");
  const [isPending, startTransition] = useTransition();
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchemaFor(locale)) as Resolver<LoginInput>,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginInput) {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await signIn(values, redirectTo);

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        toast.success(result.message ?? labels.successToast);
        router.push(result.redirectTo ?? homePath);
        router.refresh();
      } catch {
        toast.error(
          locale === "fr"
            ? "Une erreur s’est produite. Veuillez réessayer."
            : "Something went wrong. Please try again.",
        );
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
          autoComplete="current-password"
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
