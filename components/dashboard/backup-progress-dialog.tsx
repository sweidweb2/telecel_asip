"use client";

import { CheckIcon, CircleIcon, LoaderCircleIcon, XIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const BACKUP_PROGRESS_STEPS = [
  { id: "validate", label: "Validate selection" },
  { id: "record", label: "Create backup record" },
  { id: "export", label: "Export data" },
  { id: "upload", label: "Upload to Cloudflare R2" },
  { id: "finalize", label: "Finalize & save history" },
] as const;

export type BackupProgressStepId = (typeof BACKUP_PROGRESS_STEPS)[number]["id"];

export type BackupProgressPhase = "running" | "success" | "error";

type BackupProgressDialogProps = {
  open: boolean;
  phase: BackupProgressPhase;
  /** Index of the step currently in progress (0-based). */
  activeStepIndex: number;
  summary: string;
  errorMessage?: string | null;
  onOpenChange: (open: boolean) => void;
};

function StepIcon({
  state,
}: {
  state: "done" | "active" | "pending" | "error";
}) {
  if (state === "done") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckIcon className="size-3.5" />
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <XIcon className="size-3.5" />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex size-6 items-center justify-center rounded-full border border-primary text-primary">
        <LoaderCircleIcon className="size-3.5 animate-spin" />
      </span>
    );
  }
  return (
    <span className="flex size-6 items-center justify-center text-muted-foreground">
      <CircleIcon className="size-4" />
    </span>
  );
}

export function BackupProgressDialog({
  open,
  phase,
  activeStepIndex,
  summary,
  errorMessage,
  onOpenChange,
}: BackupProgressDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Block dismiss while running so the checklist stays visible.
        if (phase === "running") return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-w-md gap-5"
        showCloseButton={phase !== "running"}
      >
        <DialogHeader>
          <DialogTitle>
            {phase === "success"
              ? "Backup completed"
              : phase === "error"
                ? "Backup failed"
                : "Creating backup"}
          </DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>

        <ol className="grid gap-3">
          {BACKUP_PROGRESS_STEPS.map((step, index) => {
            let state: "done" | "active" | "pending" | "error" = "pending";
            if (phase === "success") {
              state = "done";
            } else if (phase === "error") {
              if (index < activeStepIndex) state = "done";
              else if (index === activeStepIndex) state = "error";
              else state = "pending";
            } else if (index < activeStepIndex) {
              state = "done";
            } else if (index === activeStepIndex) {
              state = "active";
            }

            return (
              <li
                key={step.id}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  state === "pending" && "text-muted-foreground",
                  state === "active" && "font-medium text-foreground",
                  state === "done" && "text-foreground",
                  state === "error" && "font-medium text-destructive",
                )}
              >
                <StepIcon state={state} />
                <span>{step.label}</span>
              </li>
            );
          })}
        </ol>

        {phase === "error" && errorMessage ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        {phase === "running" ? (
          <p className="text-xs text-muted-foreground">
            Keep this window open. Large exports can take a minute.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
