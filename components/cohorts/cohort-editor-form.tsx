"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createCohort,
  deleteCohort,
  updateCohort,
} from "@/actions/cohorts";
import { loadCohortLinkOptions } from "@/actions/admin-pickers";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { EntityMultiSelect } from "@/components/dashboard/entity-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { COHORT_EDITOR_HELP } from "@/constants/cohort-editor-help";
import { ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import {
  applyClearFormValues,
  applyDummyFormValues,
  dummyCohortValues,
  todayIsoDate,
} from "@/lib/admin/dummy-form-values";
import { cn } from "@/lib/utils";
import type { CohortAdminDetail, CohortLinkOption } from "@/types/cohort";
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  COHORT_PROGRAMME_STATUSES,
  COHORT_PROGRAMME_STATUS_LABELS,
  COHORT_MEDIA_URL_MAX,
  COHORT_PUBLIC_LABEL_MAX,
  COHORT_SUMMARY_MAX,
  createCohortSchema,
  type CreateCohortInput,
} from "@/validations/cohort";

const COHORT_EDITOR_STEPS = [
  { id: "programme", title: "Programme", description: "Identity & dates" },
  { id: "links", title: "Links", description: "Partners & founders" },
];

type CohortEditorFormProps = {
  mode: "create" | "edit";
  cohort?: CohortAdminDetail;
  partners?: CohortLinkOption[];
  startups?: CohortLinkOption[];
  heading: string;
};

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

