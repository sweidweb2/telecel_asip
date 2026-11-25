"use client";

import { useEffect, useId, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createEvidenceRecord,
  deleteEvidenceRecord,
  updateEvidenceRecord,
} from "@/actions/evidence-records";
import { loadEvidenceFormOptions } from "@/actions/admin-pickers";
import {
  CmsEditorFrame,
  CmsEditorSaveActions,
} from "@/components/dashboard/cms-editor-frame";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import {
  CmsTextareaField,
  CmsTextField,
  CmsUrlField,
} from "@/components/dashboard/cms-editor-fields";
import { EntitySelect } from "@/components/dashboard/entity-select";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepperContent } from "@/components/ui/stepper";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_PERMISSIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
} from "@/constants/evidence-labels";
import { EVIDENCE_EDITOR_HELP } from "@/constants/evidence-editor-help";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";
import { dummyEvidenceValues, todayIsoDate } from "@/lib/dummy-form-values";
import type {
  EvidenceDetail,
  EvidenceOwnerOption,
} from "@/types/evidence-record";
import {
  createEvidenceRecordSchema,
  EVIDENCE_PRIMARY_SOURCE_MAX,
  EVIDENCE_SOURCE_URL_MAX,
  type CreateEvidenceRecordInput,
  type EvidenceFormValues,
} from "@/validations/evidence-record";

const EVIDENCE_EDITOR_STEPS = [
  {
    id: "source",
    title: "Source",
    description: "Citation & file",
    fields: ["primarySource", "sourceFileUrl"],
  },
  {
    id: "period",
    title: "Period",
    description: "Dates & owner",
    fields: ["measurementPeriodStart", "measurementPeriodEnd", "ownerId"],
  },
  {
    id: "governance",
    title: "Governance",
    description: "Status & review",
    fields: ["status", "permission", "lastVerifiedDate", "reviewDate"],
  },
];

function ownerLabel(owner: EvidenceOwnerOption): string {
  const name = owner.full_name?.trim();
  return name ? `${name} (${owner.email})` : owner.email;
}

function defaultsFor(
  record: EvidenceDetail | undefined,
  defaultOwnerId: string,
): EvidenceFormValues {
  const today = todayIsoDate();
  return {
    primarySource: record?.primary_source ?? "",
    sourceFileUrl: record?.source_file_url ?? "",
    measurementPeriodStart: record?.measurement_period_start ?? today,
    measurementPeriodEnd: record?.measurement_period_end ?? today,
    ownerId: record?.owner_id ?? defaultOwnerId,
    status: record?.status ?? "pending",
    lastVerifiedDate: record?.last_verified_date ?? today,
    permission: record?.permission ?? "internal_only",
    reviewDate: record?.review_date ?? today,
  };
}

type EvidenceEditorFormProps = {
  mode: "create" | "edit";
  record?: EvidenceDetail;
  /** Seed for edit (current owner). Create loads lazily. */
  owners?: EvidenceOwnerOption[];
  defaultOwnerId?: string;
  heading: string;
};

