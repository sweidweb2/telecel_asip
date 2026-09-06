"use client";

import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ISO_DATE = "yyyy-MM-dd";

function parseIsoDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, ISO_DATE, new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toIsoDate(date: Date): string {
  return format(date, ISO_DATE);
}

type DatePickerProps = {
  id?: string;
  /** ISO date string `yyyy-MM-dd`, or empty. */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  className?: string;
};

/**
 * Enhanced shadcn date picker for admin forms.
 * Stores ISO `yyyy-MM-dd` strings to match Zod date fields.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "min-h-11 w-full justify-start gap-2 font-normal bg-white dark:bg-card",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 opacity-60" />
        <span className="truncate">
          {selected ? format(selected, "PPP") : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          startMonth={new Date(1980, 0)}
          endMonth={new Date(new Date().getFullYear() + 10, 11)}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
