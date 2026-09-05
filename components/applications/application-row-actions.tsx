"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "nextjs-toploader/app";
import { EyeIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteApplication } from "@/actions/applications";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Application } from "@/types/application";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm break-words whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

export function ApplicationRowActions({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteApplication({ id: application.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
      } catch {
        toast.error("The application could not be deleted. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`View ${application.full_name}`}
            />
          }
        >
          <EyeIcon />
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{application.full_name}</DialogTitle>
            <DialogDescription>
              Application submitted{" "}
              {format(new Date(application.created_at), "MMM d, yyyy · HH:mm")}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-4">
            <DetailRow label="Role">{application.founder_role}</DetailRow>
            <DetailRow label="Email">{application.email}</DetailRow>
            <DetailRow label="Phone">{application.phone}</DetailRow>
            <DetailRow label="Country">{application.country}</DetailRow>
            <DetailRow label="LinkedIn">
              <a
                href={application.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {application.linkedin}
              </a>
            </DetailRow>
            <DetailRow label="Startup">{application.company_name}</DetailRow>
            <DetailRow label="Website">
              <a
                href={application.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {application.website}
              </a>
            </DetailRow>
            <DetailRow label="Company country">
              {application.company_country}
            </DetailRow>
            <DetailRow label="Sector">{application.sector}</DetailRow>
            <DetailRow label="Problem & product">
              {application.problem_product}
            </DetailRow>
            <DetailRow label="Traction">{application.traction}</DetailRow>
            <DetailRow label="Programme fit">
              {application.programme_fit}
            </DetailRow>
            <DetailRow label="Comms opt-in">
              {application.comms_opt_in ? "Yes" : "No"}
            </DetailRow>
          </dl>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${application.full_name}`}
            />
          }
        >
          <Trash2Icon />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the application from{" "}
              {application.full_name} ({application.company_name}). This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2Icon />
              )}
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
