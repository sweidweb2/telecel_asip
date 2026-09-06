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
  loadEvidenceFormOptions,
  updateEvidenceRecord,
} from "@/actions/evidence-records";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { EntitySelect } from "@/components/dashboard/entity-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_PERMISSIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
} from "@/constants/evidence-labels";
import { EVIDENCE_EDITOR_HELP } from "@/constants/evidence-editor-help";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
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

function ownerLabel(owner: EvidenceOwnerOption): string {
  const name = owner.full_name?.trim();
  return name ? `${name} (${owner.email})` : owner.email;
}

function defaultsFor(
  record: EvidenceDetail | undefined,
  defaultOwnerId: string,
): EvidenceFormValues {
  return {
    primarySource: record?.primary_source ?? "",
    sourceFileUrl: record?.source_file_url ?? "",
    measurementPeriodStart: record?.measurement_period_start ?? "",
    measurementPeriodEnd: record?.measurement_period_end ?? "",
    ownerId: record?.owner_id ?? defaultOwnerId,
    status: record?.status ?? "pending",
    lastVerifiedDate: record?.last_verified_date ?? "",
    permission: record?.permission ?? "internal_only",
    reviewDate: record?.review_date ?? "",
  };
}

type EvidenceEditorFormProps = {
  mode: "create" | "edit";
  record?: EvidenceDetail;
  /** Seed for edit (current owner). Create loads lazily. */
  owners?: EvidenceOwnerOption[];
  defaultOwnerId?: string;
  heading: string;
  description: string;
};

export function EvidenceEditorForm({
  mode,
  record,
  owners: initialOwners = [],
  defaultOwnerId: initialDefaultOwnerId = "",
  heading,
  description,
}: EvidenceEditorFormProps) {
  const formId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    <>
      <form
        className={`grid max-w-3xl gap-8 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <AdminFormSection
          title={EVIDENCE_EDITOR_HELP.source.title}
          description={EVIDENCE_EDITOR_HELP.source.intro}
          help={EVIDENCE_EDITOR_HELP.source}
          contentClassName="grid gap-4"
        >
          <Field data-invalid={!!form.formState.errors.primarySource}>
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
              aria-invalid={!!form.formState.errors.primarySource}
              className="bg-white dark:bg-card"
              {...form.register("primarySource")}
            />
            <FieldError>
              {form.formState.errors.primarySource?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!form.formState.errors.sourceFileUrl}>
            <AdminFormFieldLabel
              htmlFor={`${formId}-source-url`}
              hint="Optional http(s)"
            >
              Source file URL
            </AdminFormFieldLabel>
            <Input
              id={`${formId}-source-url`}
              type="url"
              inputMode="url"
              placeholder="https://"
              className="min-h-11 bg-white dark:bg-card"
              maxLength={EVIDENCE_SOURCE_URL_MAX}
              disabled={isPending}
              aria-invalid={!!form.formState.errors.sourceFileUrl}
              {...form.register("sourceFileUrl")}
            />
            <FieldError>
              {form.formState.errors.sourceFileUrl?.message}
            </FieldError>
          </Field>
        </AdminFormSection>

        <AdminFormSection
          title={EVIDENCE_EDITOR_HELP.periodOwner.title}
          description={EVIDENCE_EDITOR_HELP.periodOwner.intro}
          help={EVIDENCE_EDITOR_HELP.periodOwner}
          contentClassName="grid gap-4"
        >
          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!form.formState.errors.measurementPeriodStart}
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
                className="min-h-11 bg-white dark:bg-card"
                disabled={isPending}
                aria-invalid={
                  !!form.formState.errors.measurementPeriodStart
                }
                {...form.register("measurementPeriodStart")}
              />
              <FieldError>
                {form.formState.errors.measurementPeriodStart?.message}
              </FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!form.formState.errors.measurementPeriodEnd}
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
                className="min-h-11 bg-white dark:bg-card"
                disabled={isPending}
                aria-invalid={!!form.formState.errors.measurementPeriodEnd}
                {...form.register("measurementPeriodEnd")}
              />
              <FieldError>
                {form.formState.errors.measurementPeriodEnd?.message}
              </FieldError>
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.ownerId}>
            <AdminFormFieldLabel htmlFor={`${formId}-owner`} hint="Required">
              Owner
            </AdminFormFieldLabel>
            <Input
              id={`${formId}-owner-search`}
              value={optionSearch}
              onChange={(event) => setOptionSearch(event.target.value)}
              onFocus={() => setOptionsEnabled(true)}
              maxLength={100}
              placeholder="Search owners by name or email…"
              className="mb-2 min-h-11 bg-white dark:bg-card"
              disabled={isPending}
              aria-label="Search owners"
            />
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
                  aria-invalid={!!form.formState.errors.ownerId}
                />
              )}
            />
            <FieldError>{form.formState.errors.ownerId?.message}</FieldError>
          </Field>
        </AdminFormSection>

        <AdminFormSection
          title={EVIDENCE_EDITOR_HELP.governance.title}
          description={EVIDENCE_EDITOR_HELP.governance.intro}
          help={EVIDENCE_EDITOR_HELP.governance}
          contentClassName="grid gap-4"
        >
          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!form.formState.errors.status}
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
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id={`${formId}-status`}
                      className="w-full min-h-11"
                      aria-invalid={!!form.formState.errors.status}
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
              <FieldError>{form.formState.errors.status?.message}</FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!form.formState.errors.permission}
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
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id={`${formId}-permission`}
                      className="w-full min-h-11"
                      aria-invalid={!!form.formState.errors.permission}
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
              <FieldError>
                {form.formState.errors.permission?.message}
              </FieldError>
            </Field>
          </div>

          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!form.formState.errors.lastVerifiedDate}
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
                className="min-h-11 bg-white dark:bg-card"
                disabled={isPending}
                aria-invalid={!!form.formState.errors.lastVerifiedDate}
                {...form.register("lastVerifiedDate")}
              />
              <FieldError>
                {form.formState.errors.lastVerifiedDate?.message}
              </FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!form.formState.errors.reviewDate}
            >
              <AdminFormFieldLabel htmlFor={`${formId}-review`} hint="Required">
                Review date
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-review`}
                type="date"
                className="min-h-11 bg-white dark:bg-card"
                disabled={isPending}
                aria-invalid={!!form.formState.errors.reviewDate}
                {...form.register("reviewDate")}
              />
              <FieldError>
                {form.formState.errors.reviewDate?.message}
              </FieldError>
            </Field>
          </div>
        </AdminFormSection>

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
    </>
  );
}
