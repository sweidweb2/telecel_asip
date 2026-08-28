"use client";

import { CheckIcon } from "lucide-react";

import type { ContactEnquiryRoute } from "@/components/marketing/contact-labels";
import type { ContactEnquiryType } from "@/constants/contact-enquiry";
import { cn } from "@/lib/utils";

type ContactRoutePickerProps = {
  routes: readonly ContactEnquiryRoute[];
  value: ContactEnquiryType;
  onChange: (value: ContactEnquiryType) => void;
  legend: string;
  hint: string;
  disabled?: boolean;
  /** Distinguishes the radio group when more than one renders on a page. */
  name?: string;
};

/**
 * Native radio group styled as selectable cards, so each enquiry route
 * carries its own microcopy and stays keyboard- and screen-reader-friendly.
 */
export function ContactRoutePicker({
  routes,
  value,
  onChange,
  legend,
  hint,
  disabled,
  name = "contact-enquiry-route",
}: ContactRoutePickerProps) {
  return (
    <fieldset className="min-w-0" disabled={disabled}>
      <legend className="text-sm font-medium">{legend}</legend>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {routes.map((route) => {
          const isSelected = route.id === value;

          return (
            <label
              key={route.id}
              className={cn(
                "relative flex min-h-11 cursor-pointer flex-col gap-1 rounded-lg border p-3 text-left transition-colors",
                "hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-transparent",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={route.id}
                checked={isSelected}
                onChange={() => onChange(route.id)}
              />
              <span className="flex items-center justify-between gap-2 pr-1">
                <span className="text-sm font-medium">{route.label}</span>
                {isSelected ? (
                  <CheckIcon
                    aria-hidden
                    className="size-4 shrink-0 text-primary"
                  />
                ) : null}
              </span>
              <span className="text-xs leading-5 text-muted-foreground text-pretty">
                {route.microcopy}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
