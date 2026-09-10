"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/actions/events";
import { loadEventStartupOptions } from "@/actions/admin-pickers";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { EntityMultiSelect } from "@/components/dashboard/entity-multi-select";
import { EventLocationInput } from "@/components/events/event-location-input";
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
import { EVENT_EDITOR_HELP } from "@/constants/event-editor-help";
import { eventDetailPath, ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import {
  firstInvalidEditorStep,
  isAdminFormSubmitDisabled,
} from "@/lib/admin/form-submit";
import { dummyEventValues, todayIsoDate } from "@/lib/admin/dummy-form-values";
import { cn } from "@/lib/utils";
import type { EventDetail, EventStartupOption } from "@/types/event";
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  createEventSchema,
  EVENT_ASSET_URL_MAX,
  EVENT_ASSETS_MAX,
  EVENT_FORMAT_LABELS,
  EVENT_FORMATS,
  EVENT_LOCATION_MAX,
  EVENT_NAME_MAX,
  EVENT_OUTCOMES_MAX,
  EVENT_SPEAKER_MAX,
  EVENT_SPEAKERS_MAX,
  type CreateEventInput,
  type EventFormValues,
} from "@/validations/event";

const EVENT_EDITOR_STEPS = [
  {
    id: "event",
    title: "Event",
    description: "Basics & details",
    fields: ["name", "eventDate", "location", "format", "publishStatus"],
  },
  {
    id: "content",
    title: "Content",
    description: "Speakers & links",
    fields: ["speakers", "assets", "outcomes", "startupIds"],
  },
];

function defaultsFor(event?: EventDetail): EventFormValues {
  return {
    name: event?.name ?? "",
    eventDate: event?.event_date ?? todayIsoDate(),
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
};

export function EventEditorForm({
  mode,
  event,
  startupOptions: initialOptions = [],
}: EventEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [step, setStep] = useState(EVENT_EDITOR_STEPS[0].id);
  const [startupOptions, setStartupOptions] =
    useState<EventStartupOption[]>(initialOptions);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(optionsEnabled);

  const form = useForm<EventFormValues, unknown, CreateEventInput>({
    resolver: zodResolver(
      createEventSchema,
    ) as Resolver<EventFormValues, unknown, CreateEventInput>,
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: defaultsFor(event),
  });

  useEffect(() => {
    if (!optionsEnabled) return;

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
  }, [optionsEnabled, debouncedSearch, event?.startup_ids]);

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
        form.reset(form.getValues());
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

  const { errors, isDirty } = form.formState;
  useUnsavedChangesGuard(isDirty && !isPending);

  return (
    <div className="grid w-full gap-6">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-3">
        <AdminFormDevTools
          disabled={isPending}
          onDummy={() => {
            form.reset(
              { ...form.getValues(), ...dummyEventValues(form.getValues()) },
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
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          const next = firstInvalidEditorStep(errors, EVENT_EDITOR_STEPS);
          if (next) setStep(next);
        })}
        noValidate
      >
        <Stepper
          steps={EVENT_EDITOR_STEPS}
          value={step}
          onValueChange={setStep}
          orientation="horizontal"
          className="flex w-full flex-col items-center gap-6"
        >
          <StepperNav className="mx-auto w-full max-w-md">
            {EVENT_EDITOR_STEPS.map((s, index) => (
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
                {index < EVENT_EDITOR_STEPS.length - 1 ? (
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
              value="event"
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={EVENT_EDITOR_HELP.basics.title}
                description={EVENT_EDITOR_HELP.basics.intro}
                help={EVENT_EDITOR_HELP.basics}
                contentClassName="grid gap-4"
              >
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
              </AdminFormSection>

              <AdminFormSection
                title={EVENT_EDITOR_HELP.details.title}
                description={EVENT_EDITOR_HELP.details.intro}
                help={EVENT_EDITOR_HELP.details}
                contentClassName="grid gap-4"
              >
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
                    <Controller
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <EventLocationInput
                          id="event-location"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isPending}
                          maxLength={EVENT_LOCATION_MAX}
                          placeholder="City or venue"
                          className="min-h-11"
                          aria-invalid={Boolean(errors.location)}
                        />
                      )}
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
                          items={[
                            { value: "none", label: "No format" },
                            ...EVENT_FORMATS.map((format) => ({
                              value: format,
                              label: EVENT_FORMAT_LABELS[format],
                            })),
                          ]}
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
              </AdminFormSection>
            </StepperContent>

            <StepperContent
              value="content"
              className="mx-auto w-full max-w-3xl space-y-6"
            >
              <AdminFormSection
                title={EVENT_EDITOR_HELP.content.title}
                description={EVENT_EDITOR_HELP.content.intro}
                help={EVENT_EDITOR_HELP.content}
                contentClassName="grid gap-4"
              >
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
                    maxLength={
                      EVENT_SPEAKER_MAX * EVENT_SPEAKERS_MAX + EVENT_SPEAKERS_MAX
                    }
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
                    maxLength={
                      EVENT_ASSET_URL_MAX * EVENT_ASSETS_MAX + EVENT_ASSETS_MAX
                    }
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
              </AdminFormSection>

              <AdminFormSection
                title={EVENT_EDITOR_HELP.links.title}
                description={EVENT_EDITOR_HELP.links.intro}
                help={EVENT_EDITOR_HELP.links}
              >
                <Field data-invalid={Boolean(errors.startupIds)}>
                  <AdminFormFieldLabel htmlFor="event-startups" hint="Optional">
                    Linked startups
                  </AdminFormFieldLabel>
                  <Controller
                    control={form.control}
                    name="startupIds"
                    render={({ field }) => (
                      <EntityMultiSelect
                        id="event-startups"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={startupOptions.map((startup) => ({
                          id: startup.id,
                          label: startup.name,
                        }))}
                        placeholder={
                          optionsLoading
                            ? "Loading startups…"
                            : "Select startups"
                        }
                        disabled={isPending}
                        loading={optionsLoading}
                        onOpenChange={(open) => {
                          if (open) setOptionsEnabled(true);
                        }}
                        searchValue={optionSearch}
                        onSearchChange={setOptionSearch}
                        searchPlaceholder="Search startups…"
                        emptyMessage={
                          optionSearch.trim()
                            ? "No startups match that search."
                            : "No startups in the portfolio yet."
                        }
                        aria-invalid={Boolean(errors.startupIds)}
                      />
                    )}
                  />
                  {errors.startupIds ? (
                    <FieldError>
                      {typeof errors.startupIds.message === "string"
                        ? errors.startupIds.message
                        : "Invalid startup selection"}
                    </FieldError>
                  ) : null}
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
            disabled={isAdminFormSubmitDisabled({ isPending, isDirty, errors })}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create event" : "Save changes"}
          </Button>
        </AdminEditorActionsBar>
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
    </div>
  );
}
