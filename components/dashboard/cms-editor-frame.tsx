"use client";

import type { FormEvent, ReactNode } from "react";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { UnsavedChangesGuard } from "@/components/dashboard/unsaved-changes-guard";
import type { CmsEditorStep } from "@/hooks/use-cms-editor-form";
import { cn } from "@/lib/utils";

type CmsEditorFrameProps = {
  isPending: boolean;
  isDirty: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  actions: ReactNode;
  steps?: readonly CmsEditorStep[];
  step?: string;
  onStepChange?: (stepId: string) => void;
  isStepDisabled?: (index: number) => boolean;
  onDummy?: () => void;
  onClear?: () => void;
  /** Replaces the default heading + dev-tools row. */
  toolbar?: ReactNode;
  heading?: string;
  formId?: string;
  formClassName?: string;
  stepperClassName?: string;
  navClassName?: string;
  panelClassName?: string;
  deleteDialog?: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
  };
};

/**
 * Catalogue editor chrome: unsaved-changes guard, dev tools, stepper nav,
 * action bar, and delete dialog. Step fields are `children`.
 */
export function CmsEditorFrame({
  isPending,
  isDirty,
  onSubmit,
  children,
  actions,
  steps,
  step,
  onStepChange,
  isStepDisabled,
  onDummy,
  onClear,
  toolbar,
  heading,
  formId,
  formClassName,
  stepperClassName = "flex w-full flex-col items-center gap-6",
  navClassName = "mx-auto w-full max-w-md",
  panelClassName = "w-full",
  deleteDialog,
}: CmsEditorFrameProps) {
  const showDevTools = Boolean(onDummy && onClear);

  return (
    <div className="grid w-full gap-6">
      <UnsavedChangesGuard enabled={isDirty && !isPending} />
      {toolbar ??
        (heading || showDevTools ? (
          <div
            className={cn(
              "flex w-full min-w-0 flex-wrap items-center gap-3",
              heading ? "justify-between" : "justify-end",
            )}
          >
            {heading ? (
              <h2 className="font-heading text-2xl tracking-tight">{heading}</h2>
            ) : null}
            {showDevTools ? (
              <AdminFormDevTools
                disabled={isPending}
                onDummy={onDummy!}
                onClear={onClear!}
              />
            ) : null}
          </div>
        ) : null)}

      <form
        id={formId}
        noValidate
        className={cn(
          "grid w-full gap-6",
          ADMIN_EDITOR_ACTIONS_SAFE_AREA,
          formClassName ?? "mx-auto max-w-3xl",
        )}
        onSubmit={onSubmit}
      >
        {steps && steps.length > 0 && step ? (
          <Stepper
            steps={steps.map(({ id, title, description }) => ({
              id,
              title,
              description,
            }))}
            value={step}
            onValueChange={onStepChange}
            orientation="horizontal"
            className={stepperClassName}
          >
            <StepperNav className={navClassName}>
              {steps.map((item, index) => (
                <StepperItem
                  key={item.id}
                  stepId={item.id}
                  disabled={isStepDisabled?.(index)}
                  className="relative flex-1"
                >
                  <StepperTrigger className="flex w-full flex-col items-center gap-2.5">
                    <StepperIndicator>{index + 1}</StepperIndicator>
                    <div className="min-w-0 text-center">
                      <StepperTitle>{item.title}</StepperTitle>
                      {item.description ? (
                        <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </StepperTrigger>
                  {index < steps.length - 1 ? (
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
            <StepperPanel className={panelClassName}>{children}</StepperPanel>
          </Stepper>
        ) : (
          children
        )}

        <AdminEditorActionsBar>{actions}</AdminEditorActionsBar>
      </form>

      {deleteDialog ? (
        <AdminDeleteDialog
          open={deleteDialog.open}
          onOpenChange={deleteDialog.onOpenChange}
          showTrigger={false}
          title={deleteDialog.title}
          description={deleteDialog.description}
          confirmLabel={deleteDialog.confirmLabel}
          isPending={isPending}
          onConfirm={deleteDialog.onConfirm}
        />
      ) : null}
    </div>
  );
}

export function CmsEditorSaveActions({
  mode,
  isPending,
  disabled,
  createLabel,
  saveLabel = "Save changes",
  deleteLabel = "Delete",
  pendingLabel,
  onDelete,
  leading,
  trailing,
}: {
  mode: "create" | "edit";
  isPending: boolean;
  disabled: boolean;
  createLabel: string;
  saveLabel?: string;
  deleteLabel?: string;
  pendingLabel?: string;
  onDelete?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  const label =
    isPending && pendingLabel
      ? pendingLabel
      : mode === "create"
        ? createLabel
        : saveLabel;

  const submit = (
    <Button
      type="submit"
      className={cn("min-h-11 w-full sm:w-auto", !trailing && "sm:ml-auto")}
      disabled={disabled}
    >
      {isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
      {label}
    </Button>
  );

  return (
    <>
      {mode === "edit" && onDelete ? (
        <Button
          type="button"
          variant="destructive"
          className="min-h-11 w-full sm:w-auto"
          disabled={isPending}
          onClick={onDelete}
        >
          <Trash2Icon className="size-4" />
          {deleteLabel}
        </Button>
      ) : (
        (leading ?? <span className="hidden sm:block" />)
      )}
      {trailing ? (
        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:justify-end">
          {trailing}
          {submit}
        </div>
      ) : (
        submit
      )}
    </>
  );
}
