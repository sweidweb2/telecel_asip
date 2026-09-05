"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createImpactMetric,
  loadImpactEvidenceOptions,
  updateImpactMetric,
} from "@/actions/impact-metrics";
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
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import type { EvidenceOption, ImpactMetric } from "@/types/impact-metric";
import {
  createImpactMetricSchema,
  IMPACT_CLAIM_LABEL_MAX,
  IMPACT_GEOGRAPHY_MAX,
  IMPACT_LENSES,
  IMPACT_PUBLISH_STATUSES,
  IMPACT_UNIT_MAX,
  IMPACT_VALUE_MAX,
  type CreateImpactMetricInput,
  type ImpactMetricFormValues,
} from "@/validations/impact-metric";

function defaultsFor(metric?: ImpactMetric): ImpactMetricFormValues {
  return {
    claimLabel: metric?.claim_label ?? "",
    value: metric?.value ?? "",
    unit: metric?.unit ?? "",
    periodStart: metric?.period_start ?? "",
    periodEnd: metric?.period_end ?? "",
    geography: metric?.geography ?? "",
    impactLens: metric?.impact_lens ?? null,
    displayLocations: (metric?.display_locations ?? []).join("\n"),
    evidenceId: metric?.evidence_id ?? "",
    publishStatus: metric?.publish_status ?? "pending",
  };
}

type ImpactMetricFormDialogProps = {
  mode: "create" | "edit";
  metric?: ImpactMetric;
  /** Preloaded options (detail edit). Create dialog loads on open when omitted. */
  evidenceOptions?: EvidenceOption[];
  triggerRender?: React.ReactElement;
  triggerContent?: React.ReactNode;
};

