"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import {
  AdminDetailGrid,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminExternalLink } from "@/components/dashboard/admin-external-link";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { investorIntakeLabelsFor } from "@/components/marketing/investor-intake-labels";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UrlInput } from "@/components/ui/url-input";
import { INVESTOR_KINDS } from "@/constants/investor-intake";
import {
  INVESTOR_EMAIL_MAX,
  INVESTOR_FULL_NAME_MAX,
  INVESTOR_JOB_TITLE_MAX,
  INVESTOR_ORGANIZATION_MAX,
  INVESTOR_PHONE_MAX,
  INVESTOR_URL_MAX,
} from "@/validations/investor-contact-fields";
import type { UpdateInvestorInterestInput } from "@/validations/investor-interest";

/** English labels for enum values shown in the admin inbox. */
export const INVESTOR_ADMIN_LABELS = investorIntakeLabelsFor("en", "apply");

export type InvestorContactEditValues = Pick<
  UpdateInvestorInterestInput,
  | "fullName"
  | "email"
  | "phone"
  | "organization"
  | "jobTitle"
  | "linkedin"
  | "investorType"
  | "commsOptIn"
>;


/** Joins enum or free-text values into a readable list (empty when none). */
export function formatInvestorValues(
  values: readonly string[],
  labels?: Record<string, string>,
): string {
  return values.map((value) => labels?.[value] ?? value).join(", ");
}

type InvestorContactRecord = {
  full_name: string;
  email: string;
  phone: string | null;
  organization: string;
  job_title: string | null;
  linkedin: string | null;
  investor_type: string;
  consent: boolean;
  comms_opt_in: boolean;
};

export function InvestorContactViewSections({
  record,
}: {
  record: InvestorContactRecord;
}) {
  return (
    <>
      <AdminDetailSection title="Contact">
        <AdminDetailGrid>
          <AdminDetailRow label="Email">{record.email}</AdminDetailRow>
          <AdminDetailRow label="Phone">{record.phone}</AdminDetailRow>
          <AdminDetailRow label="LinkedIn" className="sm:col-span-2">
            {record.linkedin ? (
              <AdminExternalLink href={record.linkedin} label={record.linkedin} />
            ) : null}
          </AdminDetailRow>
        </AdminDetailGrid>
      </AdminDetailSection>
      <AdminDetailSection title="Organization">
        <AdminDetailGrid>
          <AdminDetailRow label="Name">{record.organization}</AdminDetailRow>
          <AdminDetailRow label="Job title">{record.job_title}</AdminDetailRow>
          <AdminDetailRow label="Investor type">
            {INVESTOR_ADMIN_LABELS.kindLabels[record.investor_type] ??
              record.investor_type}
          </AdminDetailRow>
          <AdminDetailRow label="Consent">
            {record.consent ? "Yes" : "No"}
          </AdminDetailRow>
          <AdminDetailRow label="Communications">
            {record.comms_opt_in ? "Opted in" : "Not opted in"}
          </AdminDetailRow>
        </AdminDetailGrid>
      </AdminDetailSection>
    </>
  );
}

export function InvestorContextViewSection({
  locale,
  sourcePath,
  consentVersion,
}: {
  locale: string;
  sourcePath: string | null;
  consentVersion: string | null;
}) {
  return (
    <AdminDetailSection title="Submission context">
      <AdminDetailGrid>
        <AdminDetailRow label="Locale">{locale.toUpperCase()}</AdminDetailRow>
        <AdminDetailRow label="Source">{sourcePath}</AdminDetailRow>
        <AdminDetailRow label="Consent version">{consentVersion}</AdminDetailRow>
      </AdminDetailGrid>
    </AdminDetailSection>
  );
}

