"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { submitApplication } from "@/actions/applications";
import { submitInterestRegistration } from "@/actions/interest-registrations";
import type {
  ApplyFormMode,
  ApplyLabels,
} from "@/components/marketing/apply-labels";
import { TurnstileField } from "@/components/marketing/turnstile-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import type { Locale } from "@/constants/locales";
import { useTurnstile } from "@/hooks/use-turnstile";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
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
  turnstileToken: "",
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
  turnstileToken: "",
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

  const turnstileToken = useWatch({ control, name: "turnstileToken" });
  const turnstile = useTurnstile({
    action: TURNSTILE_APPLY_ACTION,
    onTokenChange: useCallback(
      (token: string) =>
        setValue("turnstileToken", token, { shouldValidate: token !== "" }),
      [setValue],
    ),
  });

  function onSubmit(values: InterestRegistrationInput) {
    startTransition(async () => {
      try {
        const result = await submitInterestRegistration(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        reset({ ...REGISTER_DEFAULTS, email: defaultEmail });
        setSuccessOpen(true);
      } finally {
        turnstile.reset();
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
          <ApplyFieldLabel htmlFor="intake-pitch" hint={labels.pitchHint}>
            {labels.pitchLabel}
          </ApplyFieldLabel>
          <Textarea
            id="intake-pitch"
            rows={4}
            placeholder={labels.pitchPlaceholder}
            aria-invalid={Boolean(errors.pitch)}
            disabled={isPending}
            {...register("pitch")}
          />
          {errors.pitch ? (
            <p className="text-sm text-destructive">{errors.pitch.message}</p>
          ) : null}
        </div>
        <ConsentFields
          labels={labels}
          control={control}
          consentError={errors.consent?.message}
          isPending={isPending}
        />
        <input type="hidden" {...register("turnstileToken")} />
        <TurnstileField
          turnstile={turnstile}
          hasToken={Boolean(turnstileToken)}
          hint={labels.turnstileHint}
          error={errors.turnstileToken?.message}
          testId="register-turnstile"
        />
        <SubmitButton labels={labels} isPending={isPending} />
      </form>
      <ApplySuccessDialog
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

  const turnstileToken = useWatch({ control, name: "turnstileToken" });
  const turnstile = useTurnstile({
    action: TURNSTILE_APPLY_ACTION,
    onTokenChange: useCallback(
      (token: string) =>
        setValue("turnstileToken", token, { shouldValidate: token !== "" }),
      [setValue],
    ),
  });

  function onSubmit(values: ApplicationInput) {
    startTransition(async () => {
      try {
        const result = await submitApplication(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        reset({ ...APPLY_DEFAULTS, email: defaultEmail });
        setSuccessOpen(true);
      } finally {
        turnstile.reset();
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
          <ApplyFieldLabel
            htmlFor="intake-problem"
            hint={labels.problemHint}
          >
            {labels.problemLabel}
          </ApplyFieldLabel>
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
          <ApplyFieldLabel
            htmlFor="intake-traction"
            hint={labels.tractionHint}
          >
            {labels.tractionLabel}
          </ApplyFieldLabel>
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
          <ApplyFieldLabel htmlFor="intake-fit" hint={labels.fitHint}>
            {labels.fitLabel}
          </ApplyFieldLabel>
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
        <ConsentFields
          labels={labels}
          control={control}
          consentError={errors.consent?.message}
          isPending={isPending}
        />
        <input type="hidden" {...register("turnstileToken")} />
        <TurnstileField
          turnstile={turnstile}
          hasToken={Boolean(turnstileToken)}
          hint={labels.turnstileHint}
          error={errors.turnstileToken?.message}
          testId="apply-turnstile"
        />
        <SubmitButton labels={labels} isPending={isPending} />
      </form>
      <ApplySuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        labels={labels}
      />
    </>
  );
}

function ApplySuccessDialog({
  open,
  onOpenChange,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: ApplyLabels;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg">
            {labels.successTitle}
          </DialogTitle>
          <DialogDescription>{labels.successDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose
            render={
              <Button variant="default" className="min-h-11 w-full sm:w-auto" />
            }
          >
            {labels.successCloseLabel}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type FieldErrors = Partial<
  Record<string, { message?: string } | undefined>
>;

/** Label with optional/required (or other) rules beside it — never under the input. */
function ApplyFieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint ? (
        <span className="text-xs leading-4 text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

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
            disabled={isPending}
            className="min-h-11"
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
          <ApplyFieldLabel
            htmlFor="intake-linkedin"
            hint={labels.linkedinHint}
          >
            {labels.linkedinLabel}
          </ApplyFieldLabel>
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
          <ApplyFieldLabel
            htmlFor="intake-website"
            hint={labels.websiteHint}
          >
            {labels.websiteLabel}
          </ApplyFieldLabel>
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

type ConsentFieldsProps = {
  labels: ApplyLabels;
  control:
    | ReturnType<typeof useForm<InterestRegistrationInput>>["control"]
    | ReturnType<typeof useForm<ApplicationInput>>["control"];
  consentError?: string;
  isPending: boolean;
};

function ConsentFields({
  labels,
  control,
  consentError,
  isPending,
}: ConsentFieldsProps) {
  return (
    <>
      <Controller
        // Shared consent/comms fields exist on both intake schemas.
        control={control as ReturnType<typeof useForm<ApplicationInput>>["control"]}
        name="consent"
        render={({ field }) => (
          <label className="flex items-start gap-3 text-sm leading-6">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isPending}
              className="mt-0.5"
            />
            <span>{labels.consentLabel}</span>
          </label>
        )}
      />
      {consentError ? (
        <p className="text-sm text-destructive">{consentError}</p>
      ) : null}

      <Controller
        control={control as ReturnType<typeof useForm<ApplicationInput>>["control"]}
        name="commsOptIn"
        render={({ field }) => (
          <label className="flex items-start gap-3 text-sm leading-6">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isPending}
              className="mt-0.5"
            />
            <span>{labels.commsLabel}</span>
          </label>
        )}
      />
    </>
  );
}

function SubmitButton({
  labels,
  isPending,
}: {
  labels: ApplyLabels;
  isPending: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={isPending}
      className="min-h-11 w-full sm:w-auto"
    >
      {isPending ? <Loader2Icon className="animate-spin" /> : null}
      {isPending ? labels.submittingLabel : labels.submitLabel}
    </Button>
  );
}
