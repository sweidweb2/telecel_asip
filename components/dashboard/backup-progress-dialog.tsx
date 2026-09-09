"use client";

import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type BackupProgressPhase = "running" | "success" | "error";

type BackupProgressDialogProps = {
  open: boolean;
  phase: BackupProgressPhase;
  summary: string;
  errorMessage?: string | null;
  onOpenChange: (open: boolean) => void;
};

export function BackupProgressDialog({
  open,
  phase,
  summary,
  errorMessage,
  onOpenChange,
}: BackupProgressDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
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
              ? "Backup ready"
              : phase === "error"
                ? "Backup failed"
                : "Backup in progress"}
          </DialogTitle>
          <DialogDescription>{summary}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2 text-center">
          {phase === "running" ? (
            <LoaderCircleIcon className="size-10 animate-spin text-primary" />
          ) : phase === "success" ? (
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckIcon className="size-5" />
            </span>
          ) : (
            <span className="flex size-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <XIcon className="size-5" />
            </span>
          )}
          <p className="text-sm text-muted-foreground">
            {phase === "running"
              ? "Working in the background. You can leave this dialog open - history updates when it finishes."
              : phase === "success"
                ? "The archive is in Backup history and ready to download."
                : "Check Backup history for details, then try again."}
          </p>
        </div>

        {phase === "error" && errorMessage ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
