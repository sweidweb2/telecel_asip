"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { submitInterestRegistration } from "@/actions/interest-registrations";
import type { ApplyLabels } from "@/components/marketing/apply-labels";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/constants/locales";
import {
  interestRegistrationSchemaFor,
  type InterestRegistrationInput,
} from "@/validations/interest-registration";

type ApplyFormProps = {
  locale: Locale;
  labels: ApplyLabels;
};

export function ApplyForm({ locale, labels }: ApplyFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InterestRegistrationInput>({
    resolver: zodResolver(interestRegistrationSchemaFor(locale)),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      sector: "",
      country: "",
      pitch: "",
      consent: false,
    },
  });

  function onSubmit(values: InterestRegistrationInput) {
    startTransition(async () => {
      const result = await submitInterestRegistration(values);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message || labels.successToast);
      reset();
    });
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="apply-fullName">{labels.nameLabel}</Label>
          <Input
            id="apply-fullName"
            type="text"
            autoComplete="name"
            placeholder={labels.namePlaceholder}
            aria-invalid={Boolean(errors.fullName)}
            disabled={isPending}
            className="min-h-11"
            {...register("fullName")}
          />
          {errors.fullName ? (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apply-email">{labels.emailLabel}</Label>
          <Input
            id="apply-email"
            type="email"
            autoComplete="email"
            placeholder={labels.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            disabled={isPending}
            className="min-h-11"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="apply-phone">{labels.phoneLabel}</Label>
          <Input
            id="apply-phone"
            type="tel"
            autoComplete="tel"
            placeholder={labels.phonePlaceholder}
            aria-invalid={Boolean(errors.phone)}
            disabled={isPending}
            className="min-h-11"
            {...register("phone")}
          />
          {errors.phone ? (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apply-companyName">{labels.companyLabel}</Label>
          <Input
            id="apply-companyName"
            type="text"
            autoComplete="organization"
            placeholder={labels.companyPlaceholder}
            aria-invalid={Boolean(errors.companyName)}
            disabled={isPending}
            className="min-h-11"
            {...register("companyName")}
          />
          {errors.companyName ? (
            <p className="text-sm text-destructive">
              {errors.companyName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="apply-sector">{labels.sectorLabel}</Label>
          <Input
            id="apply-sector"
            type="text"
            placeholder={labels.sectorPlaceholder}
            aria-invalid={Boolean(errors.sector)}
            disabled={isPending}
            className="min-h-11"
            {...register("sector")}
          />
          {errors.sector ? (
            <p className="text-sm text-destructive">{errors.sector.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="apply-country">{labels.countryLabel}</Label>
          <Input
            id="apply-country"
            type="text"
            autoComplete="country-name"
            placeholder={labels.countryPlaceholder}
            aria-invalid={Boolean(errors.country)}
            disabled={isPending}
            className="min-h-11"
            {...register("country")}
          />
          {errors.country ? (
            <p className="text-sm text-destructive">{errors.country.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="apply-pitch">{labels.pitchLabel}</Label>
        <Textarea
          id="apply-pitch"
          rows={5}
          placeholder={labels.pitchPlaceholder}
          aria-invalid={Boolean(errors.pitch)}
          disabled={isPending}
          className="min-h-32"
          {...register("pitch")}
        />
        {errors.pitch ? (
          <p className="text-sm text-destructive">{errors.pitch.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Controller
          name="consent"
          control={control}
          render={({ field }) => (
            <div className="flex gap-3">
              <Checkbox
                id="apply-consent"
                checked={field.value}
                onCheckedChange={(checked) =>
                  field.onChange(checked === true)
                }
                disabled={isPending}
                aria-invalid={Boolean(errors.consent)}
                className="mt-0.5 size-5"
              />
              <Label
                htmlFor="apply-consent"
                className="text-sm leading-snug font-normal"
              >
                {labels.consentLabel}
              </Label>
            </div>
          )}
        />
        {errors.consent ? (
          <p className="text-sm text-destructive">{errors.consent.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        className="min-h-11 w-full sm:w-auto"
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
    </form>
  );
}
