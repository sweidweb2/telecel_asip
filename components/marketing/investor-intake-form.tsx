"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { submitInvestorEngagement } from "@/actions/submit-investor-engagement";
import { submitInvestorInterest } from "@/actions/submit-investor-interest";
import type { ApplyFormMode } from "@/components/marketing/apply-labels";
import type { InvestorIntakeLabels } from "@/components/marketing/investor-intake-labels";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import {
  INVESTOR_ENGAGEMENT_INTENTS,
  INVESTOR_GEOGRAPHY_OPTIONS,
  INVESTOR_KINDS,
  INVESTOR_SECTOR_OPTIONS,
  INVESTOR_STAGES,
  INVESTOR_TICKET_SIZES,
  INVESTOR_TIMELINES,
} from "@/constants/investor-intake";
import type { Locale } from "@/constants/locales";
import { useTurnstile } from "@/hooks/use-turnstile";
import { TURNSTILE_APPLY_ACTION } from "@/types/turnstile";
import {
  investorEngagementSchemaFor,
  type InvestorEngagementInput,
} from "@/validations/investor-engagement";
import {
  investorInterestSchemaFor,
  type InvestorInterestInput,
} from "@/validations/investor-interest";

type InvestorIntakeFormProps = {
  locale: Locale;
  labels: InvestorIntakeLabels;
  mode: ApplyFormMode;
  defaultEmail?: string;
};

const INTEREST_DEFAULTS: InvestorInterestInput = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  jobTitle: "",
  linkedin: "",
  investorType: "angel",
  focusNote: "",
  consent: false,
  commsOptIn: false,
  turnstileToken: "",
};

const ENGAGEMENT_DEFAULTS: InvestorEngagementInput = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  jobTitle: "",
  linkedin: "",
  investorType: "angel",
  stages: [],
  ticketSize: "undisclosed",
  sectors: [],
  geographies: [],
  engagementIntent: "portfolio_access",
  thesis: "",
  timeline: undefined,
  referredBy: "",
  message: "",
  consent: false,
  commsOptIn: false,
  turnstileToken: "",
};

export function InvestorIntakeForm({
  locale,
  labels,
  mode,
  defaultEmail = "",
}: InvestorIntakeFormProps) {
  if (mode === "apply") {
    return (
      <InvestorEngagementForm
        locale={locale}
        labels={labels}
        defaultEmail={defaultEmail}
      />
    );
  }
  return (
    <InvestorInterestForm
      locale={locale}
      labels={labels}
      defaultEmail={defaultEmail}
    />
  );
}

type SharedProps = {
  locale: Locale;
  labels: InvestorIntakeLabels;
  defaultEmail: string;
};

