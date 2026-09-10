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
  updateImpactMetric,
} from "@/actions/impact-metrics";
import { loadImpactEvidenceOptions } from "@/actions/admin-pickers";
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
import {
  SuggestInput,
  SuggestLinesInput,
} from "@/components/dashboard/suggest-input";
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
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { IMPACT_METRIC_EDITOR_HELP } from "@/constants/impact-metric-editor-help";
import {
  applyImpactDisplayLocationSuggestion,
  filterImpactClaimLabels,
  filterImpactDisplayLocations,
  filterImpactGeographies,
} from "@/constants/impact-suggestions";
import { impactMetricDetailPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  dummyImpactMetricValues,
  todayIsoDate,
} from "@/lib/admin/dummy-form-values";
import { cn } from "@/lib/utils";
import type { EvidenceOption, ImpactMetric } from "@/types/impact-metric";
import {
  createImpactMetricSchema,
  IMPACT_CLAIM_LABEL_MAX,
  IMPACT_DISPLAY_LOCATION_MAX,
  IMPACT_DISPLAY_LOCATIONS_MAX,
  IMPACT_GEOGRAPHY_MAX,
  IMPACT_LENSES,
  IMPACT_PUBLISH_STATUSES,
  IMPACT_UNIT_MAX,
  IMPACT_VALUE_MAX,
  type CreateImpactMetricInput,
  type ImpactMetricFormValues,
} from "@/validations/impact-metric";

const IMPACT_METRIC_EDITOR_STEPS = [
  { id: "claim", title: "Claim", description: "Label & value" },
  { id: "period", title: "Period", description: "Dates & evidence" },
  { id: "publishing", title: "Publishing", description: "Scope & surfaces" },
];

