"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createEvent,
  deleteEvent,
  loadEventStartupOptions,
  updateEvent,
} from "@/actions/events";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { eventDetailPath, ROUTES } from "@/constants/routes";
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

type EventEditorFormProps = {
  mode: "create" | "edit";
  event?: EventDetail;
  /** Optional seed; form loads / searches the rest. */
  startupOptions?: EventStartupOption[];
  heading: string;
  description: string;
};

export function EventEditorForm({
  mode,
  event,
  startupOptions: initialOptions = [],
  heading,
  description,
}: EventEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [startupOptions, setStartupOptions] =
    useState<EventStartupOption[]>(initialOptions);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(true);

  const form = useForm<EventFormValues, unknown, CreateEventInput>({
    resolver: zodResolver(
      createEventSchema,
    ) as Resolver<EventFormValues, unknown, CreateEventInput>,
    mode: "onBlur",
    defaultValues: defaultsFor(event),
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const result = await loadEventStartupOptions(
          debouncedSearch,
          event?.startup_ids ?? [],
        );
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
  }, [debouncedSearch, event?.startup_ids]);

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

        toast.success(result.message);
        if (mode === "create" && result.id) {
          router.push(eventDetailPath(result.id));
          router.refresh();
          return;
        }
        router.refresh();
      } catch {
        toast.error("The event could not be saved. Please try again.");
      }
    });
  }

  function onDelete() {
    if (!event) return;
    startTransition(async () => {
      const result = await deleteEvent({ id: event.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteOpen(false);
      router.push(ROUTES.events);
    });
  }

  const errors = form.formState.errors;
  const selectedIds =
    useWatch({ control: form.control, name: "startupIds" }) ?? [];

  return (
    <>
      <form
        className="grid max-w-3xl gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <FieldGroup>
          <Field data-invalid={Boolean(errors.name)}>
            <AdminFormFieldLabel
              htmlFor="event-name"
              hint={`Required · 2–${EVENT_NAME_MAX} chars`}
            >
              Name
            </AdminFormFieldLabel>
            <Input
              id="event-name"
              className="min-h-11"
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
              <AdminFormFieldLabel htmlFor="event-date" hint="Required">
                Event date
              </AdminFormFieldLabel>
              <Input
                id="event-date"
                type="date"
                className="min-h-11"
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
              <AdminFormFieldLabel htmlFor="event-status" hint="Required">
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
                      id="event-status"
                      className="min-h-11 w-full"
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
                htmlFor="event-location"
                hint={`Optional · max ${EVENT_LOCATION_MAX}`}
              >
                Location
              </AdminFormFieldLabel>
              <Input
                id="event-location"
                className="min-h-11"
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
              <AdminFormFieldLabel htmlFor="event-format" hint="Optional">
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
                      id="event-format"
                      className="min-h-11 w-full"
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
              htmlFor="event-speakers"
              hint={`Optional · one per line · max ${EVENT_SPEAKER_MAX} chars each`}
            >
              Speakers
            </AdminFormFieldLabel>
            <Textarea
              id="event-speakers"
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
              htmlFor="event-assets"
              hint={`Optional · one http(s) URL per line · max ${EVENT_ASSET_URL_MAX}`}
            >
              Assets
            </AdminFormFieldLabel>
            <Textarea
              id="event-assets"
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
              htmlFor="event-outcomes"
              hint={`Optional · max ${EVENT_OUTCOMES_MAX} chars`}
            >
              Outcomes
            </AdminFormFieldLabel>
            <Textarea
              id="event-outcomes"
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
            <AdminFormFieldLabel htmlFor="event-startups" hint="Optional">
              Linked startups
            </AdminFormFieldLabel>
            <Input
              id="event-startup-search"
              value={optionSearch}
              onChange={(changeEvent) => setOptionSearch(changeEvent.target.value)}
              disabled={isPending}
              maxLength={100}
              placeholder="Search startups…"
              className="mb-2 min-h-11"
              aria-label="Search startups"
            />
            <div
              id="event-startups"
              className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3"
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
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-1"
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create event" : "Save changes"}
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
        title="Delete this event?"
        description="This permanently deletes the event and removes its startup links. This cannot be undone."
        confirmLabel="Delete event"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </>
  );
}
