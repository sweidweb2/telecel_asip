"use client";

import { SelectValue } from "@/components/ui/select";

type AdminFilterSelectValueProps = {
  /** Field name shown when the filter is unset (`all`), e.g. "Status". */
  label: string;
  /** Display labels for concrete option values (not including `all`). */
  optionLabels: Record<string, string>;
};

/**
 * Closed-select label for admin list filters.
 * Keeps `value="all"` in the query, but shows the field label instead of "All …".
 */
export function AdminFilterSelectValue({
  label,
  optionLabels,
}: AdminFilterSelectValueProps) {
  return (
    <SelectValue placeholder={label}>
      {(selected: string | null) => {
        if (!selected || selected === "all") return label;
        return optionLabels[selected] ?? selected;
      }}
    </SelectValue>
  );
}
