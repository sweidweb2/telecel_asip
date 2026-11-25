"use client";

import {
  loadApplication,
  updateApplicationInboxStatus,
} from "@/actions/applications";
import {
  AdminDetailGrid,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminExternalLink } from "@/components/dashboard/admin-external-link";
import { InboxViewDialogShell } from "@/components/dashboard/inbox-view-dialog";
import { useInboxViewDialog } from "@/hooks/use-inbox-view-dialog";
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
  const { record, isLoading } = useInboxViewDialog({
    open,
    id: applicationId,
    inboxStatus,
    load: loadApplication,
    updateAction: updateApplicationInboxStatus,
    missingMessage: "Application not found.",
  });

  return (
    <InboxViewDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={record?.full_name ?? "Application"}
      description={
        record
          ? `Application · submitted ${formatAdminDateTime(record.created_at)}`
          : "Application details"
      }
      status={record?.inbox_status}
      hasRecord={Boolean(record)}
      isLoading={isLoading}
    >
      {record ? (
        <>
          <AdminDetailSection title="Founder">
            <AdminDetailGrid>
              <AdminDetailRow label="Role">{record.founder_role}</AdminDetailRow>
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
        </>
      ) : null}
    </InboxViewDialogShell>
  );
}
