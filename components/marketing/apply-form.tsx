"use client";

import { useState, useTransition } from "react";
import {
  useForm,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { submitApplication } from "@/actions/submit-application";
import { submitInterestRegistration } from "@/actions/submit-interest-registration";
import type {
  ApplyFormMode,
  ApplyLabels,
} from "@/components/marketing/apply-labels";
import {
  IntakeConsentFields,
  IntakeFieldLabel,
  IntakeSubmitButton,
  IntakeSuccessDialog,
} from "@/components/marketing/intake-form-chrome";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import type { Locale } from "@/constants/locales";
import {
  applicationSchemaFor,
  type ApplicationInput,
} from "@/validations/application";
import {
  interestRegistrationSchemaFor,
  type InterestRegistrationInput,
} from "@/validations/interest-registration";

type ApplyFormProps = {
  locale: Locale;
  labels: ApplyLabels;
  mode: ApplyFormMode;
  defaultEmail?: string;
};

const REGISTER_DEFAULTS: InterestRegistrationInput = {
  fullName: "",
  founderRole: "",
  email: "",
  phone: "",
  country: "",
  linkedin: "",
  companyName: "",
  website: "",
  companyCountry: "",
  sector: "",
  pitch: "",
  consent: false,
  commsOptIn: false,
};

const APPLY_DEFAULTS: ApplicationInput = {
  fullName: "",
  founderRole: "",
  email: "",
  phone: "",
  country: "",
  linkedin: "",
  companyName: "",
  website: "",
  companyCountry: "",
  sector: "",
  problemProduct: "",
  traction: "",
  programmeFit: "",
  consent: false,
  commsOptIn: false,
};

export function ApplyForm({
  locale,
  labels,
  mode,
  defaultEmail = "",
}: ApplyFormProps) {
  if (mode === "apply") {
    return (
      <ApplyIntakeForm
        locale={locale}
        labels={labels}
        defaultEmail={defaultEmail}
      />
    );
  }
  return (
    <RegisterIntakeForm
      locale={locale}
      labels={labels}
      defaultEmail={defaultEmail}
    />
  );
}

type IntakeFormProps = {
  locale: Locale;
  labels: ApplyLabels;
  defaultEmail: string;
};

function RegisterIntakeForm({
  locale,
  labels,
  defaultEmail,
}: IntakeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InterestRegistrationInput>({
    resolver: zodResolver(interestRegistrationSchemaFor(locale)),
    defaultValues: { ...REGISTER_DEFAULTS, email: defaultEmail },
  });

  function onSubmit(values: InterestRegistrationInput) {
    startTransition(async () => {
      try {
        const result = await submitInterestRegistration({
          ...values,
        });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        reset({ ...REGISTER_DEFAULTS, email: defaultEmail });
        setSuccessOpen(true);
      } catch {
        toast.error(
          locale === "fr"
            ? "Une erreur s’est produite. Veuillez réessayer."
            : "Something went wrong. Please try again.",
        );
      } finally {
      }
    });
  }

  return (
    <>
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <SharedFields
          labels={labels}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          isPending={isPending}
        />
        {/* Text Pack v2: no long-form answers at Register Interest. */}
        <IntakeConsentFields
          labels={labels}
          control={control}
          consentError={errors.consent?.message}
          isPending={isPending}
        />
        <IntakeSubmitButton
          labels={labels}
          isPending={isPending}
          disabled={isPending}
        />
      </form>
      <IntakeSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        labels={labels}
      />
    </>
  );
}

function ApplyIntakeForm({
  locale,
  labels,
  defaultEmail,
}: IntakeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchemaFor(locale)),
    defaultValues: { ...APPLY_DEFAULTS, email: defaultEmail },
  });

  function onSubmit(values: ApplicationInput) {
    startTransition(async () => {
      try {
        const result = await submitApplication({
          ...values,
        });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        reset({ ...APPLY_DEFAULTS, email: defaultEmail });
        setSuccessOpen(true);
      } catch {
        toast.error(
          locale === "fr"
            ? "Une erreur s’est produite. Veuillez réessayer."
            : "Something went wrong. Please try again.",
        );
      } finally {
      }
    });
  }

  return (
    <>
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <SharedFields
          labels={labels}
          register={register as unknown as UseFormRegister<FieldValues>}
          errors={errors}
          isPending={isPending}
        />
        <div className="grid gap-2">
          <IntakeFieldLabel
            htmlFor="intake-problem"
            hint={labels.problemHint}
          >
            {labels.problemLabel}
          </IntakeFieldLabel>
          <Textarea
            id="intake-problem"
            rows={5}
            placeholder={labels.problemPlaceholder}
            aria-invalid={Boolean(errors.problemProduct)}
            disabled={isPending}
            {...register("problemProduct")}
          />
          {errors.problemProduct ? (
            <p className="text-sm text-destructive">
              {errors.problemProduct.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <IntakeFieldLabel
            htmlFor="intake-traction"
            hint={labels.tractionHint}
          >
            {labels.tractionLabel}
          </IntakeFieldLabel>
          <Textarea
            id="intake-traction"
            rows={4}
            placeholder={labels.tractionPlaceholder}
            aria-invalid={Boolean(errors.traction)}
            disabled={isPending}
            {...register("traction")}
          />
          {errors.traction ? (
            <p className="text-sm text-destructive">{errors.traction.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <IntakeFieldLabel htmlFor="intake-fit" hint={labels.fitHint}>
            {labels.fitLabel}
          </IntakeFieldLabel>
          <Textarea
            id="intake-fit"
            rows={4}
            placeholder={labels.fitPlaceholder}
            aria-invalid={Boolean(errors.programmeFit)}
            disabled={isPending}
            {...register("programmeFit")}
          />
          {errors.programmeFit ? (
            <p className="text-sm text-destructive">
              {errors.programmeFit.message}
            </p>
          ) : null}
        </div>
        <IntakeConsentFields
          labels={labels}
          control={control}
          consentError={errors.consent?.message}
          isPending={isPending}
        />
        <IntakeSubmitButton
          labels={labels}
          isPending={isPending}
          disabled={isPending}
        />
      </form>
      <IntakeSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        labels={labels}
      />
    </>
  );
}

type FieldErrors = Partial<
  Record<string, { message?: string } | undefined>
>;

type SharedFieldsProps = {
  labels: ApplyLabels;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  isPending: boolean;
};

function SharedFields({
  labels,
  register,
  errors,
  isPending,
}: SharedFieldsProps) {
  const err = (key: string) => errors[key]?.message;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="intake-fullName">{labels.nameLabel}</Label>
          <Input
            id="intake-fullName"
            autoComplete="name"
            placeholder={labels.namePlaceholder}
            aria-invalid={Boolean(err("fullName"))}
            disabled={isPending}
            className="min-h-11"
            {...register("fullName")}
          />
          {err("fullName") ? (
            <p className="text-sm text-destructive">{err("fullName")}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="intake-role">{labels.roleLabel}</Label>
          <Input
            id="intake-role"
            placeholder={labels.rolePlaceholder}
            aria-invalid={Boolean(err("founderRole"))}
            disabled={isPending}
            className="min-h-11"
            {...register("founderRole")}
          />
          {err("founderRole") ? (
            <p className="text-sm text-destructive">{err("founderRole")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="intake-email">{labels.emailLabel}</Label>
          <Input
            id="intake-email"
            type="email"
            autoComplete="email"
            placeholder={labels.emailPlaceholder}
            aria-invalid={Boolean(err("email"))}
            readOnly
            disabled={isPending}
            className="min-h-11 bg-muted"
            {...register("email")}
          />
          {err("email") ? (
            <p className="text-sm text-destructive">{err("email")}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="intake-phone">{labels.phoneLabel}</Label>
          <Input
            id="intake-phone"
            type="tel"
            autoComplete="tel"
            placeholder={labels.phonePlaceholder}
            aria-invalid={Boolean(err("phone"))}
            disabled={isPending}
            className="min-h-11"
            {...register("phone")}
          />
          {err("phone") ? (
            <p className="text-sm text-destructive">{err("phone")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="intake-country">{labels.countryLabel}</Label>
          <Input
            id="intake-country"
            placeholder={labels.countryPlaceholder}
            aria-invalid={Boolean(err("country"))}
            disabled={isPending}
            className="min-h-11"
            {...register("country")}
          />
          {err("country") ? (
            <p className="text-sm text-destructive">{err("country")}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <IntakeFieldLabel
            htmlFor="intake-linkedin"
            hint={labels.linkedinHint}
          >
            {labels.linkedinLabel}
          </IntakeFieldLabel>
          <UrlInput
            id="intake-linkedin"
            placeholder={labels.linkedinPlaceholder}
            aria-invalid={Boolean(err("linkedin"))}
            disabled={isPending}
            className="min-h-11"
            {...register("linkedin")}
          />
          {err("linkedin") ? (
            <p className="text-sm text-destructive">{err("linkedin")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="intake-company">{labels.companyLabel}</Label>
          <Input
            id="intake-company"
            placeholder={labels.companyPlaceholder}
            aria-invalid={Boolean(err("companyName"))}
            disabled={isPending}
            className="min-h-11"
            {...register("companyName")}
          />
          {err("companyName") ? (
            <p className="text-sm text-destructive">{err("companyName")}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <IntakeFieldLabel
            htmlFor="intake-website"
            hint={labels.websiteHint}
          >
            {labels.websiteLabel}
          </IntakeFieldLabel>
          <UrlInput
            id="intake-website"
            placeholder={labels.websitePlaceholder}
            aria-invalid={Boolean(err("website"))}
            disabled={isPending}
            className="min-h-11"
            {...register("website")}
          />
          {err("website") ? (
            <p className="text-sm text-destructive">{err("website")}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="intake-company-country">
            {labels.companyCountryLabel}
          </Label>
          <Input
            id="intake-company-country"
            placeholder={labels.companyCountryPlaceholder}
            aria-invalid={Boolean(err("companyCountry"))}
            disabled={isPending}
            className="min-h-11"
            {...register("companyCountry")}
          />
          {err("companyCountry") ? (
            <p className="text-sm text-destructive">{err("companyCountry")}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="intake-sector">{labels.sectorLabel}</Label>
          <Input
            id="intake-sector"
            placeholder={labels.sectorPlaceholder}
            aria-invalid={Boolean(err("sector"))}
            disabled={isPending}
            className="min-h-11"
            {...register("sector")}
          />
          {err("sector") ? (
            <p className="text-sm text-destructive">{err("sector")}</p>
          ) : null}
        </div>
      </div>
    </>
  );
}

