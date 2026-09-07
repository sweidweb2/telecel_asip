"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INBOX_LIST_FILTER_LABELS,
  INBOX_LIST_FILTERS,
  type InboxListFilter,
} from "@/validations/inbox";

export function AdminInboxStatusFilter({
  id,
  value,
  disabled,
  onChange,
}: {
  id: string;
  value: InboxListFilter;
  disabled?: boolean;
  onChange: (value: InboxListFilter) => void;
}) {
  return (
    <>
      <Label htmlFor={id} className="sr-only">
        Inbox status
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next as InboxListFilter);
        }}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="min-h-11 w-full sm:min-h-8 sm:w-36">
          <SelectValue placeholder="Inbox" />
        </SelectTrigger>
        <SelectContent>
          {INBOX_LIST_FILTERS.map((status) => (
            <SelectItem key={status} value={status}>
              {INBOX_LIST_FILTER_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
