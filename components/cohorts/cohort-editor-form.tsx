"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { useRouter } from "nextjs-toploader/app";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createCohort,
  deleteCohort,
  removeCohortMedia,
  updateCohort,
  uploadCohortMedia,
} from "@/actions/cohorts";
import { loadCohortLinkOptions } from "@/actions/admin-pickers";
import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import {
  CmsEditorFrame,
  CmsEditorSaveActions,
} from "@/components/dashboard/cms-editor-frame";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { AdminImagePreviewButton } from "@/components/dashboard/admin-image-preview-button";
import { AdminImageProcessingBanner } from "@/components/dashboard/admin-image-processing-banner";
import { EntityMultiSelect } from "@/components/dashboard/entity-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
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
  COHORT_PUBLIC_LABEL_MAX,
  COHORT_SUMMARY_MAX,
  createCohortSchema,
  type CreateCohortInput,
} from "@/validations/cohort";

const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

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
  const router = useRouter();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<File | null>(null);
  const [pendingMediaPreview, setPendingMediaPreview] = useState<string | null>(
    null,
  );
  /** `undefined` = use prop; otherwise local override after remove/upload. */
  const [mediaOverride, setMediaOverride] = useState<
    string | null | undefined
  >(undefined);
  const storedMediaUrl =
    mediaOverride !== undefined ? mediaOverride : (cohort?.media_url ?? null);

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

  const previewSrc = pendingMediaPreview ?? storedMediaUrl;

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

  function replacePendingMedia(file: File | null) {
    if (pendingMediaPreview) URL.revokeObjectURL(pendingMediaPreview);
    if (!file) {
      setPendingMedia(null);
      setPendingMediaPreview(null);
      return;
    }
    setPendingMedia(file);
    setPendingMediaPreview(URL.createObjectURL(file));
  }

  function handleMediaChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > UPLOAD_MAX_BYTES) {
      toast.error("Image must be under 10 MB.");
      event.currentTarget.value = "";
      return;
    }
    replacePendingMedia(file);
    event.currentTarget.value = "";
  }

  async function uploadPendingMedia(cohortId: string): Promise<boolean> {
    if (!pendingMedia) return true;
    const formData = new FormData();
    formData.append("file", pendingMedia);
    setIsProcessingImage(true);
    const uploadToast = toast.loading("Processing image…");
    try {
      const result = await uploadCohortMedia(cohortId, formData);
      if (result.status === "error") {
        toast.error(result.message, { id: uploadToast });
        return false;
      }
      toast.dismiss(uploadToast);
      replacePendingMedia(null);
      return true;
    } catch {
      toast.error(
        "The image could not be uploaded. Check that it is under 10 MB and try again.",
        { id: uploadToast },
      );
      return false;
    } finally {
      setIsProcessingImage(false);
    }
  }

  function onSubmit(values: CreateCohortInput) {
    editor.run(async () => {
      const result =
        mode === "create"
          ? await createCohort(values)
          : await updateCohort({ ...values, id: cohort!.id });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      const mediaUploaded = result.id
        ? await uploadPendingMedia(result.id)
        : true;

      if (mediaUploaded) {
        toast.success(result.message);
      } else {
        toast.error(
          mode === "create"
            ? "Cohort created, but the image could not be uploaded. Add it from this page."
            : "Cohort saved, but the image could not be uploaded. Try again.",
        );
      }

      if (mode === "create" && result.id) {
        router.push(cohortEditPath(result.id));
      } else if (mode === "edit") {
        form.reset(form.getValues());
      }
      router.refresh();
    });
  }

  function onRemoveMedia() {
    if (!cohort) return;
    editor.run(async () => {
      const result = await removeCohortMedia(cohort.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      replacePendingMedia(null);
      setMediaOverride(null);
      form.setValue("mediaUrl", "", { shouldDirty: true });
      toast.success(result.message);
      router.refresh();
    });
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

  const pendingLabel = isProcessingImage
    ? "Processing image…"
    : mode === "create"
      ? "Creating…"
      : "Saving…";

  return (
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={form.handleSubmit(onSubmit, editor.onInvalid)}
      steps={COHORT_EDITOR_STEPS}
      step={step}
      onStepChange={setStep}
      panelClassName="w-full max-w-3xl"
      onDummy={() => {
        applyDummyFormValues(form, dummyCohortValues(form.getValues()));
      }}
      onClear={() => {
        applyClearFormValues(form, emptyCohortValues());
        replacePendingMedia(null);
      }}
      actions={
        <CmsEditorSaveActions
          mode={mode}
          isPending={isPending}
          disabled={editor.submitDisabled(Boolean(pendingMedia))}
          createLabel="Create cohort"
          pendingLabel={pendingLabel}
          onDelete={() => editor.setDeleteOpen(true)}
        />
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete this cohort?",
        description:
          "This removes the cohort, its partner/startup links, and stored cover image. This cannot be undone.",
        confirmLabel: "Delete cohort",
        onConfirm: editor.onDelete,
      }}
    >
      <StepperContent
        value="programme"
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        <AdminFormSection
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
            <AdminFormFieldLabel htmlFor="publishStatus">
              Publish status
            </AdminFormFieldLabel>
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
                  <SelectTrigger id="publishStatus" className="min-h-11 w-full">
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
        </AdminFormSection>

        <AdminFormSection
          headerClassName="bg-brand-soft"
          title={COHORT_EDITOR_HELP.media.title}
          description={COHORT_EDITOR_HELP.media.intro}
          help={COHORT_EDITOR_HELP.media}
          contentClassName="grid gap-4"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted">
            {previewSrc ? (
              pendingMediaPreview ? (
                // Local blob preview — no optimization possible.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pendingMediaPreview}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <Image
                  src={previewSrc}
                  alt={cohort?.public_label ?? "Cohort cover"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 48rem"
                />
              )
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No cover image yet
              </div>
            )}
            {previewSrc ? (
              <>
                <AdminImagePreviewButton
                  src={previewSrc}
                  alt={cohort?.public_label ?? "Cohort cover"}
                  label="View full cover"
                  disabled={isPending}
                />
                <AdminClearIconButton
                  label={
                    pendingMedia ? "Clear image selection" : "Remove cover image"
                  }
                  disabled={isPending}
                  onClick={() => {
                    if (pendingMedia) {
                      replacePendingMedia(null);
                      return;
                    }
                    onRemoveMedia();
                  }}
                />
              </>
            ) : null}
          </div>
          <input
            ref={mediaInputRef}
            type="file"
            accept={MEDIA_ACCEPT}
            className="sr-only"
            onChange={handleMediaChange}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              disabled={isPending}
              onClick={() => mediaInputRef.current?.click()}
            >
              <UploadIcon className="size-4" />
              {pendingMedia || storedMediaUrl
                ? "Replace cover"
                : "Choose cover"}
            </Button>
          </div>
          <AdminImageProcessingBanner active={isProcessingImage} />
          <p className="text-xs text-muted-foreground">
            Optional. On create, the file uploads after the cohort row is saved.
            Clear the selection before save to skip the upload. Images are
            resized and stored as WebP in the cohorts bucket.
          </p>
        </AdminFormSection>
      </StepperContent>

      <StepperContent
        value="links"
        className="mx-auto w-full max-w-3xl space-y-6"
      >
        <AdminFormSection
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
                <AdminFormFieldLabel htmlFor="cohort-partners">
                  Partners
                </AdminFormFieldLabel>
                <EntityMultiSelect
                  id="cohort-partners"
                  value={field.value}
                  onValueChange={field.onChange}
                  options={partners.map((partner) => ({
                    id: partner.id,
                    label: partner.name,
                  }))}
                  placeholder={
                    partnersLoading ? "Loading partners…" : "Select partners"
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
                    startupsLoading ? "Loading startups…" : "Select startups"
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
            <AdminFieldError
              message={errors.partnerIds.message}
              className="sm:col-span-2"
            />
          ) : null}
          {errors.startupIds ? (
            <AdminFieldError
              message={errors.startupIds.message}
              className="sm:col-span-2"
            />
          ) : null}
        </AdminFormSection>
      </StepperContent>
    </CmsEditorFrame>
  );
}
