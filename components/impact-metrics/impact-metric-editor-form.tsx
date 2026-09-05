"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createImpactMetric,
  deleteImpactMetric,
  loadImpactEvidenceOptions,
  updateImpactMetric,
} from "@/actions/impact-metrics";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { Button } from "@/components/ui/button";
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
import { impactMetricDetailPath, ROUTES } from "@/constants/routes";
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

type ImpactMetricEditorFormProps = {
  mode: "create" | "edit";
  metric?: ImpactMetric;
  /** Seed for edit; form searches the rest via loadImpactEvidenceOptions. */
  evidenceOptions?: EvidenceOption[];
  heading: string;
  description: string;
};

export function ImpactMetricEditorForm({
  mode,
  metric,
  evidenceOptions: initialOptions = [],
  heading,
  description,
}: ImpactMetricEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [evidenceOptions, setEvidenceOptions] = useState<EvidenceOption[]>(
    initialOptions,
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(true);

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
    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const result = await loadImpactEvidenceOptions(
          debouncedSearch,
          metric?.evidence_id,
        );
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
  }, [debouncedSearch, metric?.evidence_id]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

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
      if (mode === "create" && result.id) {
        router.push(impactMetricDetailPath(result.id));
        return;
      }
      router.refresh();
    });
  }

  function onDelete() {
    if (!metric) return;
    startTransition(async () => {
      const result = await deleteImpactMetric({ id: metric.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteOpen(false);
      router.push(ROUTES.impactMetrics);
    });
  }

  return (
    <>
      <form
        className="grid max-w-3xl gap-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <FieldGroup>
          <Field data-invalid={!!errors.claimLabel}>
            <AdminFormFieldLabel
              htmlFor="impact-claim"
              hint={`2–${IMPACT_CLAIM_LABEL_MAX}`}
            >
              Claim label
            </AdminFormFieldLabel>
            <Input
              id="impact-claim"
              className="min-h-11"
              maxLength={IMPACT_CLAIM_LABEL_MAX}
              disabled={isPending}
              aria-invalid={!!errors.claimLabel}
              {...register("claimLabel")}
            />
            <FieldError>{errors.claimLabel?.message}</FieldError>
          </Field>

          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.value}
            >
              <AdminFormFieldLabel
                htmlFor="impact-value"
                hint={`Max ${IMPACT_VALUE_MAX}`}
              >
                Value
              </AdminFormFieldLabel>
              <Input
                id="impact-value"
                className="min-h-11"
                maxLength={IMPACT_VALUE_MAX}
                disabled={isPending}
                aria-invalid={!!errors.value}
                {...register("value")}
              />
              <FieldError>{errors.value?.message}</FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.unit}
            >
              <AdminFormFieldLabel
                htmlFor="impact-unit"
                hint={`Optional · max ${IMPACT_UNIT_MAX}`}
              >
                Unit
              </AdminFormFieldLabel>
              <Input
                id="impact-unit"
                className="min-h-11"
                maxLength={IMPACT_UNIT_MAX}
                disabled={isPending}
                aria-invalid={!!errors.unit}
                {...register("unit")}
              />
              <FieldError>{errors.unit?.message}</FieldError>
            </Field>
          </div>

          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.periodStart}
            >
              <AdminFormFieldLabel htmlFor="impact-start" hint="Required">
                Period start
              </AdminFormFieldLabel>
              <Input
                id="impact-start"
                type="date"
                className="min-h-11"
                disabled={isPending}
                aria-invalid={!!errors.periodStart}
                {...register("periodStart")}
              />
              <FieldError>{errors.periodStart?.message}</FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.periodEnd}
            >
              <AdminFormFieldLabel htmlFor="impact-end" hint="Required">
                Period end
              </AdminFormFieldLabel>
              <Input
                id="impact-end"
                type="date"
                className="min-h-11"
                disabled={isPending}
                aria-invalid={!!errors.periodEnd}
                {...register("periodEnd")}
              />
              <FieldError>{errors.periodEnd?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.evidenceId}>
            <AdminFormFieldLabel htmlFor="impact-evidence" hint="Required">
              Evidence record
            </AdminFormFieldLabel>
            <Input
              id="impact-evidence-search"
              value={optionSearch}
              onChange={(event) => setOptionSearch(event.target.value)}
              maxLength={100}
              placeholder="Search evidence by source…"
              className="mb-2 min-h-11"
              disabled={isPending}
              aria-label="Search evidence records"
            />
            <Controller
              control={control}
              name="evidenceId"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  disabled={isPending}
                >
                  <SelectTrigger
                    id="impact-evidence"
                    className="w-full min-h-11"
                    aria-invalid={!!errors.evidenceId}
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
            <FieldError>{errors.evidenceId?.message}</FieldError>
          </Field>

          <div className={ADMIN_FORM_PAIR_ROW}>
            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.publishStatus}
            >
              <AdminFormFieldLabel htmlFor="impact-status" hint="Required">
                Publish status
              </AdminFormFieldLabel>
              <Controller
                control={control}
                name="publishStatus"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="impact-status"
                      className="w-full min-h-11"
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
              <FieldError>{errors.publishStatus?.message}</FieldError>
            </Field>

            <Field
              className={ADMIN_FORM_PAIR_FIELD}
              data-invalid={!!errors.impactLens}
            >
              <AdminFormFieldLabel htmlFor="impact-lens" hint="Optional">
                Impact lens
              </AdminFormFieldLabel>
              <Controller
                control={control}
                name="impactLens"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(
                        !value || value === "none" ? null : value,
                      )
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="impact-lens"
                      className="w-full min-h-11"
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
              <FieldError>{errors.impactLens?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.geography}>
            <AdminFormFieldLabel
              htmlFor="impact-geography"
              hint={`Optional · max ${IMPACT_GEOGRAPHY_MAX}`}
            >
              Geography
            </AdminFormFieldLabel>
            <Input
              id="impact-geography"
              className="min-h-11"
              maxLength={IMPACT_GEOGRAPHY_MAX}
              disabled={isPending}
              aria-invalid={!!errors.geography}
              {...register("geography")}
            />
            <FieldError>{errors.geography?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.displayLocations}>
            <AdminFormFieldLabel
              htmlFor="impact-locations"
              hint="One per line"
            >
              Display locations
            </AdminFormFieldLabel>
            <Textarea
              id="impact-locations"
              rows={3}
              disabled={isPending}
              aria-invalid={!!errors.displayLocations}
              {...register("displayLocations")}
            />
            <FieldError>{errors.displayLocations?.message}</FieldError>
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending || optionsLoading || evidenceOptions.length === 0}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create metric" : "Save changes"}
          </Button>
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
          ) : null}
        </div>
      </form>

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        showTrigger={false}
        title="Delete impact metric?"
        description="This permanently deletes this metric. This cannot be undone."
        confirmLabel="Delete metric"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </>
  );
}