/** Shared contact + organization inputs for both investor edit dialogs. */
export function InvestorContactEditFields({
  form,
  idPrefix,
  disabled,
}: {
  form: UseFormReturn<InvestorContactEditValues>;
  idPrefix: string;
  disabled: boolean;
}) {
  const { errors } = form.formState;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.fullName)}>
          <AdminFormFieldLabel
            htmlFor={`${idPrefix}-name`}
            hint={`2–${INVESTOR_FULL_NAME_MAX} chars`}
          >
            Full name
          </AdminFormFieldLabel>
          <Input
            id={`${idPrefix}-name`}
            disabled={disabled}
            maxLength={INVESTOR_FULL_NAME_MAX}
            className="min-h-11"
            placeholder="e.g. Ama Mensah"
            aria-invalid={Boolean(errors.fullName)}
            {...form.register("fullName")}
          />
          <AdminFieldError message={errors.fullName?.message} />
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <AdminFormFieldLabel
            htmlFor={`${idPrefix}-email`}
            hint={`max ${INVESTOR_EMAIL_MAX}`}
          >
            Email
          </AdminFormFieldLabel>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            disabled={disabled}
            maxLength={INVESTOR_EMAIL_MAX}
            className="min-h-11"
            placeholder="name@fund.com"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <AdminFieldError message={errors.email?.message} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.phone)}>
          <AdminFormFieldLabel
            htmlFor={`${idPrefix}-phone`}
            hint={`Optional · 7–${INVESTOR_PHONE_MAX} · +()- spaces`}
          >
            Phone
          </AdminFormFieldLabel>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            disabled={disabled}
            maxLength={INVESTOR_PHONE_MAX}
            className="min-h-11"
            placeholder="+233 20 000 0000"
            aria-invalid={Boolean(errors.phone)}
            {...form.register("phone")}
          />
          <AdminFieldError message={errors.phone?.message} />
        </Field>
        <Field data-invalid={Boolean(errors.organization)}>
          <AdminFormFieldLabel
            htmlFor={`${idPrefix}-organization`}
            hint={`2–${INVESTOR_ORGANIZATION_MAX} chars`}
          >
            Organization
          </AdminFormFieldLabel>
          <Input
            id={`${idPrefix}-organization`}
            disabled={disabled}
            maxLength={INVESTOR_ORGANIZATION_MAX}
            className="min-h-11"
            placeholder="Fund or firm name"
            aria-invalid={Boolean(errors.organization)}
            {...form.register("organization")}
          />
          <AdminFieldError message={errors.organization?.message} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.jobTitle)}>
          <AdminFormFieldLabel
            htmlFor={`${idPrefix}-job-title`}
            hint={`Optional · 2–${INVESTOR_JOB_TITLE_MAX} chars`}
          >
            Job title
          </AdminFormFieldLabel>
          <Input
            id={`${idPrefix}-job-title`}
            disabled={disabled}
            maxLength={INVESTOR_JOB_TITLE_MAX}
            className="min-h-11"
            placeholder="e.g. Partner"
            aria-invalid={Boolean(errors.jobTitle)}
            {...form.register("jobTitle")}
          />
          <AdminFieldError message={errors.jobTitle?.message} />
        </Field>
        <Field data-invalid={Boolean(errors.linkedin)}>
          <AdminFormFieldLabel
            htmlFor={`${idPrefix}-linkedin`}
            hint={`Optional · http(s):// · max ${INVESTOR_URL_MAX}`}
          >
            LinkedIn
          </AdminFormFieldLabel>
          <UrlInput
            id={`${idPrefix}-linkedin`}
            disabled={disabled}
            maxLength={INVESTOR_URL_MAX}
            className="min-h-11"
            placeholder="linkedin.com/in/…"
            aria-invalid={Boolean(errors.linkedin)}
            {...form.register("linkedin")}
          />
          <AdminFieldError message={errors.linkedin?.message} />
        </Field>
      </div>
      <Field data-invalid={Boolean(errors.investorType)}>
        <Label htmlFor={`${idPrefix}-type`}>Investor type</Label>
        <Controller
          control={form.control}
          name="investorType"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value);
              }}
              disabled={disabled}
            >
              <SelectTrigger id={`${idPrefix}-type`} className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVESTOR_KINDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {INVESTOR_ADMIN_LABELS.kindLabels[value] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <AdminFieldError message={errors.investorType?.message} />
      </Field>
    </>
  );
}

export function InvestorCommsOptInField({
  form,
  disabled,
}: {
  form: UseFormReturn<InvestorContactEditValues>;
  disabled: boolean;
}) {
  return (
    <Field>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-4"
          disabled={disabled}
          {...form.register("commsOptIn")}
        />
        <span>Comms opt-in</span>
      </label>
    </Field>
  );
}