function defaultsFor(metric?: ImpactMetric): ImpactMetricFormValues {
  const today = todayIsoDate();
  return {
    claimLabel: metric?.claim_label ?? "",
    value: metric?.value ?? "",
    unit: metric?.unit ?? "",
    periodStart: metric?.period_start ?? today,
    periodEnd: metric?.period_end ?? today,
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
};

export function ImpactMetricEditorForm({
  mode,
  metric,
  evidenceOptions: initialOptions = [],
}: ImpactMetricEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [step, setStep] = useState(IMPACT_METRIC_EDITOR_STEPS[0].id);
  const [evidenceOptions, setEvidenceOptions] = useState<EvidenceOption[]>(
    initialOptions,
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(
    Boolean(metric?.evidence_id),
  );
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(optionsEnabled);

  const form = useForm<
    ImpactMetricFormValues,
    unknown,
    CreateImpactMetricInput
  >({
    resolver: zodResolver(createImpactMetricSchema),
    mode: "onChange",
    defaultValues: defaultsFor(metric),
  });

  useEffect(() => {
    if (!optionsEnabled) return;

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
  }, [optionsEnabled, debouncedSearch, metric?.evidence_id]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = form;

  useUnsavedChangesGuard(isDirty && !isPending);

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
      form.reset(form.getValues());
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
    <div className="grid w-full gap-6">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3">
        <AdminFormDevTools
          disabled={isPending}
          onDummy={() => {
            const current = form.getValues();
            form.reset(
              {
                ...current,
                ...dummyImpactMetricValues({
                  ...current,
                  evidenceId: current.evidenceId || evidenceOptions[0]?.id || "",
                }),
              },
              { keepDefaultValues: true },
            );
          }}
          onClear={() => {
            form.reset(defaultsFor(), { keepDefaultValues: true });
          }}
        />
      </div>

      <form
        className={`mx-auto grid w-full max-w-3xl gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Stepper
          steps={IMPACT_METRIC_EDITOR_STEPS}
          value={step}
          onValueChange={setStep}
          orientation="horizontal"
          className="flex w-full flex-col items-center gap-6"
        >
          <StepperNav className="mx-auto w-full max-w-lg">
            {IMPACT_METRIC_EDITOR_STEPS.map((s, index) => (
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
                {index < IMPACT_METRIC_EDITOR_STEPS.length - 1 ? (
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
              value="claim"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={IMPACT_METRIC_EDITOR_HELP.claim.title}
                description={IMPACT_METRIC_EDITOR_HELP.claim.intro}
                help={IMPACT_METRIC_EDITOR_HELP.claim}
                contentClassName="grid gap-4"
              >
                <Field data-invalid={!!errors.claimLabel}>
                  <AdminFormFieldLabel
                    htmlFor="impact-claim"
                    hint={`2–${IMPACT_CLAIM_LABEL_MAX}`}
                  >
                    Claim label
                  </AdminFormFieldLabel>
                  <Controller
                    control={control}
                    name="claimLabel"
                    render={({ field }) => {
                      const suggestions = filterImpactClaimLabels(field.value);
                      return (
                        <SuggestInput
                          id="impact-claim"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isPending}
                          maxLength={IMPACT_CLAIM_LABEL_MAX}
                          placeholder="e.g. Jobs created"
                          className="min-h-11"
                          aria-invalid={!!errors.claimLabel}
                          suggestions={suggestions}
                        />
                      );
                    }}
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
                      placeholder="e.g. 120"
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
                      placeholder="e.g. founders"
                      {...register("unit")}
                    />
                    <FieldError>{errors.unit?.message}</FieldError>
                  </Field>
                </div>
              </AdminFormSection>
            </StepperContent>

            <StepperContent
              value="period"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={IMPACT_METRIC_EDITOR_HELP.periodEvidence.title}
                description={IMPACT_METRIC_EDITOR_HELP.periodEvidence.intro}
                help={IMPACT_METRIC_EDITOR_HELP.periodEvidence}
                contentClassName="grid gap-4"
              >
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
                  <Controller
                    control={control}
                    name="evidenceId"
                    render={({ field }) => (
                      <EntitySelect
                        id="impact-evidence"
                        value={field.value || null}
                        onValueChange={(next) => field.onChange(next ?? "")}
                        options={evidenceOptions.map((option) => ({
                          id: option.id,
                          label: `${option.primary_source} (${option.status})`,
                        }))}
                        placeholder={
                          optionsLoading
                            ? "Loading evidence…"
                            : "Select evidence"
                        }
                        disabled={isPending}
                        onOpenChange={(open) => {
                          if (open) setOptionsEnabled(true);
                        }}
                        searchValue={optionSearch}
                        onSearchChange={setOptionSearch}
                        searchPlaceholder="Search evidence by source…"
                        emptyMessage={
                          optionsLoading
                            ? "Loading…"
                            : optionSearch.trim()
                              ? "No evidence matches"
                              : "No evidence available"
                        }
                        aria-invalid={!!errors.evidenceId}
                      />
                    )}
                  />
                  <FieldError>{errors.evidenceId?.message}</FieldError>
                </Field>
              </AdminFormSection>
            </StepperContent>

            <StepperContent
              value="publishing"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={IMPACT_METRIC_EDITOR_HELP.publishing.title}
                description={IMPACT_METRIC_EDITOR_HELP.publishing.intro}
                help={IMPACT_METRIC_EDITOR_HELP.publishing}
                contentClassName="grid gap-4"
              >
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
                          items={IMPACT_PUBLISH_STATUSES.map((status) => ({
                            value: status,
                            label: IMPACT_PUBLISH_STATUS_LABELS[status],
                          }))}
                          onValueChange={(value) => {
                            if (value) field.onChange(value);
                          }}
                          disabled={isPending}
                        >
                          <SelectTrigger
                            id="impact-status"
                            className="min-h-11 w-full"
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
                          items={[
                            { value: "none", label: "None" },
                            ...IMPACT_LENSES.map((lens) => ({
                              value: lens,
                              label: IMPACT_LENS_LABELS[lens],
                            })),
                          ]}
                          onValueChange={(value) =>
                            field.onChange(
                              !value || value === "none" ? null : value,
                            )
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger
                            id="impact-lens"
                            className="min-h-11 w-full"
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
                  <Controller
                    control={control}
                    name="geography"
                    render={({ field }) => {
                      const suggestions = filterImpactGeographies(
                        field.value ?? "",
                      );
                      return (
                        <SuggestInput
                          id="impact-geography"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isPending}
                          maxLength={IMPACT_GEOGRAPHY_MAX}
                          placeholder="e.g. West Africa"
                          className="min-h-11"
                          aria-invalid={!!errors.geography}
                          suggestions={suggestions}
                        />
                      );
                    }}
                  />
                  <FieldError>{errors.geography?.message}</FieldError>
                </Field>

                <Field data-invalid={!!errors.displayLocations}>
                  <AdminFormFieldLabel
                    htmlFor="impact-locations"
                    hint={`One per line · max ${IMPACT_DISPLAY_LOCATION_MAX} each · up to ${IMPACT_DISPLAY_LOCATIONS_MAX}`}
                  >
                    Display locations
                  </AdminFormFieldLabel>
                  <Controller
                    control={control}
                    name="displayLocations"
                    render={({ field }) => {
                      const raw =
                        typeof field.value === "string"
                          ? field.value
                          : Array.isArray(field.value)
                            ? field.value.join("\n")
                            : "";
                      const suggestions = filterImpactDisplayLocations(raw);
                      return (
                        <SuggestLinesInput
                          id="impact-locations"
                          value={raw}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isPending}
                          maxLength={
                            IMPACT_DISPLAY_LOCATION_MAX *
                              IMPACT_DISPLAY_LOCATIONS_MAX +
                            IMPACT_DISPLAY_LOCATIONS_MAX
                          }
                          rows={3}
                          aria-invalid={!!errors.displayLocations}
                          placeholder={
                            "homepage_module_02\nimpact_page"
                          }
                          suggestions={suggestions}
                          applySuggestion={applyImpactDisplayLocationSuggestion}
                        />
                      );
                    }}
                  />
                  <FieldError>{errors.displayLocations?.message}</FieldError>
                </Field>
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
            disabled={
              isAdminFormSubmitDisabled({ isPending, isDirty, errors }) ||
              optionsLoading ||
              evidenceOptions.length === 0
            }
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create metric" : "Save changes"}
          </Button>
        </AdminEditorActionsBar>
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
    </div>
  );
}