export function ImpactMetricFormDialog({
  mode,
  metric,
  evidenceOptions: initialOptions,
  triggerRender,
  triggerContent,
}: ImpactMetricFormDialogProps) {
  const formId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [evidenceOptions, setEvidenceOptions] = useState<EvidenceOption[]>(
    initialOptions ?? [],
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(open);

  const form = useForm<
    ImpactMetricFormValues,
    unknown,
    CreateImpactMetricInput
  >({
    resolver: zodResolver(createImpactMetricSchema),
    mode: "onBlur",
    defaultValues: defaultsFor(metric),
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOptions() {
      if (!debouncedSearch && initialOptions) {
        setEvidenceOptions(initialOptions);
        return;
      }

      setOptionsLoading(true);
      try {
        const result = await loadImpactEvidenceOptions(debouncedSearch);
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          setEvidenceOptions([]);
          return;
        }
        setEvidenceOptions(result.options);
      } catch {
        if (!cancelled) {
          toast.error("Could not load evidence options. Please try again.");
          setEvidenceOptions([]);
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch, initialOptions]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    form.reset(defaultsFor(metric));
  }

  function onSubmit(values: CreateImpactMetricInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createImpactMetric(values)
          : await updateImpactMetric({ ...values, id: metric!.id });

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
              New metric
            </Button>
          )
        }
      >
        {triggerContent}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,44rem)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>
            {mode === "create" ? "New impact metric" : "Edit impact metric"}
          </DialogTitle>
          <DialogDescription>
            Every metric must link to an evidence record. Only verified status
            should appear on the live site.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.claimLabel}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-claim`}
                hint={`2–${IMPACT_CLAIM_LABEL_MAX}`}
              >
                Claim label
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-claim`}
                maxLength={IMPACT_CLAIM_LABEL_MAX}
                aria-invalid={!!form.formState.errors.claimLabel}
                {...form.register("claimLabel")}
              />
              <FieldError>
                {form.formState.errors.claimLabel?.message}
              </FieldError>
            </Field>

            <div className={ADMIN_FORM_PAIR_ROW}>
              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={!!form.formState.errors.value}
              >
                <AdminFormFieldLabel
                  htmlFor={`${formId}-value`}
                  hint={`Max ${IMPACT_VALUE_MAX}`}
                >
                  Value
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-value`}
                  maxLength={IMPACT_VALUE_MAX}
                  aria-invalid={!!form.formState.errors.value}
                  {...form.register("value")}
                />
                <FieldError>{form.formState.errors.value?.message}</FieldError>
              </Field>

              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={!!form.formState.errors.unit}
              >
                <AdminFormFieldLabel
                  htmlFor={`${formId}-unit`}
                  hint={`Optional · max ${IMPACT_UNIT_MAX}`}
                >
                  Unit
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-unit`}
                  maxLength={IMPACT_UNIT_MAX}
                  aria-invalid={!!form.formState.errors.unit}
                  {...form.register("unit")}
                />
                <FieldError>{form.formState.errors.unit?.message}</FieldError>
              </Field>
            </div>

            <div className={ADMIN_FORM_PAIR_ROW}>
              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={!!form.formState.errors.periodStart}
              >
                <AdminFormFieldLabel htmlFor={`${formId}-start`} hint="Required">
                  Period start
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-start`}
                  type="date"
                  aria-invalid={!!form.formState.errors.periodStart}
                  {...form.register("periodStart")}
                />
                <FieldError>
                  {form.formState.errors.periodStart?.message}
                </FieldError>
              </Field>

              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={!!form.formState.errors.periodEnd}
              >
                <AdminFormFieldLabel htmlFor={`${formId}-end`} hint="Required">
                  Period end
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-end`}
                  type="date"
                  aria-invalid={!!form.formState.errors.periodEnd}
                  {...form.register("periodEnd")}
                />
                <FieldError>
                  {form.formState.errors.periodEnd?.message}
                </FieldError>
              </Field>
            </div>

            <Field data-invalid={!!form.formState.errors.evidenceId}>
              <AdminFormFieldLabel htmlFor={`${formId}-evidence`} hint="Required">
                Evidence record
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-evidence-search`}
                value={optionSearch}
                onChange={(event) => setOptionSearch(event.target.value)}
                maxLength={100}
                placeholder="Search evidence by source…"
                className="mb-2 min-h-11 sm:min-h-8"
                aria-label="Search evidence records"
              />
              <Controller
                control={form.control}
                name="evidenceId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value ?? "")}
                  >
                    <SelectTrigger
                      id={`${formId}-evidence`}
                      className="w-full min-h-11 sm:min-h-8"
                      aria-invalid={!!form.formState.errors.evidenceId}
                    >
                      <SelectValue
                        placeholder={
                          optionsLoading
                            ? "Loading evidence…"
                            : "Select evidence"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {evidenceOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.primary_source} ({option.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>
                {form.formState.errors.evidenceId?.message}
              </FieldError>
            </Field>

            <div className={ADMIN_FORM_PAIR_ROW}>
              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={!!form.formState.errors.publishStatus}
              >
                <AdminFormFieldLabel htmlFor={`${formId}-status`} hint="Required">
                  Publish status
                </AdminFormFieldLabel>
                <Controller
                  control={form.control}
                  name="publishStatus"
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
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_PUBLISH_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {IMPACT_PUBLISH_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.publishStatus?.message}
                </FieldError>
              </Field>

              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={!!form.formState.errors.impactLens}
              >
                <AdminFormFieldLabel htmlFor={`${formId}-lens`} hint="Optional">
                  Impact lens
                </AdminFormFieldLabel>
                <Controller
                  control={form.control}
                  name="impactLens"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) =>
                        field.onChange(
                          !value || value === "none" ? null : value,
                        )
                      }
                    >
                      <SelectTrigger
                        id={`${formId}-lens`}
                        className="w-full min-h-11 sm:min-h-8"
                      >
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {IMPACT_LENSES.map((lens) => (
                          <SelectItem key={lens} value={lens}>
                            {IMPACT_LENS_LABELS[lens]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>
                  {form.formState.errors.impactLens?.message}
                </FieldError>
              </Field>
            </div>

            <Field data-invalid={!!form.formState.errors.geography}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-geography`}
                hint={`Optional · max ${IMPACT_GEOGRAPHY_MAX}`}
              >
                Geography
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-geography`}
                maxLength={IMPACT_GEOGRAPHY_MAX}
                aria-invalid={!!form.formState.errors.geography}
                {...form.register("geography")}
              />
              <FieldError>
                {form.formState.errors.geography?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!form.formState.errors.displayLocations}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-locations`}
                hint="One per line"
              >
                Display locations
              </AdminFormFieldLabel>
              <Textarea
                id={`${formId}-locations`}
                rows={3}
                aria-invalid={!!form.formState.errors.displayLocations}
                {...form.register("displayLocations")}
              />
              <FieldError>
                {form.formState.errors.displayLocations?.message}
              </FieldError>
            </Field>
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
            disabled={isPending || optionsLoading || evidenceOptions.length === 0}
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
                ? "Create metric"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
