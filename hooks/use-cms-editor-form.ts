"use client";

import { useState, useTransition } from "react";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import type { FieldValues, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

import {
  firstInvalidEditorStep,
  isAdminFormSubmitDisabled,
  type AdminEditorStepFields,
} from "@/lib/admin/form-submit";
import type { AdminActionResult } from "@/types/admin-action";

export type CmsEditorStep = {
  id: string;
  title: string;
  description?: string;
  fields: readonly string[];
};

type CmsEditorMode = "create" | "edit";

/**
 * Shared catalogue editor state: Zod form, pending save, stepper, and
 * create / update / delete with toasts and navigation.
 * Field markup stays in the form. Pass a custom `run` body when a save
 * also uploads media.
 */
export function useCmsEditorForm<
  TFieldValues extends FieldValues,
  TTransformed extends FieldValues = TFieldValues,
>({
  mode,
  schema,
  defaultValues,
  recordId,
  listPath,
  detailPath,
  create,
  update,
  remove,
  saveError,
  deleteError = saveError,
  steps,
}: {
  mode: CmsEditorMode;
  schema: Parameters<typeof zodResolver>[0];
  defaultValues: UseFormProps<TFieldValues>["defaultValues"];
  recordId?: string;
  listPath: string;
  detailPath: (id: string) => string;
  create: (values: TTransformed) => Promise<AdminActionResult>;
  update: (values: TTransformed & { id: string }) => Promise<AdminActionResult>;
  remove?: (input: { id: string }) => Promise<AdminActionResult>;
  saveError: string;
  deleteError?: string;
  steps?: readonly CmsEditorStep[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [step, setStep] = useState(steps?.[0]?.id ?? "");

  const form = useForm<TFieldValues, unknown, TTransformed>({
    resolver: zodResolver(schema) as Resolver<
      TFieldValues,
      unknown,
      TTransformed
    >,
    mode: "onChange",
    shouldUnregister: false,
    defaultValues,
  });

  const { isDirty, errors } = form.formState;

  function run(task: () => Promise<void>, fallback = saveError) {
    startTransition(async () => {
      try {
        await task();
      } catch {
        toast.error(fallback);
      }
    });
  }

  function onSubmit(values: TTransformed) {
    run(async () => {
      const result =
        mode === "create"
          ? await create(values)
          : recordId
            ? await update({ ...values, id: recordId })
            : { status: "error" as const, message: saveError };

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (mode === "create" && result.id) {
        router.push(detailPath(result.id));
        router.refresh();
        return;
      }

      form.reset(form.getValues());
      router.refresh();
    });
  }

  function onInvalid(invalid: FieldErrors<TFieldValues>) {
    if (!steps?.length) return;
    const next = firstInvalidEditorStep(
      invalid,
      steps as unknown as AdminEditorStepFields,
    );
    if (next) setStep(next);
  }

  function onDelete() {
    if (!recordId || !remove) return;
    run(async () => {
      const result = await remove({ id: recordId });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteOpen(false);
      router.push(listPath);
      router.refresh();
    }, deleteError);
  }

  function submitDisabled(hasExternalChanges = false) {
    return isAdminFormSubmitDisabled({
      isPending,
      isDirty,
      errors,
      hasExternalChanges,
    });
  }

  const handleFormSubmit = form.handleSubmit(onSubmit, onInvalid);

  return {
    form,
    isPending,
    isDirty,
    errors,
    step,
    setStep,
    deleteOpen,
    setDeleteOpen,
    run,
    onSubmit,
    onInvalid,
    onDelete,
    submitDisabled,
    handleFormSubmit,
  };
}
