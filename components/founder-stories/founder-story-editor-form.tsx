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
  loadStoryStartupOptions,
  updateFounderStory,
} from "@/actions/founder-stories";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
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

type FounderStoryEditorFormProps = {
  mode: "create" | "edit";
  story?: FounderStoryDetail;
  /** Seed for edit (locked startup). Create loads lazily. */
  startups?: StartupStoryOption[];
  heading: string;
  description: string;
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
    theProblem: story?.the_problem ?? "",
    whatTheyBuilt: story?.what_they_built ?? "",
    theAsipConnection: story?.the_asip_connection ?? "",
    whereTheyAreNow: story?.where_they_are_now ?? "",
    founderQuoteText: story?.founder_quote_text ?? "",
    quoteAttributionName: story?.quote_attribution_name ?? "",
    quoteAttributionTitle: story?.quote_attribution_title ?? "",
    quoteDate: story?.quote_date ?? "",
    quotePermissionStatus: story?.quote_permission_status ?? "",
    publishStatus: story?.publish_status ?? "draft",
  };
}

export function FounderStoryEditorForm({
  mode,
  story,
  startups: initialStartups = [],
  heading,
  description,
}: FounderStoryEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
    formState: { errors },
  } = useForm<CreateFounderStoryInput>({
    resolver: zodResolver(createFounderStorySchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: defaultsFor(story),
  });

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
    <div className="grid gap-6">
      <div className="min-w-0">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Startup & status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <FieldLabel htmlFor="startupId">Startup</FieldLabel>
              {mode === "create" ? (
                <Input
                  id="startup-search"
                  value={optionSearch}
                  onChange={(event) => setOptionSearch(event.target.value)}
                  onFocus={() => setOptionsEnabled(true)}
                  maxLength={100}
                  placeholder="Search startups…"
                  className="mb-2 min-h-11"
                  disabled={isPending}
                  aria-label="Search startups"
                />
              ) : null}
              <Controller
                control={control}
                name="startupId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    disabled={
                      isPending ||
                      mode === "edit" ||
                      optionsLoading ||
                      (mode === "create" && startups.length === 0)
                    }
                  >
                    <SelectTrigger id="startupId" className="min-h-11 w-full">
                      <SelectValue
                        placeholder={
                          optionsLoading
                            ? "Loading startups…"
                            : startups.length === 0
                              ? "No startups available"
                              : "Select a startup"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {startups.map((startup) => (
                        <SelectItem key={startup.id} value={startup.id}>
                          {startup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <FieldLabel htmlFor="publishStatus">Publish status</FieldLabel>
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
                    <SelectTrigger id="publishStatus" className="min-h-11 w-full">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Story modules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
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

        <Card>
          <CardHeader>
            <CardTitle>Founder quote (optional)</CardTitle>
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
                <Input
                  id="quoteAttributionTitle"
                  disabled={isPending}
                  {...register("quoteAttributionTitle")}
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
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value ?? "")}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="quotePermissionStatus"
                        className="min-h-11 w-full"
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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <span />
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={() => router.push(ROUTES.founderStories)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending || (mode === "create" && startups.length === 0)}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              {mode === "create" ? "Create story" : "Save changes"}
            </Button>
          </div>
        </div>
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