function InvestorInterestForm({ locale, labels, defaultEmail }: SharedProps) {
  const [isPending, startTransition] = useTransition();
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InvestorInterestInput>({
    resolver: zodResolver(
      investorInterestSchemaFor(locale),
    ) as Resolver<InvestorInterestInput>,
    defaultValues: { ...INTEREST_DEFAULTS, email: defaultEmail },
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

  function onSubmit(values: InvestorInterestInput) {
    startTransition(async () => {
      try {
        const result = await submitInvestorInterest(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        reset({ ...INTEREST_DEFAULTS, email: defaultEmail });
        setSuccessOpen(true);
      } finally {
        turnstile.reset();
      }
    });
  }

  return (
    <>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <InvestorContactFields
          labels={labels}
          register={register as unknown as UseFormRegister<FieldValues>}
          control={control as unknown as Control<FieldValues>}
          errors={errors}
          isPending={isPending}
        />
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-focus" hint={labels.focusNoteHint}>
            {labels.focusNoteLabel}
          </FieldLabel>
          <Textarea
            id="investor-focus"
            rows={4}
            placeholder={labels.focusNotePlaceholder}
            aria-invalid={Boolean(errors.focusNote)}
            disabled={isPending}
            {...register("focusNote")}
          />
          {errors.focusNote ? (
            <p className="text-sm text-destructive">{errors.focusNote.message}</p>
          ) : null}
        </div>
        <ConsentBlock
          labels={labels}
          control={control as unknown as Control<FieldValues>}
          consentError={errors.consent?.message}
          isPending={isPending}
        />
        <input type="hidden" {...register("turnstileToken")} />
        <TurnstileField
          turnstile={turnstile}
          hasToken={Boolean(turnstileToken)}
          hint={labels.turnstileHint}
          error={errors.turnstileToken?.message}
          testId="investor-register-turnstile"
        />
        <SubmitBlock labels={labels} isPending={isPending} />
      </form>
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        labels={labels}
      />
    </>
  );
}

function InvestorEngagementForm({ locale, labels, defaultEmail }: SharedProps) {
  const [isPending, startTransition] = useTransition();
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InvestorEngagementInput>({
    resolver: zodResolver(
      investorEngagementSchemaFor(locale),
    ) as Resolver<InvestorEngagementInput>,
    defaultValues: { ...ENGAGEMENT_DEFAULTS, email: defaultEmail },
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

  function onSubmit(values: InvestorEngagementInput) {
    startTransition(async () => {
      try {
        const result = await submitInvestorEngagement(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        reset({ ...ENGAGEMENT_DEFAULTS, email: defaultEmail });
        setSuccessOpen(true);
      } finally {
        turnstile.reset();
      }
    });
  }

  return (
    <>
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <InvestorContactFields
          labels={labels}
          register={register as unknown as UseFormRegister<FieldValues>}
          control={control as unknown as Control<FieldValues>}
          errors={errors}
          isPending={isPending}
        />
        <CheckboxGroup
          legend={labels.stagesLabel}
          options={INVESTOR_STAGES.map((value) => ({
            value,
            label: labels.stageLabels[value] ?? value,
          }))}
          control={control}
          name="stages"
          error={errors.stages?.message}
          isPending={isPending}
        />
        <div className="grid gap-2">
          <Label htmlFor="investor-ticket">{labels.ticketSizeLabel}</Label>
          <Controller
            control={control}
            name="ticketSize"
            render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value);
              }}
              disabled={isPending}
            >
              <SelectTrigger id="investor-ticket" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
                <SelectContent>
                  {INVESTOR_TICKET_SIZES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labels.ticketLabels[value] ?? value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.ticketSize ? (
            <p className="text-sm text-destructive">
              {errors.ticketSize.message}
            </p>
          ) : null}
        </div>
        <CheckboxGroup
          legend={labels.sectorsLabel}
          options={INVESTOR_SECTOR_OPTIONS.map((value) => ({
            value,
            label: value,
          }))}
          control={control}
          name="sectors"
          error={errors.sectors?.message}
          isPending={isPending}
        />
        <CheckboxGroup
          legend={labels.geographiesLabel}
          options={INVESTOR_GEOGRAPHY_OPTIONS.map((value) => ({
            value,
            label: value,
          }))}
          control={control}
          name="geographies"
          error={errors.geographies?.message}
          isPending={isPending}
        />
        <div className="grid gap-2">
          <Label htmlFor="investor-intent">{labels.intentLabel}</Label>
          <Controller
            control={control}
            name="engagementIntent"
            render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value);
              }}
              disabled={isPending}
            >
              <SelectTrigger id="investor-intent" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
                <SelectContent>
                  {INVESTOR_ENGAGEMENT_INTENTS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labels.intentLabels[value] ?? value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.engagementIntent ? (
            <p className="text-sm text-destructive">
              {errors.engagementIntent.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-thesis" hint={labels.thesisHint}>
            {labels.thesisLabel}
          </FieldLabel>
          <Textarea
            id="investor-thesis"
            rows={5}
            placeholder={labels.thesisPlaceholder}
            aria-invalid={Boolean(errors.thesis)}
            disabled={isPending}
            {...register("thesis")}
          />
          {errors.thesis ? (
            <p className="text-sm text-destructive">{errors.thesis.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-timeline" hint={labels.timelineHint}>
            {labels.timelineLabel}
          </FieldLabel>
          <Controller
            control={control}
            name="timeline"
            render={({ field }) => (
            <Select
              value={field.value ?? null}
              onValueChange={(value) =>
                field.onChange(value ? value : undefined)
              }
              disabled={isPending}
            >
                <SelectTrigger
                  id="investor-timeline"
                  className="min-h-11 w-full"
                >
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {INVESTOR_TIMELINES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {labels.timelineLabels[value] ?? value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.timeline ? (
            <p className="text-sm text-destructive">{errors.timeline.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-referred" hint={labels.referredByHint}>
            {labels.referredByLabel}
          </FieldLabel>
          <Input
            id="investor-referred"
            disabled={isPending}
            aria-invalid={Boolean(errors.referredBy)}
            {...register("referredBy")}
          />
          {errors.referredBy ? (
            <p className="text-sm text-destructive">
              {errors.referredBy.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-message" hint={labels.messageHint}>
            {labels.messageLabel}
          </FieldLabel>
          <Textarea
            id="investor-message"
            rows={3}
            placeholder={labels.messagePlaceholder}
            aria-invalid={Boolean(errors.message)}
            disabled={isPending}
            {...register("message")}
          />
          {errors.message ? (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          ) : null}
        </div>
        <ConsentBlock
          labels={labels}
          control={control as unknown as Control<FieldValues>}
          consentError={errors.consent?.message}
          isPending={isPending}
        />
        <input type="hidden" {...register("turnstileToken")} />
        <TurnstileField
          turnstile={turnstile}
          hasToken={Boolean(turnstileToken)}
          hint={labels.turnstileHint}
          error={errors.turnstileToken?.message}
          testId="investor-apply-turnstile"
        />
        <SubmitBlock labels={labels} isPending={isPending} />
      </form>
      <SuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        labels={labels}
      />
    </>
  );
}

type ContactFieldsProps = {
  labels: InvestorIntakeLabels;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  errors: Partial<Record<string, { message?: string }>>;
  isPending: boolean;
};

function InvestorContactFields({
  labels,
  register,
  control,
  errors,
  isPending,
}: ContactFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="investor-fullName">{labels.nameLabel}</Label>
          <Input
            id="investor-fullName"
            autoComplete="name"
            disabled={isPending}
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          {errors.fullName?.message ? (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="investor-email">{labels.emailLabel}</Label>
          <Input
            id="investor-email"
            type="email"
            autoComplete="email"
            disabled
            readOnly
            {...register("email")}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-phone" hint={labels.phoneHint}>
            {labels.phoneLabel}
          </FieldLabel>
          <Input
            id="investor-phone"
            autoComplete="tel"
            disabled={isPending}
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          {errors.phone?.message ? (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="investor-org">{labels.organizationLabel}</Label>
          <Input
            id="investor-org"
            disabled={isPending}
            aria-invalid={Boolean(errors.organization)}
            {...register("organization")}
          />
          {errors.organization?.message ? (
            <p className="text-sm text-destructive">
              {errors.organization.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-title" hint={labels.jobTitleHint}>
            {labels.jobTitleLabel}
          </FieldLabel>
          <Input
            id="investor-title"
            disabled={isPending}
            aria-invalid={Boolean(errors.jobTitle)}
            {...register("jobTitle")}
          />
          {errors.jobTitle?.message ? (
            <p className="text-sm text-destructive">{errors.jobTitle.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <FieldLabel htmlFor="investor-linkedin" hint={labels.linkedinHint}>
            {labels.linkedinLabel}
          </FieldLabel>
          <UrlInput
            id="investor-linkedin"
            disabled={isPending}
            aria-invalid={Boolean(errors.linkedin)}
            {...register("linkedin")}
          />
          {errors.linkedin?.message ? (
            <p className="text-sm text-destructive">{errors.linkedin.message}</p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="investor-type">{labels.investorTypeLabel}</Label>
        <Controller
          control={control}
          name="investorType"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value);
              }}
              disabled={isPending}
            >
              <SelectTrigger id="investor-type" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVESTOR_KINDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {labels.kindLabels[value] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.investorType?.message ? (
          <p className="text-sm text-destructive">
            {errors.investorType.message}
          </p>
        ) : null}
      </div>
    </>
  );
}

function CheckboxGroup<T extends FieldValues>({
  legend,
  options,
  control,
  name,
  error,
  isPending,
}: {
  legend: string;
  options: { value: string; label: string }[];
  control: Control<T>;
  name: Path<T>;
  error?: string;
  isPending: boolean;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selected = (field.value as string[] | undefined) ?? [];
          return (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      disabled={isPending}
                      onCheckedChange={(next) => {
                        const on = next === true;
                        field.onChange(
                          on
                            ? [...selected, option.value]
                            : selected.filter((item) => item !== option.value),
                        );
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          );
        }}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </fieldset>
  );
}

function ConsentBlock({
  labels,
  control,
  consentError,
  isPending,
}: {
  labels: InvestorIntakeLabels;
  control: Control<FieldValues>;
  consentError?: string;
  isPending: boolean;
}) {
  return (
    <div className="grid gap-3">
      <Controller
        control={control}
        name="consent"
        render={({ field }) => (
          <label className="flex items-start gap-3 text-sm leading-6">
            <Checkbox
              checked={field.value === true}
              disabled={isPending}
              onCheckedChange={(next) => field.onChange(next === true)}
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
        control={control}
        name="commsOptIn"
        render={({ field }) => (
          <label className="flex items-start gap-3 text-sm leading-6">
            <Checkbox
              checked={field.value === true}
              disabled={isPending}
              onCheckedChange={(next) => field.onChange(next === true)}
              className="mt-0.5"
            />
            <span>{labels.commsLabel}</span>
          </label>
        )}
      />
    </div>
  );
}

function SubmitBlock({
  labels,
  isPending,
}: {
  labels: InvestorIntakeLabels;
  isPending: boolean;
}) {
  return (
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
  );
}

function SuccessDialog({
  open,
  onOpenChange,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: InvestorIntakeLabels;
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

function FieldLabel({
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
