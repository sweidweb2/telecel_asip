"use client";

import { useMemo, useState } from "react";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";

import type { EntitySelectOption } from "@/components/dashboard/entity-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type EntityMultiSelectProps = {
  id: string;
  value: string[];
  onValueChange: (value: string[]) => void;
  options: EntitySelectOption[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  onOpenChange?: (open: boolean) => void;
  "aria-invalid"?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

/**
 * Multi-select entity picker: one dropdown trigger with search inside the panel
 * (not a separate search field above the list).
 */
export function EntityMultiSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
  onOpenChange,
  "aria-invalid": ariaInvalid,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  emptyMessage = "No matches",
}: EntityMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [labelById, setLabelById] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((option) => [option.id, option.label])),
  );

  const optionsKey = options
    .map((option) => `${option.id}\0${option.label}`)
    .join("\n");
  const [prevOptionsKey, setPrevOptionsKey] = useState(optionsKey);

  if (optionsKey !== prevOptionsKey) {
    setPrevOptionsKey(optionsKey);
    if (options.length > 0) {
      setLabelById((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const option of options) {
          if (next[option.id] !== option.label) {
            next[option.id] = option.label;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }

  const items = useMemo(() => {
    const mapped = [...options];
    const seen = new Set(mapped.map((option) => option.id));
    for (const idValue of value) {
      if (seen.has(idValue)) continue;
      const cached = labelById[idValue];
      if (cached) {
        mapped.unshift({ id: idValue, label: cached });
        seen.add(idValue);
      }
    }
    return mapped;
  }, [options, value, labelById]);

  const selectedCount = value.length;
  const triggerLabel =
    selectedCount === 0
      ? placeholder
      : selectedCount === 1
        ? (labelById[value[0]] ?? options.find((o) => o.id === value[0])?.label ?? "1 selected")
        : `${selectedCount} selected`;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  function toggle(idValue: string, checked: boolean) {
    if (checked) {
      onValueChange(value.includes(idValue) ? value : [...value, idValue]);
      return;
    }
    onValueChange(value.filter((item) => item !== idValue));
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-auto min-h-11 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
          selectedCount === 0 && "text-muted-foreground",
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-(--anchor-width) min-w-56 max-w-[min(100vw-2rem,28rem)] gap-0 p-0"
      >
        <div className="border-b p-1.5">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            maxLength={100}
            aria-label={searchPlaceholder}
            className="h-9 bg-background"
            onKeyDown={(event) => event.stopPropagation()}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {loading ? (
            <p className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading…
            </p>
          ) : items.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            <ul className="grid gap-0.5">
              {items.map((option) => {
                const isChecked = value.includes(option.id);
                return (
                  <li key={option.id}>
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/70 sm:min-h-9">
                      <Checkbox
                        checked={isChecked}
                        disabled={disabled}
                        onCheckedChange={(next) =>
                          toggle(option.id, next === true)
                        }
                      />
                      <span className="min-w-0 truncate text-sm">
                        {option.label}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
