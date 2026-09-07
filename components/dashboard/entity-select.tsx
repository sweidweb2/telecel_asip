"use client";

import { useMemo, useState } from "react";

import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type EntitySelectOption = {
  id: string;
  label: string;
};

type EntitySelectProps = {
  id: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  options: EntitySelectOption[];
  placeholder: string;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  clearable?: boolean;
  clearLabel?: string;
  "aria-invalid"?: boolean;
  /** When set with onSearchChange, shows a search field inside the dropdown. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

/**
 * Entity picker that keeps the Select controlled and always shows the option
 * label in the trigger — never the raw id.
 */
export function EntitySelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  onOpenChange,
  clearable = false,
  clearLabel = "Clear",
  "aria-invalid": ariaInvalid,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  emptyMessage = "No matches",
}: EntitySelectProps) {
  const [labelById, setLabelById] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((option) => [option.id, option.label])),
  );

  // Content key avoids loops when parents pass a new options array each render.
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
    const mapped = options.map((option) => ({
      value: option.id,
      label: option.label,
    }));
    if (value && !options.some((option) => option.id === value)) {
      const cached = labelById[value];
      if (cached) {
        return [{ value, label: cached }, ...mapped];
      }
    }
    return mapped;
  }, [options, value, labelById]);

  const showClear = Boolean(clearable && value && !disabled);
  const isSearchable = typeof onSearchChange === "function";

  function labelFor(selected: string | null): string {
    if (!selected) return placeholder;
    return (
      options.find((option) => option.id === selected)?.label ??
      labelById[selected] ??
      placeholder
    );
  }

  return (
    <div className="relative min-w-0">
      <Select
        value={value}
        items={items}
        onValueChange={(next) =>
          onValueChange(typeof next === "string" && next.length > 0 ? next : null)
        }
        onOpenChange={onOpenChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={cn("min-h-11 w-full", showClear && "pr-14")}
          aria-invalid={ariaInvalid}
        >
          <SelectValue placeholder={placeholder}>
            {(selected: string | null) => labelFor(selected)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          header={
            isSearchable ? (
              <div className="sticky top-0 z-10 border-b bg-popover p-1.5">
                <Input
                  value={searchValue ?? ""}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  placeholder={searchPlaceholder}
                  maxLength={100}
                  aria-label={searchPlaceholder}
                  className="h-9 bg-background"
                  // Keep focus / typing from closing or hijacking list keyboard nav
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                />
              </div>
            ) : undefined
          }
        >
          {options.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {showClear ? (
        <AdminClearIconButton
          label={clearLabel}
          className="top-1/2 right-8 -translate-y-1/2 border-0 bg-transparent shadow-none hover:bg-muted"
          onClick={() => onValueChange(null)}
        />
      ) : null}
    </div>
  );
}
