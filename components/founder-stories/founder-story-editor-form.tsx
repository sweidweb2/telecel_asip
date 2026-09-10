"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createFounderStory,
  deleteFounderStory,
  updateFounderStory,
} from "@/actions/founder-stories";
import { loadStoryStartupOptions } from "@/actions/admin-pickers";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminFormSectionHelp } from "@/components/dashboard/admin-form-section-help";
import { EntitySelect } from "@/components/dashboard/entity-select";
import { FounderAttributionTitleInput } from "@/components/founder-stories/founder-attribution-title-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FOUNDER_STORY_EDITOR_HELP } from "@/constants/founder-story-editor-help";
import { ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  firstInvalidEditorStep,
  isAdminFormSubmitDisabled,
} from "@/lib/admin/form-submit";
import { dummyFounderStoryValues, todayIsoDate } from "@/lib/admin/dummy-form-values";
import { cn } from "@/lib/utils";
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

const FOUNDER_STORY_EDITOR_STEPS = [
  { id: "startup", title: "Startup", description: "Company & status" },
  { id: "story", title: "Story", description: "Narrative modules" },
  { id: "quote", title: "Quote", description: "Optional pull-quote" },
];

type FounderStoryEditorFormProps = {
  mode: "create" | "edit";
  story?: FounderStoryDetail;
  /** Seed for edit (locked startup). Create loads lazily. */
  startups?: StartupStoryOption[];
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
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [step, setStep] = useState(FOUNDER_STORY_EDITOR_STEPS[0].id);
  const [startups, setStartups] = useState(initialStartups);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(mode === "create" && optionsEnabled);

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

  const {
    register,
    handleSubmit,
    control,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateFounderStoryInput>({
    resolver: zodResolver(createFounderStorySchema),
    mode: "onChange",
    defaultValues: defaultsFor(story),
  });

  useUnsavedChangesGuard(isDirty && !isPending);

  const quoteText = useWatch({ control, name: "founderQuoteText" }) ?? "";
  const hasQuote = quoteText.trim().length > 0;

  function onSubmit(values: CreateFounderStoryInput) {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createFounderStory(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        if (result.id) {
          router.push(`${ROUTES.founderStories}/${result.id}`);
          router.refresh();
        }
        return;
      }

      if (!story) return;
      const result = await updateFounderStory({ ...values, id: story.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      reset(values);
      router.refresh();
    });
  }

  function onDelete() {
    if (!story) return;
    startTransition(async () => {
      const result = await deleteFounderStory({ id: story.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      setIsDeleteOpen(false);
      toast.success(result.message);
      router.push(ROUTES.founderStories);
      router.refresh();
    });
  }

  return (
    <div className="grid w-full gap-6">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3">
        <AdminFormDevTools
          disabled={isPending}
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
                startupId:
                  mode === "edit"
                    ? getValues("startupId")
                    : "",
              },
              { keepDefaultValues: true },
            );
          }}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`grid gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
      >
        <Stepper
          steps={FOUNDER_STORY_EDITOR_STEPS}
          value={step}
          onValueChange={setStep}
          orientation="horizontal"
          className="flex flex-col gap-6"
        >
          <StepperNav>
            {FOUNDER_STORY_EDITOR_STEPS.map((s, index) => (
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
                {index < FOUNDER_STORY_EDITOR_STEPS.length - 1 ? (
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

          <StepperPanel className="w-full">
            <StepperContent value="startup" forceMount className="space-y-6">
              <Card size="sm">
                <CardHeader className="border-b">
                  <CardTitle>Startup & status</CardTitle>
                  <CardAction>
                    <AdminFormSectionHelp
                      help={FOUNDER_STORY_EDITOR_HELP.startupStatus}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="grid gap-5 md:grid-cols-2 md:items-start">
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="startupId">Startup</FieldLabel>
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
                        <p className="text-sm text-destructive">
                          {errors.startupId.message}
                        </p>
                      ) : null}
                      {mode === "edit" ? (
                        <p className="text-xs text-muted-foreground">
                          Each startup can have one founder story.
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel htmlFor="publishStatus">
                        Publish status
                      </FieldLabel>
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
                        <p className="text-sm text-destructive">
                          {errors.publishStatus.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StepperContent>

            <StepperContent value="story" forceMount className="space-y-6">
              <Card size="sm">
                <CardHeader className="border-b">
                  <CardTitle>Story modules</CardTitle>
                  <CardAction>
                    <AdminFormSectionHelp
                      help={FOUNDER_STORY_EDITOR_HELP.storyModules}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <FieldLabel htmlFor="storyTitle">Impact story title</FieldLabel>
                      <Input id="storyTitle" disabled={isPending} maxLength={200} placeholder="A result-led editorial headline" {...register("storyTitle")} />
                      {errors.storyTitle ? <p className="text-sm text-destructive">{errors.storyTitle.message}</p> : null}
                    </div>
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="coverImageUrl">Impact cover image URL</FieldLabel>
                      <Input id="coverImageUrl" disabled={isPending} maxLength={2048} placeholder="https://…" {...register("coverImageUrl")} />
                    </div>
                    <div className="grid gap-2">
                      <FieldLabel htmlFor="headlineStat">Headline stat</FieldLabel>
                      <Input id="headlineStat" disabled={isPending} maxLength={80} placeholder="e.g. 1,500 households served" {...register("headlineStat")} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel
                      htmlFor="theProblem"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      The problem
                    </FieldLabel>
                    <Textarea
                      id="theProblem"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="What problem they set out to solve"
                      {...register("theProblem")}
                    />
                    {errors.theProblem ? (
                      <p className="text-sm text-destructive">
                        {errors.theProblem.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <FieldLabel
                      htmlFor="whatTheyBuilt"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      What they built
                    </FieldLabel>
                    <Textarea
                      id="whatTheyBuilt"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="Product or service they shipped"
                      {...register("whatTheyBuilt")}
                    />
                    {errors.whatTheyBuilt ? (
                      <p className="text-sm text-destructive">
                        {errors.whatTheyBuilt.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <FieldLabel
                      htmlFor="theAsipConnection"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      The ASIP connection
                    </FieldLabel>
                    <Textarea
                      id="theAsipConnection"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="How ASIP connected to their progress"
                      {...register("theAsipConnection")}
                    />
                    {errors.theAsipConnection ? (
                      <p className="text-sm text-destructive">
                        {errors.theAsipConnection.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <FieldLabel
                      htmlFor="whereTheyAreNow"
                      hint={`max ${FOUNDER_STORY_NARRATIVE_MAX}`}
                    >
                      Where they are now
                    </FieldLabel>
                    <Textarea
                      id="whereTheyAreNow"
                      className="min-h-28"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_NARRATIVE_MAX}
                      placeholder="Current traction or next step"
                      {...register("whereTheyAreNow")}
                    />
                    {errors.whereTheyAreNow ? (
                      <p className="text-sm text-destructive">
                        {errors.whereTheyAreNow.message}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </StepperContent>

            <StepperContent value="quote" forceMount className="space-y-6">
              <Card size="sm">
                <CardHeader className="border-b">
                  <CardTitle>Founder quote (optional)</CardTitle>
                  <CardAction>
                    <AdminFormSectionHelp
                      help={FOUNDER_STORY_EDITOR_HELP.founderQuote}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="grid gap-2">
                    <FieldLabel
                      htmlFor="founderQuoteText"
                      hint={`max ${FOUNDER_STORY_QUOTE_MAX}`}
                    >
                      Quote text
                    </FieldLabel>
                    <Textarea
                      id="founderQuoteText"
                      className="min-h-24"
                      disabled={isPending}
                      maxLength={FOUNDER_STORY_QUOTE_MAX}
                      placeholder="A short quote in the founder’s voice"
                      {...register("founderQuoteText")}
                    />
                    {errors.founderQuoteText ? (
                      <p className="text-sm text-destructive">
                        {errors.founderQuoteText.message}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Stories can publish without a quote. A quote on a published
                      story requires attribution and granted permission.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <FieldLabel
                        htmlFor="quoteAttributionName"
                        hint={`max ${FOUNDER_STORY_ATTRIBUTION_NAME_MAX}`}
                      >
                        Attribution name{hasQuote ? " *" : ""}
                      </FieldLabel>
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
                        <p className="text-sm text-destructive">
                          {errors.quoteAttributionName.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel
                        htmlFor="quoteAttributionTitle"
                        hint={`max ${FOUNDER_STORY_ATTRIBUTION_TITLE_MAX}`}
                      >
                        Attribution title
                      </FieldLabel>
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
                        <p className="text-sm text-destructive">
                          {errors.quoteAttributionTitle.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel htmlFor="quoteDate">Quote date</FieldLabel>
                      <Input
                        id="quoteDate"
                        type="date"
                        disabled={isPending}
                        className="min-h-11"
                        aria-invalid={Boolean(errors.quoteDate)}
                        {...register("quoteDate")}
                      />
                      {errors.quoteDate ? (
                        <p className="text-sm text-destructive">
                          {errors.quoteDate.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <FieldLabel htmlFor="quotePermissionStatus">
                        Quote permission{hasQuote ? " *" : ""}
                      </FieldLabel>
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
                        <p className="text-sm text-destructive">
                          {errors.quotePermissionStatus.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete story
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={() => router.push(ROUTES.founderStories)}
            >
              Cancel
            </Button>
          )}
          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:justify-end">
            {mode === "edit" ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending}
                onClick={() => router.push(ROUTES.founderStories)}
              >
                Cancel
              </Button>
            ) : null}
            <Button
              type="submit"
              className="min-h-11 w-full sm:w-auto"
              disabled={
                isAdminFormSubmitDisabled({ isPending, isDirty, errors }) ||
                (mode === "create" && startups.length === 0)
              }
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              {mode === "create" ? "Create story" : "Save changes"}
            </Button>
          </div>
        </AdminEditorActionsBar>
      </form>


      <AdminDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        showTrigger={false}
        title="Delete founder story?"
        description={
          <>
            This permanently deletes the story
            {story?.startup_name ? ` for ${story.startup_name}` : ""}. This
            cannot be undone.
          </>
        }
        confirmLabel="Delete story"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </div>
  );
}
