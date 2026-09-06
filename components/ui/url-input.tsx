"use client";

import { useRef, type ComponentProps, type Ref } from "react";
import { Link2Icon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const HTTPS_PREFIX = "https://";

function ensureHttpsPrefix(raw: string): string {
  const value = raw.trim();
  if (!value || value === "http://" || value === "https://") {
    return HTTPS_PREFIX;
  }
  if (/^https:\/\//i.test(value)) {
    return value;
  }
  if (/^http:\/\//i.test(value)) {
    return value.replace(/^http:\/\//i, HTTPS_PREFIX);
  }
  if (value.startsWith("//")) {
    return `https:${value}`;
  }
  return `${HTTPS_PREFIX}${value.replace(/^\/+/, "")}`;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

type UrlInputProps = Omit<ComponentProps<typeof Input>, "type">;

/**
 * URL field with a trailing icon that inserts `https://` so the user can type
 * the domain next. Works with react-hook-form `register` via ref forwarding.
 */
export function UrlInput({
  className,
  disabled,
  onChange,
  ref,
  ...props
}: UrlInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function insertHttpsPrefix() {
    const el = inputRef.current;
    if (!el || disabled) return;

    const next = ensureHttpsPrefix(el.value);
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    );
    descriptor?.set?.call(el, next);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
    const cursor = next.length;
    el.setSelectionRange(cursor, cursor);
  }

  return (
    <div className="relative min-w-0">
      <Input
        {...props}
        type="url"
        inputMode="url"
        disabled={disabled}
        onChange={onChange}
        className={cn("pr-11", className)}
        ref={(node) => {
          inputRef.current = node;
          assignRef(ref, node);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        aria-label="Insert https://"
        title="Insert https://"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={insertHttpsPrefix}
        className={cn(
          "absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        )}
      >
        <Link2Icon className="size-4" />
      </button>
    </div>
  );
}
