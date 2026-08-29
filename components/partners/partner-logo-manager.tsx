"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import {
  ImageOffIcon,
  Loader2Icon,
  TriangleAlertIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { removePartnerLogo, uploadPartnerLogo } from "@/actions/partners";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { PartnerListItem } from "@/types/partner";

const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * Standalone logo CRUD for the partner detail page. Writes go straight to
 * Storage through the Server Actions, independent of the record form.
 */
export function PartnerLogoManager({ partner }: { partner: PartnerListItem }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Logo must be under 2 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadPartnerLogo(partner.id, formData);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removePartnerLogo(partner.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setRemoveOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
        {partner.logo_url ? (
          <Image
            src={partner.logo_url}
            alt={`${partner.name} logo`}
            width={320}
            height={320}
            sizes="(max-width: 1024px) 60vw, 320px"
            className="size-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOffIcon className="size-7" />
            <span className="text-xs">No logo uploaded</span>
          </div>
        )}
        {isPending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={LOGO_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 flex-1 sm:min-h-9"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon />
          {partner.logo_url ? "Replace" : "Upload"}
        </Button>

        {partner.logo_url ? (
          <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-11 text-destructive hover:bg-destructive/10 hover:text-destructive sm:min-h-9"
                  disabled={isPending}
                />
              }
            >
              <XIcon />
              Remove
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="text-left">
                <AlertDialogTitle>Remove logo?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes the image from Storage. The partner record stays
                  in place. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <XIcon />
                  )}
                  {isPending ? "Removing…" : "Remove logo"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or GIF under 2 MB. Resized to 512px and converted to
        WebP before upload.
      </p>

      {partner.logo_url && !partner.logo_permission ? (
        <p className="flex items-start gap-2 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
          Hidden on the public site until publication permission is granted.
        </p>
      ) : null}
    </div>
  );
}