export function EvidenceEditorForm({
  mode,
  record,
  owners: initialOwners = [],
  defaultOwnerId: initialDefaultOwnerId = "",
}: EvidenceEditorFormProps) {
  const formId = useId();
  const editor = useCmsEditorForm<
    EvidenceFormValues,
    CreateEvidenceRecordInput
  >({
    mode,
    schema: createEvidenceRecordSchema,
    defaultValues: defaultsFor(record, initialDefaultOwnerId),
    recordId: record?.id,
    listPath: ROUTES.evidence,
    detailPath: evidenceDetailPath,
    create: createEvidenceRecord,
    update: updateEvidenceRecord,
    remove: deleteEvidenceRecord,
    saveError: "The evidence record could not be saved. Please try again.",
    steps: EVIDENCE_EDITOR_STEPS,
  });
  const { form, isPending, errors, step, setStep } = editor;
  const [owners, setOwners] = useState<EvidenceOwnerOption[]>(initialOwners);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(
    mode === "create" || Boolean(record?.owner_id),
  );
  const [hasAppliedDefaultOwner, setHasAppliedDefaultOwner] = useState(
    Boolean(record?.owner_id || initialDefaultOwnerId),
  );
  const {
    search: optionSearch,
    setSearch: setOptionSearch,
    debouncedSearch,
  } = useDebouncedOptionSearch(optionsEnabled);
  const ownerId = useWatch({ control: form.control, name: "ownerId" });

  useEffect(() => {
    if (!optionsEnabled) return;

    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const result = await loadEvidenceFormOptions(
          debouncedSearch,
          record?.owner_id,
        );
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          setOwners([]);
          return;
        }
        setOwners(result.owners);
        if (
          !hasAppliedDefaultOwner &&
          !debouncedSearch &&
          !record?.owner_id &&
          result.defaultOwnerId
        ) {
          setHasAppliedDefaultOwner(true);
          form.setValue("ownerId", result.defaultOwnerId, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load owners. Please try again.");
          setOwners([]);
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [
    optionsEnabled,
    debouncedSearch,
    form,
    record,
    initialDefaultOwnerId,
    hasAppliedDefaultOwner,
  ]);

  return (
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={editor.handleFormSubmit}
      steps={EVIDENCE_EDITOR_STEPS}
      step={step}
      onStepChange={setStep}
      navClassName="mx-auto w-full max-w-lg"
      panelClassName="w-full max-w-3xl"
      onDummy={() => {
        const current = form.getValues();
        form.reset(
          {
            ...current,
            ...dummyEvidenceValues({
              ...current,
              ownerId:
                current.ownerId || owners[0]?.id || initialDefaultOwnerId || "",
            }),
          },
          { keepDefaultValues: true },
        );
      }}
      onClear={() => {
        form.reset(defaultsFor(undefined, initialDefaultOwnerId), {
          keepDefaultValues: true,
        });
      }}
      actions={
        <CmsEditorSaveActions
          mode={mode}
          isPending={isPending}
          // Keep Save enabled once an owner is chosen — option reloads must
          // not block edit saves (Playwright otherwise waits until test timeout).
          disabled={
            editor.submitDisabled() ||
            !ownerId ||
            (optionsLoading && owners.length === 0)
          }
          createLabel="Create evidence"
          onDelete={() => editor.setDeleteOpen(true)}
        />
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete evidence record?",
        description:
          "This permanently deletes this evidence entry. Impact metrics that reference it will need a new source before they can stay verified. This cannot be undone.",
        confirmLabel: "Delete evidence",
        onConfirm: editor.onDelete,
      }}
    >
      <StepperContent
        value="source"
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        <AdminFormSection
          title={EVIDENCE_EDITOR_HELP.source.title}
          description={EVIDENCE_EDITOR_HELP.source.intro}
          help={EVIDENCE_EDITOR_HELP.source}
          contentClassName="grid gap-4"
        >
          <CmsTextareaField
            id={`${formId}-primary-source`}
            label="Primary source"
            hint={`2–${EVIDENCE_PRIMARY_SOURCE_MAX} chars`}
            error={errors.primarySource?.message}
            disabled={isPending}
            register={form.register}
            name="primarySource"
            maxLength={EVIDENCE_PRIMARY_SOURCE_MAX}
            placeholder="Report title, URL, or citation"
          />

          <CmsUrlField
            id={`${formId}-source-url`}
            label="Source file URL"
            hint="Optional http(s)"
            error={errors.sourceFileUrl?.message}
            disabled={isPending}
            register={form.register}
            name="sourceFileUrl"
            maxLength={EVIDENCE_SOURCE_URL_MAX}
            placeholder="example.com/report.pdf"
          />
        </AdminFormSection>
      </StepperContent>

      <StepperContent
        value="period"
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        <AdminFormSection
          title={EVIDENCE_EDITOR_HELP.periodOwner.title}
          description={EVIDENCE_EDITOR_HELP.periodOwner.intro}
          help={EVIDENCE_EDITOR_HELP.periodOwner}
          contentClassName="grid gap-4"
        >
          <div className={ADMIN_FORM_PAIR_ROW}>
            <CmsTextField
              className={ADMIN_FORM_PAIR_FIELD}
              id={`${formId}-period-start`}
              label="Period start"
              hint="Required"
              error={errors.measurementPeriodStart?.message}
              disabled={isPending}
              register={form.register}
              name="measurementPeriodStart"
              type="date"
            />

            <CmsTextField
              className={ADMIN_FORM_PAIR_FIELD}
              id={`${formId}-period-end`}
              label="Period end"
              hint="Required"
              error={errors.measurementPeriodEnd?.message}
              disabled={isPending}
              register={form.register}
              name="measurementPeriodEnd"
              type="date"
            />
          </div>

          <Field data-invalid={!!errors.ownerId}>
            <AdminFormFieldLabel htmlFor={`${formId}-owner`} hint="Required">
              Owner
            </AdminFormFieldLabel>
            <Controller
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <EntitySelect
                  id={`${formId}-owner`}
                  value={field.value || null}
                  onValueChange={(next) => field.onChange(next ?? "")}
                  options={owners.map((owner) => ({
                    id: owner.id,
                    label: ownerLabel(owner),
                  }))}
                  placeholder={
                    optionsLoading ? "Loading owners…" : "Select owner"
                  }
                  disabled={isPending}
                  onOpenChange={(open) => {
                    if (open) setOptionsEnabled(true);
                  }}
                  searchValue={optionSearch}
                  onSearchChange={setOptionSearch}
                  searchPlaceholder="Search owners by name or email…"
                  emptyMessage={
                    optionsLoading
                      ? "Loading…"
                      : optionSearch.trim()
                        ? "No owners match"
                        : "No owners available"
                  }
                  aria-invalid={!!errors.ownerId}
                />
              )}
            />
            <FieldError>{errors.ownerId?.message}</FieldError>
          </Field>
        </AdminFormSection>
      </StepperContent>

      <StepperContent
        value="governance"
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        <AdminFormSection
          title={EVIDENCE_EDITOR_HELP.governance.title}
          description={EVIDENCE_EDITOR_HELP.governance.intro}
          help={EVIDENCE_EDITOR_HELP.governance}
          contentClassName="grid gap-4"
        >
          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.status}
            >
              <AdminFormFieldLabel htmlFor={`${formId}-status`} hint="Required">
                Status
              </AdminFormFieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={EVIDENCE_STATUSES.map((status) => ({
                      value: status,
                      label: EVIDENCE_STATUS_LABELS[status],
                    }))}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id={`${formId}-status`}
                      className="min-h-11 w-full"
                      aria-invalid={!!errors.status}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVIDENCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {EVIDENCE_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.status?.message}</FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.permission}
            >
              <AdminFormFieldLabel
                htmlFor={`${formId}-permission`}
                hint="Required"
              >
                Permission
              </AdminFormFieldLabel>
              <Controller
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    items={EVIDENCE_PERMISSIONS.map((permission) => ({
                      value: permission,
                      label: EVIDENCE_PERMISSION_LABELS[permission],
                    }))}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id={`${formId}-permission`}
                      className="min-h-11 w-full"
                      aria-invalid={!!errors.permission}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVIDENCE_PERMISSIONS.map((permission) => (
                        <SelectItem key={permission} value={permission}>
                          {EVIDENCE_PERMISSION_LABELS[permission]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.permission?.message}</FieldError>
            </Field>
          </div>

          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.lastVerifiedDate}
            >
              <AdminFormFieldLabel
                htmlFor={`${formId}-last-verified`}
                hint="Required"
              >
                Last verified
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-last-verified`}
                type="date"
                className="min-h-11"
                disabled={isPending}
                aria-invalid={!!errors.lastVerifiedDate}
                {...form.register("lastVerifiedDate")}
              />
              <FieldError>{errors.lastVerifiedDate?.message}</FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.reviewDate}
            >
              <AdminFormFieldLabel htmlFor={`${formId}-review`} hint="Required">
                Review date
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-review`}
                type="date"
                className="min-h-11"
                disabled={isPending}
                aria-invalid={!!errors.reviewDate}
                {...form.register("reviewDate")}
              />
              <FieldError>{errors.reviewDate?.message}</FieldError>
            </Field>
          </div>
        </AdminFormSection>
      </StepperContent>
    </CmsEditorFrame>
  );
}
