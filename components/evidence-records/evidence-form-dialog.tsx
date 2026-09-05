"use client";

import { useId, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createEvidenceRecord,
  updateEvidenceRecord,
} from "@/actions/evidence-records";
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
import { Label } from "@/components/ui/label";
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
import type {
  EvidenceListItem,
  EvidenceOwnerOption,
} from "@/types/evidence-record";
import {
  createEvidenceRecordSchema,
  EVIDENCE_PRIMARY_SOURCE_MAX,
  EVIDENCE_SOURCE_URL_MAX,
  type CreateEvidenceRecordInput,
  type EvidenceFormValues,
} from "@/validations/evidence-record";

const PAIR_ROW =
  "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto] sm:gap-x-5 sm:gap-y-2";
const PAIR_FIELD = "sm:row-span-3 sm:grid sm:grid-rows-subgrid";

function FieldLabelRow({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      <span className="text-[0.6875rem] leading-4 text-muted-foreground">
        {hint}
      </span>
    </div>
  );
}

function ownerLabel(owner: EvidenceOwnerOption): string {
  const name = owner.full_name?.trim();
  return name ? `${name} (${owner.email})` : owner.email;
}

function defaultsFor(
  record: EvidenceListItem | undefined,
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
  record?: EvidenceListItem;
  owners: EvidenceOwnerOption[];
  defaultOwnerId: string;
  triggerRender?: React.ReactElement;
  triggerContent?: React.ReactNode;
};

export function EvidenceFormDialog({
  mode,
  record,
  owners,
  defaultOwnerId,
  triggerRender,
  triggerContent,
}: EvidenceFormDialogProps) {
  const formId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EvidenceFormValues, unknown, CreateEvidenceRecordInput>({
    resolver: zodResolver(createEvidenceRecordSchema),
    mode: "onBlur",
    defaultValues: defaultsFor(record, defaultOwnerId),
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset(defaultsFor(record, defaultOwnerId));
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
              <FieldLabelRow
                htmlFor={`${formId}-primary-source`}
                hint={`2–${EVIDENCE_PRIMARY_SOURCE_MAX} chars`}
              >
                Primary source
              </FieldLabelRow>
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
              <FieldLabelRow
                htmlFor={`${formId}-source-url`}
                hint="Optional http(s)"
              >
                Source file URL
              </FieldLabelRow>
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

            <div className={PAIR_ROW}>
              <Field
                className={PAIR_FIELD}
                data-invalid={!!form.formState.errors.measurementPeriodStart}
              >
                <FieldLabelRow
                  htmlFor={`${formId}-period-start`}
                  hint="Required"
                >
                  Period start
                </FieldLabelRow>
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
                className={PAIR_FIELD}
                data-invalid={!!form.formState.errors.measurementPeriodEnd}
              >
                <FieldLabelRow htmlFor={`${formId}-period-end`} hint="Required">
                  Period end
                </FieldLabelRow>
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
              <FieldLabelRow htmlFor={`${formId}-owner`} hint="Required">
                Owner
              </FieldLabelRow>
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
                      <SelectValue placeholder="Select owner" />
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

            <div className={PAIR_ROW}>
              <Field
                className={PAIR_FIELD}
                data-invalid={!!form.formState.errors.status}
              >
                <FieldLabelRow htmlFor={`${formId}-status`} hint="Required">
                  Status
                </FieldLabelRow>
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
                className={PAIR_FIELD}
                data-invalid={!!form.formState.errors.permission}
              >
                <FieldLabelRow htmlFor={`${formId}-permission`} hint="Required">
                  Permission
                </FieldLabelRow>
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

            <div className={PAIR_ROW}>
              <Field
                className={PAIR_FIELD}
                data-invalid={!!form.formState.errors.lastVerifiedDate}
              >
                <FieldLabelRow
                  htmlFor={`${formId}-last-verified`}
                  hint="Required"
                >
                  Last verified
                </FieldLabelRow>
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
                className={PAIR_FIELD}
                data-invalid={!!form.formState.errors.reviewDate}
              >
                <FieldLabelRow htmlFor={`${formId}-review`} hint="Required">
                  Review date
                </FieldLabelRow>
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
            disabled={isPending || owners.length === 0}
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
