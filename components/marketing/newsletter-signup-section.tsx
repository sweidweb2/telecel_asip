"use client";

import { useCallback, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { subscribeNewsletter } from "@/actions/newsletter";
import { TurnstileField } from "@/components/marketing/turnstile-field";
import { Section } from "@/components/marketing/page-elements";
import type { NewsletterSignupLabels } from "@/components/marketing/newsletter-signup-labels";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/constants/locales";
import { useTurnstile } from "@/hooks/use-turnstile";
import { TURNSTILE_NEWSLETTER_ACTION } from "@/types/turnstile";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeInput,
} from "@/validations/newsletter";

type NewsletterSignupSectionProps = {
  locale: Locale;
  enabled: boolean;
  labels: NewsletterSignupLabels;
  sourcePage: string;
};

export function NewsletterSignupSection({
  enabled,
  labels,
  sourcePage,
}: NewsletterSignupSectionProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NewsletterSubscribeInput>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: {
      email: "",
      consent: false,
      sourcePage,
      turnstileToken: "",
    },
  });

  const turnstileToken = useWatch({ control, name: "turnstileToken" });
  const consent = useWatch({ control, name: "consent" });

  const turnstile = useTurnstile({
    action: TURNSTILE_NEWSLETTER_ACTION,
    onTokenChange: useCallback(
      (token: string) =>
        setValue("turnstileToken", token, { shouldValidate: token !== "" }),
      [setValue],
    ),
  });

  function onSubmit(values: NewsletterSubscribeInput) {
    startTransition(async () => {
      try {
        const result = await subscribeNewsletter(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        reset({
          email: "",
          consent: false,
          sourcePage,
          turnstileToken: "",
        });
      } finally {
        turnstile.reset();
      }
    });
  }

  return (
    <Section className="border-t">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {labels.title}
          </h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
            {labels.description}
          </p>
          {!enabled ? (
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              {labels.inactiveNote}
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 lg:col-span-7"
        >
          <div className="grid gap-2">
            <Label htmlFor="newsletter-email">{labels.emailLabel}</Label>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              className="min-h-11"
              placeholder={labels.emailPlaceholder}
              disabled={isPending || !enabled}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex items-start gap-3">
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="newsletter-consent"
                  checked={field.value}
                  disabled={isPending || !enabled}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  className="mt-1 size-5"
                />
              )}
            />
            <Label
              htmlFor="newsletter-consent"
              className="font-normal leading-6"
            >
              {labels.consentLabel}
            </Label>
          </div>
          {errors.consent ? (
            <p className="text-sm text-destructive">{errors.consent.message}</p>
          ) : null}

          {enabled ? (
            <>
              <input type="hidden" {...register("turnstileToken")} />
              <TurnstileField
                turnstile={turnstile}
                hasToken={Boolean(turnstileToken)}
                hint={labels.turnstileHint}
                error={errors.turnstileToken?.message}
                testId="newsletter-turnstile"
              />
            </>
          ) : null}

          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={
              isPending ||
              !enabled ||
              !consent ||
              (enabled && !turnstileToken)
            }
          >
            {isPending ? <Loader2Icon className="animate-spin" /> : null}
            {isPending ? labels.submitting : labels.submit}
          </Button>
        </form>
      </div>
    </Section>
  );
}
