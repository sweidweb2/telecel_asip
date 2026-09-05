"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { createEvent, loadEventStartupOptions, updateEvent } from "@/actions/events";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import type { EventDetail, EventStartupOption } from "@/types/event";
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  createEventSchema,
  EVENT_ASSET_URL_MAX,
  EVENT_FORMAT_LABELS,
  EVENT_FORMATS,
  EVENT_LOCATION_MAX,
  EVENT_NAME_MAX,
  EVENT_OUTCOMES_MAX,
  EVENT_SPEAKER_MAX,
  type CreateEventInput,
  type EventFormValues,
} from "@/validations/event";

function defaultsFor(event?: EventDetail): EventFormValues {
  return {
    name: event?.name ?? "",
    eventDate: event?.event_date ?? "",
    location: event?.location ?? "",
    format: event?.format ?? "",
    speakers: (event?.speakers ?? []).join("\n"),
    assets: (event?.assets ?? []).join("\n"),
    outcomes: event?.outcomes ?? "",
    publishStatus: event?.publish_status ?? "draft",
    startupIds: event?.startup_ids ?? [],
  };
}

type EventFormDialogProps = {
  mode: "create" | "edit";
  event?: EventDetail;
  /** Preloaded options (detail edit). Create dialog loads on open when omitted. */
  startupOptions?: EventStartupOption[];
  triggerRender?: React.ReactElement;
  triggerContent?: React.ReactNode;
  onSaved?: () => void;
};

