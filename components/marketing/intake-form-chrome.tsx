"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export type IntakeChromeLabels = {
  consentLabel: string;
  commsLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successDescription: string;
  successCloseLabel: string;
};

/** Label with optional/required (or other) rules beside it — never under the input. */
export function IntakeFieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint ? (
        <span className="text-xs leading-4 text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

export function IntakeConsentFields<T extends FieldValues>({
  labels,
  control,
  consentError,
  isPending,
}: {
  labels: Pick<IntakeChromeLabels, "consentLabel" | "commsLabel">;
  control: Control<T>;
  consentError?: string;
  isPending: boolean;
}) {
  return (
    <div className="grid gap-3">
      <Controller
        control={control}
        name={"consent" as Path<T>}
        render={({ field }) => (
          <label
            className="flex cursor-pointer items-start gap-3 text-sm leading-6 [overflow-anchor:none]"
            onMouseDown={(event) => {
              // Stop focus scroll-into-view under the sticky navbar.
              event.preventDefault();
            }}
          >
            <Checkbox
              checked={field.value === true}
              disabled={isPending}
              onCheckedChange={(next) => field.onChange(next === true)}
              className="mt-0.5"
            />
            <span>{labels.consentLabel}</span>
          </label>
        )}
      />
      {consentError ? (
        <p className="text-sm text-destructive">{consentError}</p>
      ) : null}
      <Controller
        control={control}
        name={"commsOptIn" as Path<T>}
        render={({ field }) => (
          <label
            className="flex cursor-pointer items-start gap-3 text-sm leading-6 [overflow-anchor:none]"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          >
            <Checkbox
              checked={field.value === true}
              disabled={isPending}
              onCheckedChange={(next) => field.onChange(next === true)}
              className="mt-0.5"
            />
            <span>{labels.commsLabel}</span>
          </label>
        )}
      />
    </div>
  );
}

export function IntakeSubmitButton({
  labels,
  isPending,
  disabled = false,
}: {
  labels: Pick<IntakeChromeLabels, "submitLabel" | "submittingLabel">;
  isPending: boolean;
  /** Extra gate (e.g. missing Turnstile token). */
  disabled?: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={isPending || disabled}
      className="min-h-11 w-full sm:w-auto"
    >
      {isPending ? (
        <>
          <Loader2Icon className="animate-spin" />
          {labels.submittingLabel}
        </>
      ) : (
        labels.submitLabel
      )}
    </Button>
  );
}

export function IntakeSuccessDialog({
  open,
  onOpenChange,
  labels,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Pick<
    IntakeChromeLabels,
    "successTitle" | "successDescription" | "successCloseLabel"
  >;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg">
            <span aria-hidden>🎊</span> {labels.successTitle}
          </DialogTitle>
          <DialogDescription>{labels.successDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose
            render={
              <Button variant="default" className="min-h-11 w-full sm:w-auto" />
            }
          >
            {labels.successCloseLabel}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
