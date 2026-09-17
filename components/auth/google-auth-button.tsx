"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function GoogleAuthButton({
  label,
  loadingLabel,
  errorMessage,
  redirectTo,
}: {
  label: string;
  loadingLabel: string;
  errorMessage: string;
  redirectTo?: string;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const result = await signInWithGoogle(redirectTo);

    if (result.status === "error" || !result.redirectTo) {
      toast.error(result.status === "error" ? result.message : errorMessage);
      setIsPending(false);
      return;
    }

    window.location.assign(result.redirectTo);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 w-full sm:min-h-8"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.87A6.02 6.02 0 0 1 6.07 12c0-.65.11-1.28.32-1.87V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.61Z" />
          <path fill="#EA4335" d="M12 6c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.61C7.18 7.76 9.39 6 12 6Z" />
        </svg>
      )}
      {isPending ? loadingLabel : label}
    </Button>
  );
}