export function EventFormDialog({
  mode,
  event,
  startupOptions: initialOptions,
  triggerRender,
  triggerContent,
  onSaved,
}: EventFormDialogProps) {
  const formId = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [startupOptions, setStartupOptions] = useState<EventStartupOption[]>(
    initialOptions ?? [],
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(open);

  const form = useForm<EventFormValues, unknown, CreateEventInput>({
    resolver: zodResolver(
      createEventSchema,
    ) as Resolver<EventFormValues, unknown, CreateEventInput>,
    mode: "onBlur",
    defaultValues: defaultsFor(event),
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOptions() {
      if (!debouncedSearch && initialOptions) {
        setStartupOptions(initialOptions);
        return;
      }

      setOptionsLoading(true);
      try {
        const result = await loadEventStartupOptions(debouncedSearch);
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          setStartupOptions([]);
          return;
        }
        setStartupOptions(result.options);
      } catch {
        if (!cancelled) {
          toast.error("Could not load startups. Please try again.");
          setStartupOptions([]);
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
    form.reset(defaultsFor(event));
  }

  function onSubmit(values: CreateEventInput) {
    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createEvent(values)
            : await updateEvent({ ...values, id: event!.id });

        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        setOpen(false);
        onSaved?.();
        router.refresh();
        toast.success(result.message);
      } catch {
        toast.error("The event could not be saved. Please try again.");
      }
    });
  }

  const errors = form.formState.errors;
  const selectedIds =
    useWatch({ control: form.control, name: "startupIds" }) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          triggerRender ?? (
            <Button className="min-h-11 w-full sm:min-h-8 sm:w-auto" />
          )
        }
      >
        {triggerContent ?? (
          <>
            <PlusIcon />
            New event
          </>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New event" : "Edit event"}
          </DialogTitle>
          <DialogDescription>
            Name, date, format, speakers, assets, and linked startups.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-name`}
                hint={`Required · 2–${EVENT_NAME_MAX} chars`}
              >
                Name
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-name`}
                disabled={isPending}
                required
                maxLength={EVENT_NAME_MAX}
                placeholder="Event name"
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
              {errors.name ? (
                <FieldError>{errors.name.message}</FieldError>
              ) : null}
            </Field>

            <div className={ADMIN_FORM_PAIR_ROW}>
              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={Boolean(errors.eventDate)}
              >
                <AdminFormFieldLabel htmlFor={`${formId}-date`} hint="Required">
                  Event date
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-date`}
                  type="date"
                  disabled={isPending}
                  required
                  aria-invalid={Boolean(errors.eventDate)}
                  {...form.register("eventDate")}
                />
                {errors.eventDate ? (
                  <FieldError>{errors.eventDate.message}</FieldError>
                ) : null}
              </Field>

              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={Boolean(errors.publishStatus)}
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
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={`${formId}-status`}
                        className="min-h-11 w-full sm:min-h-9"
                      >
                        <SelectValue placeholder="Select status" />
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
                  <FieldError>{errors.publishStatus.message}</FieldError>
                ) : null}
              </Field>
            </div>

            <div className={ADMIN_FORM_PAIR_ROW}>
              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={Boolean(errors.location)}
              >
                <AdminFormFieldLabel
                  htmlFor={`${formId}-location`}
                  hint={`Optional · max ${EVENT_LOCATION_MAX}`}
                >
                  Location
                </AdminFormFieldLabel>
                <Input
                  id={`${formId}-location`}
                  disabled={isPending}
                  maxLength={EVENT_LOCATION_MAX}
                  placeholder="City or venue"
                  aria-invalid={Boolean(errors.location)}
                  {...form.register("location")}
                />
                {errors.location ? (
                  <FieldError>{errors.location.message}</FieldError>
                ) : null}
              </Field>

              <Field
                className={ADMIN_FORM_PAIR_FIELD}
                data-invalid={Boolean(errors.format)}
              >
                <AdminFormFieldLabel htmlFor={`${formId}-format`} hint="Optional">
                  Format
                </AdminFormFieldLabel>
                <Controller
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => {
                        if (!value || value === "none") {
                          field.onChange("");
                          return;
                        }
                        field.onChange(value);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id={`${formId}-format`}
                        className="min-h-11 w-full sm:min-h-9"
                      >
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No format</SelectItem>
                        {EVENT_FORMATS.map((format) => (
                          <SelectItem key={format} value={format}>
                            {EVENT_FORMAT_LABELS[format]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.format ? (
                  <FieldError>{errors.format.message}</FieldError>
                ) : null}
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.speakers)}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-speakers`}
                hint={`Optional · one per line · max ${EVENT_SPEAKER_MAX} chars each`}
              >
                Speakers
              </AdminFormFieldLabel>
              <Textarea
                id={`${formId}-speakers`}
                rows={3}
                disabled={isPending}
                placeholder={"Amina Diallo\nKwame Mensah"}
                aria-invalid={Boolean(errors.speakers)}
                {...form.register("speakers")}
              />
              {errors.speakers ? (
                <FieldError>
                  {typeof errors.speakers.message === "string"
                    ? errors.speakers.message
                    : "Invalid speakers"}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.assets)}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-assets`}
                hint={`Optional · one http(s) URL per line · max ${EVENT_ASSET_URL_MAX}`}
              >
                Assets
              </AdminFormFieldLabel>
              <Textarea
                id={`${formId}-assets`}
                rows={3}
                disabled={isPending}
                placeholder="https://example.com/deck.pdf"
                aria-invalid={Boolean(errors.assets)}
                {...form.register("assets")}
              />
              {errors.assets ? (
                <FieldError>
                  {typeof errors.assets.message === "string"
                    ? errors.assets.message
                    : "Invalid assets"}
                </FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.outcomes)}>
              <AdminFormFieldLabel
                htmlFor={`${formId}-outcomes`}
                hint={`Optional · max ${EVENT_OUTCOMES_MAX} chars`}
              >
                Outcomes
              </AdminFormFieldLabel>
              <Textarea
                id={`${formId}-outcomes`}
                rows={4}
                disabled={isPending}
                maxLength={EVENT_OUTCOMES_MAX}
                placeholder="What happened after the event."
                aria-invalid={Boolean(errors.outcomes)}
                {...form.register("outcomes")}
              />
              {errors.outcomes ? (
                <FieldError>{errors.outcomes.message}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={Boolean(errors.startupIds)}>
              <AdminFormFieldLabel htmlFor={`${formId}-startups`} hint="Optional">
                Linked startups
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-startup-search`}
                value={optionSearch}
                onChange={(event) => setOptionSearch(event.target.value)}
                disabled={isPending}
                maxLength={100}
                placeholder="Search startups…"
                className="mb-2 min-h-11 sm:min-h-8"
                aria-label="Search startups"
              />
              <div
                id={`${formId}-startups`}
                className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3"
              >
                {optionsLoading ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin" />
                    Loading startups…
                  </p>
                ) : startupOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {optionSearch.trim()
                      ? "No startups match that search."
                      : "No startups in the portfolio yet."}
                  </p>
                ) : (
                  startupOptions.map((startup) => {
                    const checked = selectedIds.includes(startup.id);
                    return (
                      <label
                        key={startup.id}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1 sm:min-h-8"
                      >
                        <Checkbox
                          checked={checked}
                          disabled={isPending}
                          onCheckedChange={(next) => {
                            const isOn = next === true;
                            const current = form.getValues("startupIds");
                            form.setValue(
                              "startupIds",
                              isOn
                                ? [...current, startup.id]
                                : current.filter((id) => id !== startup.id),
                              { shouldDirty: true, shouldValidate: true },
                            );
                          }}
                        />
                        <span className="min-w-0 truncate text-sm">
                          {startup.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {errors.startupIds ? (
                <FieldError>
                  {typeof errors.startupIds.message === "string"
                    ? errors.startupIds.message
                    : "Invalid startup selection"}
                </FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isPending || optionsLoading}
          >
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : mode === "create" ? (
              <PlusIcon />
            ) : (
              <PencilIcon />
            )}
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Create event"
                : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
