"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

/**
 * Password field with an in-input eye toggle for show / hide.
 */
export function PasswordInput({
  className,
  disabled,
  showPasswordLabel,
  hidePasswordLabel,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-0.5 inline-flex size-9 min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        disabled={disabled}
        aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
        aria-pressed={isVisible}
        // Keep focus on the password field so the type swap does not glitch.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setIsVisible((prev) => !prev)}
      >
        <EyeIcon
          className={isVisible ? "hidden size-4" : "size-4"}
          aria-hidden
        />
        <EyeOffIcon
          className={isVisible ? "size-4" : "hidden size-4"}
          aria-hidden
        />
      </button>
    </div>
  );
}
