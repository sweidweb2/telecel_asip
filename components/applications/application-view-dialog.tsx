"use client";

import {
  loadApplication,
  updateApplicationInboxStatus,
} from "@/actions/applications";
import {
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailGrid,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminExternalLink } from "@/components/dashboard/admin-external-link";
import { InboxDialogLoading } from "@/components/dashboard/inbox-dialog-loading";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditorRecord } from "@/hooks/use-editor-record";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import { formatAdminDateTime } from "@/lib/admin-format";
import type { Application } from "@/types/application";

export function ApplicationViewDialog({
  open,
  applicationId,
  inboxStatus,
  onOpenChange,
}: {
  open: boolean;
  applicationId: string | undefined;
  inboxStatus: Application["inbox_status"] | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: applicationId,
    load: loadApplication,
    missingMessage: "Application not found.",
  });
  useMarkInboxReviewed({
    id: applicationId ?? "",
    inboxStatus: inboxStatus ?? "reviewed",
    updateAction: updateApplicationInboxStatus,
    isOpen: open && Boolean(applicationId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
              {record?.full_name ?? "Application"}
            </DialogTitle>
            {record ? (
              <InboxStatusBadge status={record.inbox_status} />
            ) : null}
          </div>
          <DialogDescription>
            {record
              ? `Application · submitted ${formatAdminDateTime(record.created_at)}`
              : "Application details"}
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <div className="grid min-w-0 gap-6">
            <AdminDetailSection title="Founder">
              <AdminDetailGrid>
                <AdminDetailRow label="Role">
                  {record.founder_role}
                </AdminDetailRow>
                <AdminDetailRow label="Country">{record.country}</AdminDetailRow>
                <AdminDetailRow label="Email">{record.email}</AdminDetailRow>
                <AdminDetailRow label="Phone">{record.phone}</AdminDetailRow>
                <AdminDetailRow label="LinkedIn" className="sm:col-span-2">
                  {record.linkedin ? (
                    <AdminExternalLink
                      href={record.linkedin}
                      label={record.linkedin}
                    />
                  ) : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>

            <AdminDetailSection title="Startup">
              <AdminDetailGrid>
                <AdminDetailRow label="Name">{record.company_name}</AdminDetailRow>
                <AdminDetailRow label="Sector">{record.sector}</AdminDetailRow>
                <AdminDetailRow label="Company country">
                  {record.company_country}
                </AdminDetailRow>
                <AdminDetailRow label="Comms opt-in">
                  {record.comms_opt_in ? "Yes" : "No"}
                </AdminDetailRow>
                <AdminDetailRow label="Website" className="sm:col-span-2">
                  {record.website ? (
                    <AdminExternalLink
                      href={record.website}
                      label={record.website}
                    />
                  ) : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>

            <AdminDetailSection title="Application">
              <div className="grid gap-4">
                <AdminDetailRow label="Problem & product">
                  {record.problem_product}
                </AdminDetailRow>
                <AdminDetailRow label="Traction">{record.traction}</AdminDetailRow>
                <AdminDetailRow label="Program fit">
                  {record.programme_fit}
                </AdminDetailRow>
              </div>
            </AdminDetailSection>
          </div>
        ) : isLoading ? (
          <InboxDialogLoading />
        ) : null}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
