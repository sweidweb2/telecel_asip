"use client";

import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

import {
  createCohort,
  deleteCohort,
  updateCohort,
} from "@/actions/cohorts";
import { loadCohortLinkOptions } from "@/actions/admin-pickers";
import {
  CmsEditorFrame,
  CmsEditorSaveActions,
} from "@/components/dashboard/cms-editor-frame";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { EntityMultiSelect } from "@/components/dashboard/entity-multi-select";
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
import { StepperContent } from "@/components/ui/stepper";
import { COHORT_EDITOR_HELP } from "@/constants/cohort-editor-help";
import { cohortEditPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";
import {
  applyClearFormValues,
  applyDummyFormValues,
  dummyCohortValues,
  todayIsoDate,
} from "@/lib/dummy-form-values";
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
  {
    id: "programme",
    title: "Program",
    description: "Identity & dates",
    fields: [
      "year",
      "publicLabel",
      "programmeDatesStart",
      "programmeDatesEnd",
      "programmeStatus",
      "publishStatus",
      "summary",
      "mediaUrl",
    ],
  },
  {
    id: "links",
    title: "Links",
    description: "Partners & founders",
    fields: ["partnerIds", "startupIds"],
  },
];

type CohortEditorFormProps = {
  mode: "create" | "edit";
  cohort?: CohortAdminDetail;
  partners?: CohortLinkOption[];
  startups?: CohortLinkOption[];
  heading: string;
};

export function CohortEditorForm({
  mode,
  cohort,
  partners: initialPartners = [],
  startups: initialStartups = [],
}: CohortEditorFormProps) {
  const editor = useCmsEditorForm<CreateCohortInput>({
    mode,
    schema: createCohortSchema,
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
    recordId: cohort?.id,
    listPath: ROUTES.cohorts,
    detailPath: cohortEditPath,
    create: createCohort,
    update: updateCohort,
    remove: deleteCohort,
    saveError: "The cohort could not be saved. Please try again.",
    steps: COHORT_EDITOR_STEPS,
  });
  const { isPending, errors, step, setStep } = editor;
  const { register, control } = editor.form;
  const form = editor.form;
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

  return (
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={editor.handleFormSubmit}
      steps={COHORT_EDITOR_STEPS}
      step={step}
      onStepChange={setStep}
      panelClassName="w-full max-w-3xl"
      onDummy={() => {
        applyDummyFormValues(form, dummyCohortValues(form.getValues()));
      }}
      onClear={() => {
        applyClearFormValues(form, emptyCohortValues());
      }}
      actions={
        <CmsEditorSaveActions
          mode={mode}
          isPending={isPending}
          disabled={editor.submitDisabled()}
          createLabel="Create cohort"
          onDelete={() => editor.setDeleteOpen(true)}
        />
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete this cohort?",
        description:
          "This removes the cohort and its partner/startup links. This cannot be undone.",
        confirmLabel: "Delete cohort",
        onConfirm: editor.onDelete,
      }}
    >
            <StepperContent
              value="programme"
              className="mx-auto w-full max-w-3xl space-y-6"
            >              <AdminFormSection
                headerClassName="bg-brand-soft"
                title={COHORT_EDITOR_HELP.programme.title}
                description={COHORT_EDITOR_HELP.programme.intro}
                help={COHORT_EDITOR_HELP.programme}
                contentClassName="grid gap-4 sm:grid-cols-2"
              >
                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="year">Year</AdminFormFieldLabel>
                  <Input
                    id="year"
                    type="number"
                    className="min-h-11"
                    disabled={isPending}
                    placeholder="e.g. 2026"
                    {...register("year", { valueAsNumber: true })}
                  />
                  {errors.year ? (
                    <AdminFieldError message={errors.year.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="publicLabel"
                    hint={`${COHORT_PUBLIC_LABEL_MAX} max`}
                  >
                    Public label
                  </AdminFormFieldLabel>
                  <Input
                    id="publicLabel"
                    className="min-h-11"
                    disabled={isPending}
                    maxLength={COHORT_PUBLIC_LABEL_MAX}
                    placeholder="e.g. Cohort 6"
                    {...register("publicLabel")}
                  />
                  {errors.publicLabel ? (
                    <AdminFieldError message={errors.publicLabel.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="programmeDatesStart">
                    Program start
                  </AdminFormFieldLabel>
                  <Input
                    id="programmeDatesStart"
                    type="date"
                    className="min-h-11"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.programmeDatesStart)}
                    {...register("programmeDatesStart")}
                  />
                  {errors.programmeDatesStart ? (
                    <AdminFieldError message={errors.programmeDatesStart.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="programmeDatesEnd">
                    Program end
                  </AdminFormFieldLabel>
                  <Input
                    id="programmeDatesEnd"
                    type="date"
                    className="min-h-11"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.programmeDatesEnd)}
                    {...register("programmeDatesEnd")}
                  />
                  {errors.programmeDatesEnd ? (
                    <AdminFieldError message={errors.programmeDatesEnd.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="programmeStatus">
                    Program status
                  </AdminFormFieldLabel>
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
                          className="min-h-11 w-full"
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
                    <AdminFieldError message={errors.programmeStatus.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="publishStatus">Publish status</AdminFormFieldLabel>
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
                          className="min-h-11 w-full"
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
                    <AdminFieldError message={errors.publishStatus.message} />
                  ) : null}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <AdminFormFieldLabel
                    htmlFor="summary"
                    hint={`${COHORT_SUMMARY_MAX} max`}
                  >
                    Summary
                  </AdminFormFieldLabel>
                  <Textarea
                    id="summary"
                    rows={5}
                    disabled={isPending}
                    maxLength={COHORT_SUMMARY_MAX}
                    placeholder="What this cohort focuses on"
                    {...register("summary")}
                  />
                  {errors.summary ? (
                    <AdminFieldError message={errors.summary.message} />
                  ) : null}
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <AdminFormFieldLabel
                    htmlFor="mediaUrl"
                    hint={`Optional · http(s) · max ${COHORT_MEDIA_URL_MAX}`}
                  >
                    Media URL
                  </AdminFormFieldLabel>
                  <UrlInput
                    id="mediaUrl"
                    placeholder="example.com/media"
                    className="min-h-11"
                    disabled={isPending}
                    maxLength={COHORT_MEDIA_URL_MAX}
                    {...register("mediaUrl")}
                  />
                  {errors.mediaUrl ? (
                    <AdminFieldError message={errors.mediaUrl.message} />
                  ) : null}
                </div>
              </AdminFormSection>
            </StepperContent>

            <StepperContent
              value="links"
              className="mx-auto w-full max-w-3xl space-y-6"
            >              <AdminFormSection
                headerClassName="bg-brand-soft"
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
                      <AdminFormFieldLabel htmlFor="cohort-partners">Partners</AdminFormFieldLabel>
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
                      <AdminFormFieldLabel htmlFor="cohort-startups">
                        Founders / startups
                      </AdminFormFieldLabel>
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
                  <AdminFieldError message={errors.partnerIds.message} className="sm:col-span-2" />
                ) : null}
                {errors.startupIds ? (
                  <AdminFieldError message={errors.startupIds.message} className="sm:col-span-2" />
                ) : null}
              </AdminFormSection>
            </StepperContent>
    </CmsEditorFrame>
  );
}