export function CohortEditorForm({
  mode,
  cohort,
  partners: initialPartners = [],
  startups: initialStartups = [],
  heading,
}: CohortEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [step, setStep] = useState(COHORT_EDITOR_STEPS[0].id);
  const [partners, setPartners] = useState(initialPartners);
  const [startups, setStartups] = useState(initialStartups);
  const [partnersEnabled, setPartnersEnabled] = useState(false);
  const [startupsEnabled, setStartupsEnabled] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [startupsLoading, setStartupsLoading] = useState(false);
  const {
    search: partnerSearch,
    setSearch: setPartnerSearch,
    debouncedSearch: partnerDebouncedSearch,
  } = useDebouncedOptionSearch(partnersEnabled);
  const {
    search: startupSearch,
    setSearch: setStartupSearch,
    debouncedSearch: startupDebouncedSearch,
  } = useDebouncedOptionSearch(startupsEnabled);

  const form = useForm<CreateCohortInput>({
    resolver: zodResolver(createCohortSchema),
    mode: "onChange",
    defaultValues: {
      year: cohort?.year ?? new Date().getFullYear(),
      publicLabel: cohort?.public_label ?? "",
      programmeDatesStart: cohort?.programme_dates_start ?? todayIsoDate(),
      programmeDatesEnd: cohort?.programme_dates_end ?? todayIsoDate(),
      programmeStatus: cohort?.programme_status ?? "closed",
      summary: cohort?.summary ?? "",
      mediaUrl: cohort?.media_url ?? "",
      publishStatus: cohort?.publish_status ?? "draft",
      partnerIds: cohort?.partnerIds ?? [],
      startupIds: cohort?.startupIds ?? [],
    },
  });

  function emptyCohortValues(): CreateCohortInput {
    return {
      year: new Date().getFullYear(),
      publicLabel: "",
      programmeDatesStart: todayIsoDate(),
      programmeDatesEnd: todayIsoDate(),
      programmeStatus: "closed",
      summary: "",
      mediaUrl: "",
      publishStatus: "draft",
      partnerIds: [],
      startupIds: [],
    };
  }

  useEffect(() => {
    if (!partnersEnabled) return;

    let cancelled = false;

    async function loadPartners() {
      setPartnersLoading(true);
      try {
        const result = await loadCohortLinkOptions(partnerDebouncedSearch);
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          setPartners([]);
          return;
        }
        setPartners(result.partners);
      } catch {
        if (!cancelled) {
          toast.error("Could not load partners. Please try again.");
          setPartners([]);
        }
      } finally {
        if (!cancelled) setPartnersLoading(false);
      }
    }

    void loadPartners();
    return () => {
      cancelled = true;
    };
  }, [partnersEnabled, partnerDebouncedSearch]);

  useEffect(() => {
    if (!startupsEnabled) return;

    let cancelled = false;

    async function loadStartups() {
      setStartupsLoading(true);
      try {
        const result = await loadCohortLinkOptions(startupDebouncedSearch);
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          setStartups([]);
          return;
        }
        setStartups(result.startups);
      } catch {
        if (!cancelled) {
          toast.error("Could not load startups. Please try again.");
          setStartups([]);
        }
      } finally {
        if (!cancelled) setStartupsLoading(false);
      }
    }

    void loadStartups();
    return () => {
      cancelled = true;
    };
  }, [startupsEnabled, startupDebouncedSearch]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  function onSubmit(values: CreateCohortInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCohort(values)
          : await updateCohort({ ...values, id: cohort!.id });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (mode === "create" && result.id) {
        router.push(`${ROUTES.cohorts}/${result.id}`);
        return;
      }
      reset(values);
      router.refresh();
    });
  }

  function onDelete() {
    if (!cohort) return;
    startTransition(async () => {
      const result = await deleteCohort({ id: cohort.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteOpen(false);
      router.push(ROUTES.cohorts);
    });
  }

  return (
    <div className="grid w-full gap-6">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
        <AdminFormDevTools
          disabled={isPending}
          onDummy={() => {
            applyDummyFormValues(form, dummyCohortValues(form.getValues()));
          }}
          onClear={() => {
            applyClearFormValues(form, emptyCohortValues());
          }}
        />
      </div>

      <form
        className={`mx-auto grid w-full max-w-3xl gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Stepper
          steps={COHORT_EDITOR_STEPS}
          value={step}
          onValueChange={setStep}
          orientation="horizontal"
          className="flex w-full flex-col items-center gap-6"
        >
          <StepperNav className="mx-auto w-full max-w-md">
            {COHORT_EDITOR_STEPS.map((s, index) => (
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
                {index < COHORT_EDITOR_STEPS.length - 1 ? (
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
              value="programme"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >              <AdminFormSection
                title={COHORT_EDITOR_HELP.programme.title}
                description={COHORT_EDITOR_HELP.programme.intro}
                help={COHORT_EDITOR_HELP.programme}
                contentClassName="grid gap-5 sm:grid-cols-2"
              >
                <div className="grid gap-2">
                  <FieldLabel htmlFor="year">Year</FieldLabel>
                  <Input
                    id="year"
                    type="number"
                    className="min-h-11 bg-white dark:bg-card"
                    disabled={isPending}
                    placeholder="e.g. 2026"
                    {...register("year", { valueAsNumber: true })}
                  />
                  {errors.year ? (
                    <p className="text-sm text-destructive">
                      {errors.year.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <FieldLabel
                    htmlFor="publicLabel"
                    hint={`${COHORT_PUBLIC_LABEL_MAX} max`}
                  >
                    Public label
                  </FieldLabel>
                  <Input
                    id="publicLabel"
                    className="min-h-11 bg-white dark:bg-card"
                    disabled={isPending}
                    maxLength={COHORT_PUBLIC_LABEL_MAX}
                    placeholder="e.g. Cohort 6"
                    {...register("publicLabel")}
                  />
                  {errors.publicLabel ? (
                    <p className="text-sm text-destructive">
                      {errors.publicLabel.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="programmeDatesStart">
                    Programme start
                  </FieldLabel>
                  <Input
                    id="programmeDatesStart"
                    type="date"
                    className="min-h-11 bg-white dark:bg-card"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.programmeDatesStart)}
                    {...register("programmeDatesStart")}
                  />
                  {errors.programmeDatesStart ? (
                    <p className="text-sm text-destructive">
                      {errors.programmeDatesStart.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="programmeDatesEnd">
                    Programme end
                  </FieldLabel>
                  <Input
                    id="programmeDatesEnd"
                    type="date"
                    className="min-h-11 bg-white dark:bg-card"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.programmeDatesEnd)}
                    {...register("programmeDatesEnd")}
                  />
                  {errors.programmeDatesEnd ? (
                    <p className="text-sm text-destructive">
                      {errors.programmeDatesEnd.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="programmeStatus">
                    Programme status
                  </FieldLabel>
                  <Controller
                    control={control}
                    name="programmeStatus"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        items={COHORT_PROGRAMME_STATUSES.map((status) => ({
                          value: status,
                          label: COHORT_PROGRAMME_STATUS_LABELS[status],
                        }))}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="programmeStatus"
                          className="min-h-11 w-full bg-white dark:bg-card"
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {COHORT_PROGRAMME_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {COHORT_PROGRAMME_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.programmeStatus ? (
                    <p className="text-sm text-destructive">
                      {errors.programmeStatus.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="publishStatus">Publish status</FieldLabel>
                  <Controller
                    control={control}
                    name="publishStatus"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        items={CMS_PUBLISH_STATUSES.map((status) => ({
                          value: status,
                          label: CMS_PUBLISH_STATUS_LABELS[status],
                        }))}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                        disabled={isPending}
                      >
                        <SelectTrigger
                          id="publishStatus"
                          className="min-h-11 w-full bg-white dark:bg-card"
                        >
                          <SelectValue placeholder="Publish" />
                        </SelectTrigger>
                        <SelectContent>
                          {CMS_PUBLISH_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {CMS_PUBLISH_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.publishStatus ? (
                    <p className="text-sm text-destructive">
                      {errors.publishStatus.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <FieldLabel
                    htmlFor="summary"
                    hint={`${COHORT_SUMMARY_MAX} max`}
                  >
                    Summary
                  </FieldLabel>
                  <Textarea
                    id="summary"
                    rows={5}
                    className="bg-white dark:bg-card"
                    disabled={isPending}
                    maxLength={COHORT_SUMMARY_MAX}
                    placeholder="What this cohort focuses on"
                    {...register("summary")}
                  />
                  {errors.summary ? (
                    <p className="text-sm text-destructive">
                      {errors.summary.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <FieldLabel
                    htmlFor="mediaUrl"
                    hint={`Optional · http(s) · max ${COHORT_MEDIA_URL_MAX}`}
                  >
                    Media URL
                  </FieldLabel>
                  <UrlInput
                    id="mediaUrl"
                    placeholder="example.com/media"
                    className="min-h-11 bg-white dark:bg-card"
                    disabled={isPending}
                    maxLength={COHORT_MEDIA_URL_MAX}
                    {...register("mediaUrl")}
                  />
                  {errors.mediaUrl ? (
                    <p className="text-sm text-destructive">
                      {errors.mediaUrl.message}
                    </p>
                  ) : null}
                </div>
              </AdminFormSection>
            </StepperContent>

            <StepperContent
              value="links"
              forceMount
              className="mx-auto w-full max-w-3xl space-y-6"
            >              <AdminFormSection
                title={COHORT_EDITOR_HELP.links.title}
                description={COHORT_EDITOR_HELP.links.intro}
                help={COHORT_EDITOR_HELP.links}
                contentClassName="grid gap-4 sm:grid-cols-2"
              >
                <Controller
                  control={control}
                  name="partnerIds"
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="cohort-partners">Partners</FieldLabel>
                      <EntityMultiSelect
                        id="cohort-partners"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={partners.map((partner) => ({
                          id: partner.id,
                          label: partner.name,
                        }))}
                        placeholder={
                          partnersLoading
                            ? "Loading partners…"
                            : "Select partners"
                        }
                        disabled={isPending}
                        loading={partnersLoading}
                        onOpenChange={(open) => {
                          if (open) setPartnersEnabled(true);
                        }}
                        searchValue={partnerSearch}
                        onSearchChange={setPartnerSearch}
                        searchPlaceholder="Search partners…"
                        emptyMessage={
                          partnerSearch.trim()
                            ? "No partners match that search."
                            : "No options available yet."
                        }
                        aria-invalid={Boolean(errors.partnerIds)}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="startupIds"
                  render={({ field }) => (
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="cohort-startups">
                        Founders / startups
                      </FieldLabel>
                      <EntityMultiSelect
                        id="cohort-startups"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={startups.map((startup) => ({
                          id: startup.id,
                          label: startup.name,
                        }))}
                        placeholder={
                          startupsLoading
                            ? "Loading startups…"
                            : "Select startups"
                        }
                        disabled={isPending}
                        loading={startupsLoading}
                        onOpenChange={(open) => {
                          if (open) setStartupsEnabled(true);
                        }}
                        searchValue={startupSearch}
                        onSearchChange={setStartupSearch}
                        searchPlaceholder="Search startups…"
                        emptyMessage={
                          startupSearch.trim()
                            ? "No startups match that search."
                            : "No options available yet."
                        }
                        aria-invalid={Boolean(errors.startupIds)}
                      />
                    </div>
                  )}
                />
                {errors.partnerIds ? (
                  <p className="text-sm text-destructive sm:col-span-2">
                    {errors.partnerIds.message}
                  </p>
                ) : null}
                {errors.startupIds ? (
                  <p className="text-sm text-destructive sm:col-span-2">
                    {errors.startupIds.message}
                  </p>
                ) : null}
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
            disabled={isAdminFormSubmitDisabled({ isPending, isDirty, errors })}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create cohort" : "Save changes"}
          </Button>
        </AdminEditorActionsBar>
      </form>

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        showTrigger={false}
        title="Delete this cohort?"
        description="This removes the cohort and its partner/startup links. This cannot be undone."
        confirmLabel="Delete cohort"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
