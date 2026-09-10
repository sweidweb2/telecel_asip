"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createEvidenceRecord,
  deleteEvidenceRecord,
  updateEvidenceRecord,
} from "@/actions/evidence-records";
import { loadEvidenceFormOptions } from "@/actions/admin-pickers";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { EntitySelect } from "@/components/dashboard/entity-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UrlInput } from "@/components/ui/url-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_PERMISSIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
} from "@/constants/evidence-labels";
import { EVIDENCE_EDITOR_HELP } from "@/constants/evidence-editor-help";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  dummyEvidenceValues,
  todayIsoDate,
} from "@/lib/admin/dummy-form-values";
import { cn } from "@/lib/utils";
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
  { id: "source", title: "Source", description: "Citation & file" },
  { id: "period", title: "Period", description: "Dates & owner" },
  { id: "governance", title: "Governance", description: "Status & review" },
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [step, setStep] = useState(EVIDENCE_EDITOR_STEPS[0].id);
  const [owners, setOwners] = useState<EvidenceOwnerOption[]>(initialOwners);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(
    mode === "create" || Boolean(record?.owner_id),
  );
  const [hasAppliedDefaultOwner, setHasAppliedDefaultOwner] = useState(
    Boolean(record?.owner_id || initialDefaultOwnerId),
  );
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(optionsEnabled);

  const form = useForm<EvidenceFormValues, unknown, CreateEvidenceRecordInput>({
    resolver: zodResolver(createEvidenceRecordSchema),
    mode: "onChange",
    defaultValues: defaultsFor(record, initialDefaultOwnerId),
  });
  const ownerId = useWatch({ control: form.control, name: "ownerId" });
  const { errors, isDirty } = form.formState;
  useUnsavedChangesGuard(isDirty && !isPending);

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

  function onSubmit(values: CreateEvidenceRecordInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEvidenceRecord(values)
          : await updateEvidenceRecord({ ...values, id: record!.id });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (mode === "create" && result.id) {
        router.push(evidenceDetailPath(result.id));
        return;
      }
      form.reset(form.getValues());
      router.refresh();
    });
  }

  function onDelete() {
    if (!record) return;
    startTransition(async () => {
      const result = await deleteEvidenceRecord({ id: record.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteOpen(false);
      router.push(ROUTES.evidence);
    });
  }

  return (
    <div className="grid w-full gap-6">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3">
        <AdminFormDevTools
          disabled={isPending}
          onDummy={() => {
            const current = form.getValues();
            form.reset(
              {
                ...current,
                ...dummyEvidenceValues({
                  ...current,
                  ownerId:
                    current.ownerId ||
                    owners[0]?.id ||
                    initialDefaultOwnerId ||
                    "",
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
        />
      </div>

      <form
        className={`mx-auto grid w-full max-w-3xl gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <Stepper
          steps={EVIDENCE_EDITOR_STEPS}
          value={step}
          onValueChange={setStep}
          orientation="horizontal"
          className="flex w-full flex-col items-center gap-6"
        >
          <StepperNav className="mx-auto w-full max-w-lg">
            {EVIDENCE_EDITOR_STEPS.map((s, index) => (
              <StepperItem key={s.id} stepId={s.id} className="relative flex-1">
                <StepperTrigger className="flex w-full flex-col items-center gap-2.5">
                  <StepperIndicator>{index + 1}</StepperIndicator>
                  <div className="min-w-0 text-center">
                    <StepperTitle>{s.title}</StepperTitle>
                    <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                      {s.description}
                    </p>
                  </div>
                </StepperTrigger>
                {index < EVIDENCE_EDITOR_STEPS.length - 1 ? (
                  <StepperSeparator
                    className={cn(
                      "absolute inset-x-0 top-4",
                      "right-[calc(-50%+18px)] left-[calc(50%+18px)]",
                      "m-0 h-0.5 flex-none",
                    )}
                  />
                ) : null}
              </StepperItem>
            ))}
          </StepperNav>

          <StepperPanel className="w-full max-w-3xl">
            <StepperContent
              value="source"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={EVIDENCE_EDITOR_HELP.source.title}
                description={EVIDENCE_EDITOR_HELP.source.intro}
                help={EVIDENCE_EDITOR_HELP.source}
                contentClassName="grid gap-4"
              >
                <Field data-invalid={!!errors.primarySource}>
                  <AdminFormFieldLabel
                    htmlFor={`${formId}-primary-source`}
                    hint={`2–${EVIDENCE_PRIMARY_SOURCE_MAX} chars`}
                  >
                    Primary source
                  </AdminFormFieldLabel>
                  <Textarea
                    id={`${formId}-primary-source`}
                    rows={3}
                    maxLength={EVIDENCE_PRIMARY_SOURCE_MAX}
                    disabled={isPending}
                    aria-invalid={!!errors.primarySource}
                    placeholder="Report title, URL, or citation"
                    {...form.register("primarySource")}
                  />
                  <FieldError>{errors.primarySource?.message}</FieldError>
                </Field>

                <Field data-invalid={!!errors.sourceFileUrl}>
                  <AdminFormFieldLabel
                    htmlFor={`${formId}-source-url`}
                    hint="Optional http(s)"
                  >
                    Source file URL
                  </AdminFormFieldLabel>
                  <UrlInput
                    id={`${formId}-source-url`}
                    placeholder="example.com/report.pdf"
                    className="min-h-11"
                    maxLength={EVIDENCE_SOURCE_URL_MAX}
                    disabled={isPending}
                    aria-invalid={!!errors.sourceFileUrl}
                    {...form.register("sourceFileUrl")}
                  />
                  <FieldError>{errors.sourceFileUrl?.message}</FieldError>
                </Field>
              </AdminFormSection>
            </StepperContent>

            <StepperContent
              value="period"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={EVIDENCE_EDITOR_HELP.periodOwner.title}
                description={EVIDENCE_EDITOR_HELP.periodOwner.intro}
                help={EVIDENCE_EDITOR_HELP.periodOwner}
                contentClassName="grid gap-4"
              >
                <div className={ADMIN_FORM_PAIR_ROW}>
                  <Field
                    className={ADMIN_FORM_PAIR_FIELD}
                    data-invalid={!!errors.measurementPeriodStart}
                  >
                    <AdminFormFieldLabel
                      htmlFor={`${formId}-period-start`}
                      hint="Required"
                    >
                      Period start
                    </AdminFormFieldLabel>
                    <Input
                      id={`${formId}-period-start`}
                      type="date"
                      className="min-h-11"
                      disabled={isPending}
                      aria-invalid={!!errors.measurementPeriodStart}
                      {...form.register("measurementPeriodStart")}
                    />
                    <FieldError>
                      {errors.measurementPeriodStart?.message}
                    </FieldError>
                  </Field>

                  <Field
                    className={ADMIN_FORM_PAIR_FIELD}
                    data-invalid={!!errors.measurementPeriodEnd}
                  >
                    <AdminFormFieldLabel
                      htmlFor={`${formId}-period-end`}
                      hint="Required"
                    >
                      Period end
                    </AdminFormFieldLabel>
                    <Input
                      id={`${formId}-period-end`}
                      type="date"
                      className="min-h-11"
                      disabled={isPending}
                      aria-invalid={!!errors.measurementPeriodEnd}
                      {...form.register("measurementPeriodEnd")}
                    />
                    <FieldError>
                      {errors.measurementPeriodEnd?.message}
                    </FieldError>
                  </Field>
                </div>

                <Field data-invalid={!!errors.ownerId}>
                  <AdminFormFieldLabel
                    htmlFor={`${formId}-owner`}
                    hint="Required"
                  >
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
              forceMount
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
                    <AdminFormFieldLabel
                      htmlFor={`${formId}-status`}
                      hint="Required"
                    >
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
                    <AdminFormFieldLabel
                      htmlFor={`${formId}-review`}
                      hint="Required"
                    >
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
          </StepperPanel>
        </Stepper>

        <AdminEditorActionsBar>
          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <Button
            type="submit"
            className="min-h-11 w-full sm:ml-auto sm:w-auto"
            // Keep Save enabled once an owner is chosen — option reloads must
            // not block edit saves (Playwright otherwise waits until test timeout).
            disabled={
              isAdminFormSubmitDisabled({ isPending, isDirty, errors }) ||
              !ownerId ||
              (optionsLoading && owners.length === 0)
            }
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create evidence" : "Save changes"}
          </Button>
        </AdminEditorActionsBar>
      </form>

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        showTrigger={false}
        title="Delete evidence record?"
        description="This permanently deletes this evidence entry. Impact metrics that reference it will need a new source before they can stay verified. This cannot be undone."
        confirmLabel="Delete evidence"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
