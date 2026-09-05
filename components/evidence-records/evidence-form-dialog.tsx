"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createEvidenceRecord,
  loadEvidenceFormOptions,
  updateEvidenceRecord,
} from "@/actions/evidence-records";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
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
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
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

type EvidenceFormDialogProps = {
  mode: "create" | "edit";
  record?: EvidenceDetail;
  /** Preloaded options (detail edit). Create dialog loads on open when omitted. */
  owners?: EvidenceOwnerOption[];
  defaultOwnerId?: string;
  triggerRender?: React.ReactElement;
  triggerContent?: React.ReactNode;
};

export function EvidenceFormDialog({
  mode,
  record,
  owners: initialOwners,
  defaultOwnerId: initialDefaultOwnerId = "",
  triggerRender,
  triggerContent,
}: EvidenceFormDialogProps) {
  const formId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [owners, setOwners] = useState<EvidenceOwnerOption[]>(
    initialOwners ?? [],
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(open);
  const needsInitialResetRef = useRef(false);

  const form = useForm<EvidenceFormValues, unknown, CreateEvidenceRecordInput>({
    resolver: zodResolver(createEvidenceRecordSchema),
    mode: "onBlur",
    defaultValues: defaultsFor(record, initialDefaultOwnerId),
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOptions() {
      if (!debouncedSearch && initialOwners) {
        setOwners(initialOwners);
        return;
      }

      setOptionsLoading(true);
      try {
        const result = await loadEvidenceFormOptions(debouncedSearch);
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          setOwners([]);
          return;
        }
        setOwners(result.owners);
        if (needsInitialResetRef.current && !debouncedSearch) {
          needsInitialResetRef.current = false;
          form.reset(defaultsFor(record, result.defaultOwnerId));
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
  }, [open, debouncedSearch, initialOwners, form, record]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      needsInitialResetRef.current = false;
      return;
    }
    needsInitialResetRef.current = true;
    if (initialOwners) {
      setOwners(initialOwners);
      form.reset(defaultsFor(record, initialDefaultOwnerId));
      needsInitialResetRef.current = false;
    }
  }

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
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          triggerRender ?? (
            <Button className="w-full min-h-11 sm:w-auto sm:min-h-8">
              <PlusIcon />
              New evidence
            </Button>
          )
        }
      >
        {triggerContent}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,44rem)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>
            {mode === "create" ? "New evidence record" : "Edit evidence record"}
          </DialogTitle>
          <DialogDescription>
            Governance source for claims and impact metrics. Only verified
            status may back live numbers later.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
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
                aria-invalid={!!form.formState.errors.primarySource}
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
                maxLength={EVIDENCE_SOURCE_URL_MAX}
                aria-invalid={!!form.formState.errors.sourceFileUrl}
                {...form.register("sourceFileUrl")}
              />
              <FieldError>
                {form.formState.errors.sourceFileUrl?.message}
              </FieldError>
            </Field>

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
                <AdminFormFieldLabel htmlFor={`${formId}-period-end`} hint="Required">
                  Period end
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-period-end`}
                  type="date"
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
                maxLength={100}
                placeholder="Search owners by name or email…"
                className="mb-2 min-h-11 sm:min-h-8"
                aria-label="Search owners"
              />
              <Controller
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id={`${formId}-owner`}
                      className="w-full min-h-11 sm:min-h-8"
                      aria-invalid={!!form.formState.errors.ownerId}
                    >
                      <SelectValue
                        placeholder={
                          optionsLoading ? "Loading owners…" : "Select owner"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {ownerLabel(owner)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{form.formState.errors.ownerId?.message}</FieldError>
            </Field>

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
                    >
                      <SelectTrigger
                        id={`${formId}-status`}
                        className="w-full min-h-11 sm:min-h-8"
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
                <AdminFormFieldLabel htmlFor={`${formId}-permission`} hint="Required">
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
                    >
                      <SelectTrigger
                        id={`${formId}-permission`}
                        className="w-full min-h-11 sm:min-h-8"
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
                  aria-invalid={!!form.formState.errors.reviewDate}
                  {...form.register("reviewDate")}
                />
                <FieldError>
                  {form.formState.errors.reviewDate?.message}
                </FieldError>
              </Field>
            </div>
          </FieldGroup>
        </form>

        <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
            className="min-h-11 w-full sm:min-h-8 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isPending || optionsLoading || owners.length === 0}
            className="min-h-11 w-full sm:min-h-8 sm:w-auto"
          >
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : mode === "edit" ? (
              <PencilIcon />
            ) : (
              <PlusIcon />
            )}
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Create evidence"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
