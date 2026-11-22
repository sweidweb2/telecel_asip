"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRouter } from "nextjs-toploader/app";
import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createFounderStory,
  deleteFounderStory,
  removeFounderStoryCover,
  updateFounderStory,
  uploadFounderStoryCover,
} from "@/actions/founder-stories";
import { loadStoryStartupOptions } from "@/actions/admin-pickers";
import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import {
  CmsEditorFrame,
  CmsEditorSaveActions,
} from "@/components/dashboard/cms-editor-frame";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminImagePreviewButton } from "@/components/dashboard/admin-image-preview-button";
import { AdminImageProcessingBanner } from "@/components/dashboard/admin-image-processing-banner";
import { EntitySelect } from "@/components/dashboard/entity-select";
import { FounderAttributionTitleInput } from "@/components/founder-stories/founder-attribution-title-input";
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
import { FOUNDER_STORY_EDITOR_HELP } from "@/constants/founder-story-editor-help";
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
import { founderStoryEditPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";
import { dummyFounderStoryValues, todayIsoDate } from "@/lib/dummy-form-values";
import type {
  FounderStoryDetail,
  StartupStoryOption,
} from "@/types/founder-story";
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  createFounderStorySchema,
  FOUNDER_STORY_ATTRIBUTION_NAME_MAX,
  FOUNDER_STORY_ATTRIBUTION_TITLE_MAX,
  FOUNDER_STORY_NARRATIVE_MAX,
  FOUNDER_STORY_QUOTE_MAX,
  QUOTE_PERMISSION_STATUSES,
  QUOTE_PERMISSION_STATUS_LABELS,
  type CreateFounderStoryInput,
  type FounderStoryFormValues,
} from "@/validations/founder-story";

const COVER_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const FOUNDER_STORY_EDITOR_STEPS = [
  {
    id: "startup",
    title: "Startup",
    description: "Company & status",
    fields: ["startupId", "publishStatus"],
  },
  {
    id: "story",
    title: "Story",
    description: "Narrative modules",
    fields: [
      "storyTitle",
      "coverImageUrl",
      "headlineStat",
      "theProblem",
      "whatTheyBuilt",
      "theAsipConnection",
      "whereTheyAreNow",
    ],
  },
  {
    id: "quote",
    title: "Quote",
    description: "Optional pull-quote",
    fields: [
      "founderQuoteText",
      "quoteAttributionName",
      "quoteAttributionTitle",
      "quoteDate",
      "quotePermissionStatus",
    ],
  },
];

type FounderStoryEditorFormProps = {
  mode: "create" | "edit";
  story?: FounderStoryDetail;
  /** Seed for edit (locked startup). Create loads lazily. */
  startups?: StartupStoryOption[];
  heading: string;
};

function defaultsFor(story?: FounderStoryDetail): FounderStoryFormValues {
  return {
    startupId: story?.startup_id ?? "",
    storyTitle: story?.story_title ?? "",
    coverImageUrl: story?.cover_image_url ?? "",
    headlineStat: story?.headline_stat ?? "",
    theProblem: story?.the_problem ?? "",
    whatTheyBuilt: story?.what_they_built ?? "",
    theAsipConnection: story?.the_asip_connection ?? "",
    whereTheyAreNow: story?.where_they_are_now ?? "",
    founderQuoteText: story?.founder_quote_text ?? "",
    quoteAttributionName: story?.quote_attribution_name ?? "",
    quoteAttributionTitle: story?.quote_attribution_title ?? "",
    quoteDate: story?.quote_date ?? todayIsoDate(),
    quotePermissionStatus: story?.quote_permission_status ?? "",
    publishStatus: story?.publish_status ?? "draft",
  };
}

