"use client";

import { useState, useTransition } from "react";
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
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type CohortEditorFormProps = {
  mode: "create" | "edit";
  cohort?: CohortAdminDetail;
  partners: CohortLinkOption[];
  startups: CohortLinkOption[];
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

function LinkCheckboxList({
  title,
  options,
  selected,
  onChange,
  disabled,
}: {
  title: string;
  options: CohortLinkOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  function toggle(id: string, checked: boolean) {
    if (checked) {
      onChange(selected.includes(id) ? selected : [...selected, id]);
      return;
    }
    onChange(selected.filter((value) => value !== id));
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <Label>{title}</Label>
        <span className="text-xs text-muted-foreground">
          {selected.length} selected
        </span>
      </div>
      {options.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No options available yet.
        </p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
          {options.map((option) => {
            const isChecked = selected.includes(option.id);
            return (
              <li key={option.id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                  <Checkbox
                    checked={isChecked}
                    disabled={disabled}
                    onCheckedChange={(value) =>
                      toggle(option.id, value === true)
                    }
                  />
                  <span className="min-w-0 truncate text-sm">{option.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function CohortEditorForm({
  mode,
  cohort,
  partners,
  startups,
  heading,
  description,
}: CohortEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<CreateCohortInput>({
    resolver: zodResolver(createCohortSchema),
    defaultValues: {
      year: cohort?.year ?? new Date().getFullYear(),
      publicLabel: cohort?.public_label ?? "",
      programmeDatesStart: cohort?.programme_dates_start ?? "",
      programmeDatesEnd: cohort?.programme_dates_end ?? "",
      programmeStatus: cohort?.programme_status ?? "closed",
      summary: cohort?.summary ?? "",
      mediaUrl: cohort?.media_url ?? "",
      publishStatus: cohort?.publish_status ?? "draft",
      partnerIds: cohort?.partnerIds ?? [],
      startupIds: cohort?.startupIds ?? [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
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
    <>
      <form
        className="grid max-w-3xl gap-8"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel htmlFor="year">Year</FieldLabel>
            <Input
              id="year"
              type="number"
              className="min-h-11"
              disabled={isPending}
              {...register("year", { valueAsNumber: true })}
            />
            {errors.year ? (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <FieldLabel
              htmlFor="publicLabel"
              hint={`${COHORT_PUBLIC_LABEL_MAX} max`}
            >
              Public label
            </FieldLabel>
            <Input
              id="publicLabel"
              className="min-h-11"
              disabled={isPending}
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
              className="min-h-11"
              disabled={isPending}
              {...register("programmeDatesStart")}
            />
            {errors.programmeDatesStart ? (
              <p className="text-sm text-destructive">
                {errors.programmeDatesStart.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="programmeDatesEnd">Programme end</FieldLabel>
            <Input
              id="programmeDatesEnd"
              type="date"
              className="min-h-11"
              disabled={isPending}
              {...register("programmeDatesEnd")}
            />
            {errors.programmeDatesEnd ? (
              <p className="text-sm text-destructive">
                {errors.programmeDatesEnd.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel>Programme status</FieldLabel>
            <Controller
              control={control}
              name="programmeStatus"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value);
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="min-h-11 w-full">
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
            <FieldLabel>Publish status</FieldLabel>
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
                  <SelectTrigger className="min-h-11 w-full">
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
            <FieldLabel htmlFor="summary" hint={`${COHORT_SUMMARY_MAX} max`}>
              Summary
            </FieldLabel>
            <Textarea
              id="summary"
              rows={5}
              disabled={isPending}
              {...register("summary")}
            />
            {errors.summary ? (
              <p className="text-sm text-destructive">
                {errors.summary.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <FieldLabel htmlFor="mediaUrl">Media URL</FieldLabel>
            <Input
              id="mediaUrl"
              type="url"
              placeholder="https://"
              className="min-h-11"
              disabled={isPending}
              {...register("mediaUrl")}
            />
            {errors.mediaUrl ? (
              <p className="text-sm text-destructive">
                {errors.mediaUrl.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <Controller
            control={control}
            name="partnerIds"
            render={({ field }) => (
              <LinkCheckboxList
                title="Partners"
                options={partners}
                selected={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          <Controller
            control={control}
            name="startupIds"
            render={({ field }) => (
              <LinkCheckboxList
                title="Founders / startups"
                options={startups}
                selected={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
        </div>
        {errors.partnerIds ? (
          <p className="text-sm text-destructive">
            {errors.partnerIds.message}
          </p>
        ) : null}
        {errors.startupIds ? (
          <p className="text-sm text-destructive">
            {errors.startupIds.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create cohort" : "Save changes"}
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
        title="Delete this cohort?"
        description="This removes the cohort and its partner/startup links. This cannot be undone."
        confirmLabel="Delete cohort"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </>
  );
}
