"use client";

import { format } from "date-fns";
import { EyeIcon } from "lucide-react";

import { deleteApplication } from "@/actions/applications";
import { AdminDetailRow } from "@/components/dashboard/admin-detail-row";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
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

export function ApplicationRowActions({
  application,
}: {
  application: Application;
}) {
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
            <AdminDetailRow label="Role">{application.founder_role}</AdminDetailRow>
            <AdminDetailRow label="Email">{application.email}</AdminDetailRow>
            <AdminDetailRow label="Phone">{application.phone}</AdminDetailRow>
            <AdminDetailRow label="Country">{application.country}</AdminDetailRow>
            <AdminDetailRow label="LinkedIn">
              <a
                href={application.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {application.linkedin}
              </a>
            </AdminDetailRow>
            <AdminDetailRow label="Startup">{application.company_name}</AdminDetailRow>
            <AdminDetailRow label="Website">
              <a
                href={application.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {application.website}
              </a>
            </AdminDetailRow>
            <AdminDetailRow label="Company country">
              {application.company_country}
            </AdminDetailRow>
            <AdminDetailRow label="Sector">{application.sector}</AdminDetailRow>
            <AdminDetailRow label="Problem & product">
              {application.problem_product}
            </AdminDetailRow>
            <AdminDetailRow label="Traction">{application.traction}</AdminDetailRow>
            <AdminDetailRow label="Programme fit">
              {application.programme_fit}
            </AdminDetailRow>
            <AdminDetailRow label="Comms opt-in">
              {application.comms_opt_in ? "Yes" : "No"}
            </AdminDetailRow>
          </dl>
        </DialogContent>
      </Dialog>

      <AdminRowDelete
        deleteAction={() => deleteApplication({ id: application.id })}
        fallbackError="The application could not be deleted. Please try again."
        title="Delete application?"
        description={
          <>
            This permanently deletes the application from{" "}
            {application.full_name} ({application.company_name}). This cannot be
            undone.
          </>
        }
        confirmLabel="Delete"
        triggerLabel={`Delete ${application.full_name}`}
      />
    </div>
  );
}
