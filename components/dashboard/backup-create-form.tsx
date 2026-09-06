"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";

import {
  createBackup,
  getBackupStatus,
  runBackupNow,
} from "@/actions/backups";
import {
  BackupProgressDialog,
  type BackupProgressPhase,
} from "@/components/dashboard/backup-progress-dialog";
import { Button } from "@/components/ui/button";
import { BACKUP_TABLE_ALLOWLIST } from "@/constants/backup-tables";
import { cn } from "@/lib/utils";
import type { CreateBackupInput } from "@/validations/backup";

type ScopeMode = CreateBackupInput["scope"];

const SCOPE_OPTIONS: { value: ScopeMode; label: string; description: string }[] =
  [
    {
      value: "full",
      label: "Full DB backup",
      description:
        "All allowlisted application tables as JSON. Runs in the background.",
    },
    {
      value: "storage",
      label: "Storage backup",
      description:
        "ZIP of Supabase media buckets. Large libraries take longer in the background.",
    },
  ];

const POLL_MS = 2000;

export function BackupCreateForm() {
  const router = useRouter();
  const [scope, setScope] = useState<ScopeMode>("full");
  const [pending, startTransition] = useTransition();
  const [runNowPending, startRunNowTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [phase, setPhase] = useState<BackupProgressPhase>("running");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeBackupId, setActiveBackupId] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const summary = useMemo(() => {
    if (scope === "storage") {
      return "Storage backup · ZIP of blogs, auther, startups, partners buckets";
    }
    return `Full DB · ${BACKUP_TABLE_ALLOWLIST.length} tables · JSON`;
  }, [scope]);

  function clearPoll() {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }

  useEffect(() => {
    return () => clearPoll();
  }, []);

  function startPolling(backupId: string) {
    clearPoll();
    setActiveBackupId(backupId);
    setPhase("running");
    setErrorMessage(null);
    setDialogOpen(true);

    pollTimer.current = setInterval(() => {
      void (async () => {
        const result = await getBackupStatus(backupId);
        if (result.status === "error") {
          clearPoll();
          setPhase("error");
          setErrorMessage(result.message);
          toast.error(result.message);
          return;
        }

        if (
          result.backupStatus === "pending" ||
          result.backupStatus === "processing"
        ) {
          return;
        }

        clearPoll();
        router.refresh();

        if (result.backupStatus === "completed") {
          setPhase("success");
          toast.success("Backup ready to download.");
          return;
        }

        setPhase("error");
        setErrorMessage(
          result.errorMessage ?? "Backup failed. Check Backup history.",
        );
        toast.error(result.errorMessage ?? "Backup failed.");
      })();
    }, POLL_MS);
  }

  function onSubmit() {
    setDialogOpen(true);
    setPhase("running");
    setErrorMessage(null);
    setActiveBackupId(null);

    startTransition(async () => {
      const input: CreateBackupInput =
        scope === "storage"
          ? { scope: "storage", format: "zip" }
          : { scope: "full", format: "json" };

      const result = await createBackup(input);

      if (result.status === "error") {
        setPhase("error");
        setErrorMessage(result.message);
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();

      if (result.id) {
        startPolling(result.id);
      } else {
        setPhase("success");
      }
    });
  }

  function onRunNow() {
    startRunNowTransition(async () => {
      const result = await runBackupNow();
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();

      if (result.id) {
        startPolling(result.id);
      }
    });
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Create backup
        </h2>
        <p className="text-sm text-muted-foreground">
          Export on demand to private R2. Jobs run in the background — watch
          Backup history for status and download. Scheduled runs are configured
          in Settings.
        </p>
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-medium">Scope</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SCOPE_OPTIONS.map((option) => {
            const selected = scope === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "min-h-11 rounded-lg border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40",
                )}
                onClick={() => setScope(option.value)}
                aria-pressed={selected}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <p className="font-medium">Selected scope</p>
        <p className="mt-1 text-muted-foreground">{summary}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          className="min-h-11 w-full sm:w-auto"
          disabled={pending || runNowPending || Boolean(activeBackupId && phase === "running")}
          onClick={onSubmit}
        >
          {pending ? "Starting…" : "Create backup"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          disabled={pending || runNowPending || Boolean(activeBackupId && phase === "running")}
          onClick={onRunNow}
        >
          {runNowPending ? (
            <Loader2Icon className="animate-spin" />
          ) : null}
          {runNowPending ? "Starting…" : "Run backup now"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Run backup now starts one automated full JSON backup without changing
        the schedule in Settings. You do not need to keep this tab locked — the
        job continues in the background.
      </p>

      <BackupProgressDialog
        open={dialogOpen}
        phase={phase}
        summary={summary}
        errorMessage={errorMessage}
        onOpenChange={(open) => {
          if (!open && phase === "running") return;
          if (!open) {
            clearPoll();
            setActiveBackupId(null);
          }
          setDialogOpen(open);
        }}
      />
    </section>
  );
}
