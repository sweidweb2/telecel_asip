"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";

import { createBackup } from "@/actions/backups";
import {
  BackupProgressDialog,
  type BackupProgressPhase,
} from "@/components/dashboard/backup-progress-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BACKUP_TABLE_ALLOWLIST,
  type BackupTableName,
} from "@/constants/backup-tables";
import { cn } from "@/lib/utils";
import type { CreateBackupInput } from "@/validations/backup";

type ScopeMode = CreateBackupInput["scope"];

const SCOPE_OPTIONS: { value: ScopeMode; label: string; description: string }[] =
  [
    {
      value: "full",
      label: "Full DB backup",
      description: "All allowlisted application tables as JSON.",
    },
    {
      value: "tables",
      label: "Selected tables",
      description: "Choose one or more tables as JSON.",
    },
    {
      value: "storage",
      label: "Storage backup",
      description: "Export Supabase Storage media buckets as a ZIP.",
    },
  ];

export function BackupCreateForm() {
  const router = useRouter();
  const [scope, setScope] = useState<ScopeMode>("full");
  const [selectedTables, setSelectedTables] = useState<BackupTableName[]>([]);
  const [pending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [phase, setPhase] = useState<BackupProgressPhase>("running");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allSelected = selectedTables.length === BACKUP_TABLE_ALLOWLIST.length;

  const summary = useMemo(() => {
    if (scope === "storage") {
      return "Storage backup · ZIP of blogs, auther, startups, partners buckets";
    }
    if (scope === "full") {
      return `Full DB · ${BACKUP_TABLE_ALLOWLIST.length} tables · JSON`;
    }
    const count = selectedTables.length;
    return `Selected tables · ${count} table${count === 1 ? "" : "s"} · JSON`;
  }, [scope, selectedTables.length]);

  function toggleTable(table: BackupTableName, checked: boolean) {
    setSelectedTables((prev) => {
      if (checked) return prev.includes(table) ? prev : [...prev, table];
      return prev.filter((name) => name !== table);
    });
  }

  function toggleAll(checked: boolean) {
    setSelectedTables(checked ? [...BACKUP_TABLE_ALLOWLIST] : []);
  }

  function onSubmit() {
    setDialogOpen(true);
    setPhase("running");
    setErrorMessage(null);

    startTransition(async () => {
      const input: CreateBackupInput =
        scope === "storage"
          ? { scope: "storage", format: "zip" }
          : scope === "tables"
            ? {
                scope: "tables",
                format: "json",
                targetTables: selectedTables,
              }
            : { scope: "full", format: "json" };

      const result = await createBackup(input);

      if (result.status === "error") {
        setPhase("error");
        setErrorMessage(result.message);
        toast.error(result.message);
        return;
      }

      setPhase("success");
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Create backup
        </h2>
        <p className="text-sm text-muted-foreground">
          Export on demand to private R2. Database scopes use JSON; storage uses
          ZIP.
        </p>
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-medium">Scope</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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

      {scope === "tables" ? (
        <div className="grid gap-3 rounded-lg border p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">Tables</p>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
              Select all
            </label>
          </div>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {BACKUP_TABLE_ALLOWLIST.map((table) => {
              const checked = selectedTables.includes(table);
              return (
                <li key={table}>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleTable(table, value === true)
                      }
                    />
                    <span className="font-mono text-xs sm:text-sm">{table}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <p className="font-medium">Selected scope</p>
        <p className="mt-1 text-muted-foreground">{summary}</p>
      </div>

      <div>
        <Button
          type="button"
          className="min-h-11 w-full sm:w-auto"
          disabled={
            pending || (scope === "tables" && selectedTables.length === 0)
          }
          onClick={onSubmit}
        >
          {pending ? "Creating backup…" : "Create backup"}
        </Button>
      </div>

      <BackupProgressDialog
        open={dialogOpen}
        phase={phase}
        summary={summary}
        errorMessage={errorMessage}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
}