export function FounderStoryEditorForm({
  mode,
  story,
  startups: initialStartups = [],
}: FounderStoryEditorFormProps) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(
    null,
  );
  /** `undefined` = use prop; otherwise local override after remove/upload. */
  const [coverOverride, setCoverOverride] = useState<
    string | null | undefined
  >(undefined);
  const storedCoverUrl =
    coverOverride !== undefined
      ? coverOverride
      : (story?.cover_image_url ?? null);

  const editor = useCmsEditorForm<FounderStoryFormValues, CreateFounderStoryInput>({
    mode,
    schema: createFounderStorySchema,
    defaultValues: defaultsFor(story),
    recordId: story?.id,
    listPath: ROUTES.founderStories,
    detailPath: founderStoryEditPath,
    create: createFounderStory,
    update: updateFounderStory,
    remove: deleteFounderStory,
    saveError: "The founder story could not be saved. Please try again.",
    steps: FOUNDER_STORY_EDITOR_STEPS,
  });
  const { form, isPending, errors, step, setStep } = editor;
  const { register, control, getValues, reset } = form;
  const [startups, setStartups] = useState(initialStartups);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(mode === "create" && optionsEnabled);

  const coverPreviewSrc = pendingCoverPreview ?? storedCoverUrl;

  function replacePendingCover(file: File | null) {
    if (pendingCoverPreview) URL.revokeObjectURL(pendingCoverPreview);
    if (!file) {
      setPendingCover(null);
      setPendingCoverPreview(null);
      return;
    }
    setPendingCover(file);
    setPendingCoverPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && file.size > UPLOAD_MAX_BYTES) {
      toast.error("Image must be under 10 MB.");
      event.currentTarget.value = "";
      return;
    }
    replacePendingCover(file);
    event.currentTarget.value = "";
  }

  async function uploadPendingCover(storyId: string): Promise<boolean> {
    if (!pendingCover) return true;
    const formData = new FormData();
    formData.append("file", pendingCover);
    setIsProcessingImage(true);
    const uploadToast = toast.loading("Processing image…");
    try {
      const result = await uploadFounderStoryCover(storyId, formData);
      if (result.status === "error") {
        toast.error(result.message, { id: uploadToast });
        return false;
      }
      toast.dismiss(uploadToast);
      replacePendingCover(null);
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

  function onSubmit(values: FounderStoryFormValues) {
    editor.run(async () => {
      const result =
        mode === "create"
          ? await createFounderStory(values)
          : await updateFounderStory({ ...values, id: story!.id });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      const coverUploaded = result.id
        ? await uploadPendingCover(result.id)
        : true;

      if (coverUploaded) {
        toast.success(result.message);
      } else {
        toast.error(
          mode === "create"
            ? "Story created, but the image could not be uploaded. Add it from this page."
            : "Story saved, but the image could not be uploaded. Try again.",
        );
      }

      if (mode === "create" && result.id) {
        router.push(founderStoryEditPath(result.id));
      } else if (mode === "edit") {
        form.reset(form.getValues());
      }
      router.refresh();
    });
  }

  function onRemoveCover() {
    if (!story) return;
    editor.run(async () => {
      const result = await removeFounderStoryCover(story.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      replacePendingCover(null);
      setCoverOverride(null);
      form.setValue("coverImageUrl", "", { shouldDirty: true });
      toast.success(result.message);
      router.refresh();
    });
  }

  useEffect(() => {
    if (mode !== "create" || !optionsEnabled) return;

    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const result = await loadStoryStartupOptions({
          search: debouncedSearch,
        });
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
        if (!cancelled) setOptionsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [mode, optionsEnabled, debouncedSearch]);

  const quoteText = useWatch({ control, name: "founderQuoteText" }) ?? "";
  const hasQuote = quoteText.trim().length > 0;

  return (
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={form.handleSubmit(onSubmit, editor.onInvalid)}
      steps={FOUNDER_STORY_EDITOR_STEPS}
      step={step}
      onStepChange={setStep}
      formClassName=""
      stepperClassName="flex flex-col gap-6"
      navClassName=""
      panelClassName="w-full"
      onDummy={() => {
        const current = getValues();
        reset(
          {
            ...current,
            ...dummyFounderStoryValues({
              ...current,
              startupId: current.startupId || startups[0]?.id || "",
            }),
          },
          { keepDefaultValues: true },
        );
      }}
      onClear={() => {
        reset(
          {
            ...defaultsFor(),
            // Keep locked startup on edit so the form stays valid.
            startupId: mode === "edit" ? getValues("startupId") : "",
          },
          { keepDefaultValues: true },
        );
        replacePendingCover(null);
      }}
      actions={
        <div className="flex w-full flex-col gap-3">
          <AdminImageProcessingBanner active={isProcessingImage} />
          <CmsEditorSaveActions
            mode={mode}
            isPending={isPending}
            pendingLabel={
              isProcessingImage
                ? "Processing image…"
                : mode === "create"
                  ? "Creating…"
                  : "Saving…"
            }
            disabled={
              editor.submitDisabled(Boolean(pendingCover)) ||
              (mode === "create" && startups.length === 0)
            }
            createLabel="Create story"
            deleteLabel="Delete story"
            onDelete={() => editor.setDeleteOpen(true)}
            leading={
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending}
                onClick={() => router.push(ROUTES.founderStories)}
              >
                Cancel
              </Button>
            }
            trailing={
              mode === "edit" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={isPending}
                  onClick={() => router.push(ROUTES.founderStories)}
                >
                  Cancel
                </Button>
              ) : undefined
            }
          />
        </div>
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete founder story?",
        description: (
          <>
            This permanently deletes the story
            {story?.startup_name ? ` for ${story.startup_name}` : ""}. This
            cannot be undone.
          </>
        ),
        confirmLabel: "Delete story",
        onConfirm: editor.onDelete,
      }}
    >
            <StepperContent value="startup" className="space-y-6">
              <AdminFormSection
                title="Startup & status"
                help={FOUNDER_STORY_EDITOR_HELP.startupStatus}
                contentClassName="grid gap-4"
              >
                  <div className="grid gap-4 md:grid-cols-2 md:items-start">
                    <div className="grid gap-2">
                      <AdminFormFieldLabel htmlFor="startupId">Startup</AdminFormFieldLabel>
                      <Controller
                        control={control}
                        name="startupId"
                        render={({ field }) => (
                          <EntitySelect
                            id="startupId"
                            value={field.value || null}
                            onValueChange={(next) => field.onChange(next ?? "")}
                            options={startups.map((startup) => ({
                              id: startup.id,
                              label: startup.name,
                            }))}
                            placeholder={
                              optionsLoading
                                ? "Loading startups…"
                                : startups.length === 0
                                  ? "No startups available"
                                  : "Select a startup"
                            }
                            disabled={isPending || mode === "edit"}
                            onOpenChange={(open) => {
                              if (open) setOptionsEnabled(true);
                            }}
                            {...(mode === "create"
                              ? {
                                  searchValue: optionSearch,
                                  onSearchChange: setOptionSearch,
                                  searchPlaceholder: "Search startups…",
                                  emptyMessage: optionsLoading
                                    ? "Loading…"
                                    : optionSearch.trim()
                                      ? "No startups match"
                                      : "No startups available",
                                }
                              : {})}
                            aria-invalid={Boolean(errors.startupId)}
                          />
                        )}
                      />
                      {errors.startupId ? (
                        <AdminFieldError message={errors.startupId.message} />
                      ) : null}
                      {mode === "edit" ? (
                        <p className="text-xs text-muted-foreground">
                          Each startup can have one founder story.
                        </p>
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
                            <SelectTrigger
                              id="publishStatus"
                              className="min-h-11 w-full"
                            >
                              <SelectValue placeholder="Status" />
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
                  </div>
              </AdminFormSection>
            </StepperContent>

            <StepperContent value="story" className="space-y-6">
              <AdminFormSection
                title="Story modules"
                help={FOUNDER_STORY_EDITOR_HELP.storyModules}
                contentClassName="grid gap-4"
              >
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <AdminFormFieldLabel htmlFor="storyTitle">Impact story title</AdminFormFieldLabel>
                      <Input id="storyTitle" disabled={isPending} maxLength={200} placeholder="A result-led editorial headline" {...register("storyTitle")} />
                      <AdminFieldError message={errors.storyTitle?.message} />
                    </div>
                    <div className="grid gap-3">
                      <AdminFormFieldLabel hint="Optional · JPEG / PNG / WebP / GIF · max 10 MB">
                        Impact cover image
                      </AdminFormFieldLabel>
                      <div className="relative aspect-[16/9] w-full max-w-xl overflow-hidden rounded-lg border border-border bg-muted">
                        {coverPreviewSrc ? (
                          pendingCoverPreview ? (
                            // Local blob preview — next/image cannot optimize object URLs.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coverPreviewSrc}
                              alt="Cover preview"
                              className="size-full object-cover"
                            />
                          ) : (
                            <Image
                              src={coverPreviewSrc}
                              alt={story?.story_title ?? "Founder story cover"}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 36rem"
                            />
                          )
                        ) : (
                          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                            No cover image yet
                          </div>
                        )}
                        {coverPreviewSrc ? (
                          <>
                            <AdminImagePreviewButton
                              src={coverPreviewSrc}
                              alt={story?.story_title ?? "Founder story cover"}
                              label="View full cover"
                              disabled={isPending}
                            />
                            <AdminClearIconButton
                              label={
                                pendingCover
                                  ? "Clear image selection"
                                  : "Remove cover image"
                              }
                              disabled={isPending}
                              onClick={() => {
                                if (pendingCover) {
                                  replacePendingCover(null);
                                  return;
                                }
                                onRemoveCover();
                              }}
                            />
                          </>
                        ) : null}
                      </div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept={COVER_ACCEPT}
                        className="sr-only"
                        onChange={handleCoverChange}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-11"
                          disabled={isPending}
                          onClick={() => coverInputRef.current?.click()}
                        >
                          <UploadIcon className="size-4" />
                          {pendingCover || storedCoverUrl
                            ? "Replace cover"
                            : "Choose cover"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Optional. On create, the file uploads after the story row
                        is saved. Images are resized and stored as WebP in the
                        founder-stories bucket.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <AdminFormFieldLabel htmlFor="headlineStat">Headline stat</AdminFormFieldLabel>
                      <Input id="headlineStat" disabled={isPending} maxLength={80} placeholder="e.g. 1,500 households served" {...register("headlineStat")} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="theProblem"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      The problem
                    </AdminFormFieldLabel>
                    <Textarea
                      id="theProblem"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="What problem they set out to solve"
                      {...register("theProblem")}
                    />
                    {errors.theProblem ? (
                      <AdminFieldError message={errors.theProblem.message} />
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="whatTheyBuilt"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      What they built
                    </AdminFormFieldLabel>
                    <Textarea
                      id="whatTheyBuilt"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="Product or service they shipped"
                      {...register("whatTheyBuilt")}
                    />
                    {errors.whatTheyBuilt ? (
                      <AdminFieldError message={errors.whatTheyBuilt.message} />
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="theAsipConnection"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      The ASIP connection
                    </AdminFormFieldLabel>
                    <Textarea
                      id="theAsipConnection"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="How ASIP connected to their progress"
                      {...register("theAsipConnection")}
                    />
                    {errors.theAsipConnection ? (
                      <AdminFieldError message={errors.theAsipConnection.message} />
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="whereTheyAreNow"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      Where they are now
                    </AdminFormFieldLabel>
                    <Textarea
                      id="whereTheyAreNow"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="Current traction or next step"
                      {...register("whereTheyAreNow")}
                    />
                    {errors.whereTheyAreNow ? (
                      <AdminFieldError message={errors.whereTheyAreNow.message} />
                    ) : null}
                  </div>
              </AdminFormSection>
            </StepperContent>

            <StepperContent value="quote" className="space-y-6">
              <AdminFormSection
                title="Founder quote (optional)"
                help={FOUNDER_STORY_EDITOR_HELP.founderQuote}
                contentClassName="grid gap-4"
              >
                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="founderQuoteText"
                      hint={`max ${FOUNDER_STORY_QUOTE_MAX}`}
                    >
                      Quote text
                    </AdminFormFieldLabel>
                    <Textarea
                      id="founderQuoteText"
                      className="min-h-24"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_QUOTE_MAX}
                      placeholder="A short quote in the founder’s voice"
                      {...register("founderQuoteText")}
                    />
                    {errors.founderQuoteText ? (
                      <AdminFieldError message={errors.founderQuoteText.message} />
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Stories can publish without a quote. A quote on a published
                      story requires attribution and granted permission.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <AdminFormFieldLabel
                        htmlFor="quoteAttributionName"
                        hint={`max ${FOUNDER_STORY_ATTRIBUTION_NAME_MAX}`}
                      >
                        Attribution name{hasQuote ? " *" : ""}
                      </AdminFormFieldLabel>
                      <Input
                        id="quoteAttributionName"
                        disabled={isPending}
                        className="min-h-11"
                        maxLength={FOUNDER_STORY_ATTRIBUTION_NAME_MAX}
                        placeholder="e.g. Ama Mensah"
                        aria-invalid={Boolean(errors.quoteAttributionName)}
                        {...register("quoteAttributionName")}
                      />
                      {errors.quoteAttributionName ? (
                        <AdminFieldError message={errors.quoteAttributionName.message} />
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <AdminFormFieldLabel
                        htmlFor="quoteAttributionTitle"
                        hint={`max ${FOUNDER_STORY_ATTRIBUTION_TITLE_MAX}`}
                      >
                        Attribution title
                      </AdminFormFieldLabel>
                      <Controller
                        control={control}
                        name="quoteAttributionTitle"
                        render={({ field }) => (
                          <FounderAttributionTitleInput
                            id="quoteAttributionTitle"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={isPending}
                            className="min-h-11"
                            maxLength={FOUNDER_STORY_ATTRIBUTION_TITLE_MAX}
                            placeholder="e.g. Founder & CEO"
                            aria-invalid={Boolean(errors.quoteAttributionTitle)}
                          />
                        )}
                      />
                      {errors.quoteAttributionTitle ? (
                        <AdminFieldError message={errors.quoteAttributionTitle.message} />
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <AdminFormFieldLabel htmlFor="quoteDate">Quote date</AdminFormFieldLabel>
                      <Input
                        id="quoteDate"
                        type="date"
                        disabled={isPending}
                        className="min-h-11"
                        aria-invalid={Boolean(errors.quoteDate)}
                        {...register("quoteDate")}
                      />
                      {errors.quoteDate ? (
                        <AdminFieldError message={errors.quoteDate.message} />
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <AdminFormFieldLabel htmlFor="quotePermissionStatus">
                        Quote permission{hasQuote ? " *" : ""}
                      </AdminFormFieldLabel>
                      <Controller
                        control={control}
                        name="quotePermissionStatus"
                        render={({ field }) => (
                          <Select
                            value={field.value || null}
                            items={QUOTE_PERMISSION_STATUSES.map((status) => ({
                              value: status,
                              label: QUOTE_PERMISSION_STATUS_LABELS[status],
                            }))}
                            onValueChange={(value) =>
                              field.onChange(value ?? "")
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger
                              id="quotePermissionStatus"
                              className="min-h-11 w-full"
                              aria-invalid={Boolean(
                                errors.quotePermissionStatus,
                              )}
                            >
                              <SelectValue placeholder="Select permission" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUOTE_PERMISSION_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {QUOTE_PERMISSION_STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.quotePermissionStatus ? (
                        <AdminFieldError message={errors.quotePermissionStatus.message} />
                      ) : null}
                    </div>
                  </div>
              </AdminFormSection>
            </StepperContent>
    </CmsEditorFrame>
  );
}
