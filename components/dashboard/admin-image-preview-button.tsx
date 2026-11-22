"use client";

import { useState } from "react";
import { EyeIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AdminImagePreviewButtonProps = {
  src: string | null | undefined;
  alt: string;
  /** Accessible label for the overlay control. */
  label?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Overlay “view” control for cropped media thumbnails (`object-cover`).
 * Opens a dialog with the full image at `object-contain`.
 * Place inside a `relative` holder; default sits top-left (clear stays top-right).
 */
export function AdminImagePreviewButton({
  src,
  alt,
  label = "View full image",
  disabled = false,
  className,
}: AdminImagePreviewButtonProps) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "secondary", size: "icon-xs" }),
          "absolute top-1.5 left-1.5 z-10 size-7 border border-border/80 bg-background/95 text-muted-foreground shadow-sm hover:text-foreground",
          className,
        )}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <EyeIcon />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[min(90vh,40rem)] w-[min(100vw-2rem,42rem)] max-w-none gap-3 overflow-hidden p-3 sm:p-4"
          showCloseButton
        >
          <DialogHeader className="gap-1 pr-8">
            <DialogTitle className="truncate">{alt}</DialogTitle>
            <DialogDescription className="sr-only">
              Full-size preview of the selected image.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[min(75vh,32rem)] items-center justify-center overflow-auto rounded-lg bg-muted/50 p-2">
            {/* Blob + remote URLs; dialog preview does not need next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[min(75vh,32rem)] max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
