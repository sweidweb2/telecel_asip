"use client";

import { memo, useId, useTransition } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  loadInvestorInterest,
  updateInvestorInterest,
  updateInvestorInterestInboxStatus,
} from "@/actions/investor-interests";
import {
  ADMIN_INBOX_EDIT_DIALOG_CLASS,
  ADMIN_INBOX_EDIT_HEADER_CLASS,
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminInboxArchiveButton } from "@/components/dashboard/admin-inbox-archive-button";
import { AdminRowActionButtons } from "@/components/dashboard/admin-row-action-buttons";
import { InboxDialogLoading } from "@/components/dashboard/inbox-dialog-loading";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import {
  InvestorCommsOptInField,
  InvestorContactEditFields,
  InvestorContactViewSections,
  InvestorContextViewSection,
  type InvestorContactEditValues,
} from "@/components/investor-inbox/investor-inbox-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useEditorRecord } from "@/hooks/use-editor-record";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import { formatAdminDateTime } from "@/lib/admin-format";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import type {
  InvestorInterest,
  InvestorInterestListItem,
} from "@/types/investor-interest";
import {
  INVESTOR_INTEREST_FOCUS_NOTE_MAX,
  INVESTOR_INTEREST_FOCUS_NOTE_MIN,
  updateInvestorInterestSchema,
  type UpdateInvestorInterestInput,
} from "@/validations/investor-interest";

function toEditDefaults(interest: InvestorInterest): UpdateInvestorInterestInput {
  return {
    id: interest.id,
    fullName: interest.full_name,
    email: interest.email,
    phone: interest.phone ?? "",
    organization: interest.organization,
    jobTitle: interest.job_title ?? "",
    linkedin: interest.linkedin ?? "",
    investorType: interest.investor_type,
    focusNote: interest.focus_note ?? "",
    commsOptIn: interest.comms_opt_in,
  };
}

export const InvestorInterestRowActions = memo(
  function InvestorInterestRowActions({
    interest,
    onView,
    onEdit,
    onDelete,
  }: {
    interest: InvestorInterestListItem;
    onView: (row: InvestorInterestListItem) => void;
    onEdit: (row: InvestorInterestListItem) => void;
    onDelete: (row: InvestorInterestListItem) => void;
  }) {
    return (
      <AdminRowActionButtons
        viewLabel={`View ${interest.full_name}`}
        editLabel={`Edit ${interest.full_name}`}
        deleteLabel={`Delete ${interest.full_name}`}
        onView={() => onView(interest)}
        onEdit={() => onEdit(interest)}
        onDelete={() => onDelete(interest)}
        extra={
          <AdminInboxArchiveButton
            id={interest.id}
            inboxStatus={interest.inbox_status}
            updateAction={updateInvestorInterestInboxStatus}
          />
        }
      />
    );
  },
);

export function InvestorInterestViewDialog({
  open,
  interestId,
  inboxStatus,
  onOpenChange,
}: {
  open: boolean;
  interestId: string | undefined;
  inboxStatus: InvestorInterest["inbox_status"] | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: interestId,
    load: loadInvestorInterest,
    missingMessage: "Investor interest not found.",
  });
  useMarkInboxReviewed({
    id: interestId ?? "",
    inboxStatus: inboxStatus ?? "reviewed",
    updateAction: updateInvestorInterestInboxStatus,
    isOpen: open && Boolean(interestId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
              {record?.full_name ?? "Investor interest"}
            </DialogTitle>
            {record ? <InboxStatusBadge status={record.inbox_status} /> : null}
          </div>
          <DialogDescription>
            {record
              ? `Investor interest · submitted ${formatAdminDateTime(record.created_at)}`
              : "Investor interest details"}
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <div className="grid min-w-0 gap-6">
            <InvestorContactViewSections record={record} />
            <AdminDetailSection title="Note">
              <AdminDetailRow label="Focus note">{record.focus_note}</AdminDetailRow>
            </AdminDetailSection>
            <InvestorContextViewSection
              locale={record.locale}
              sourcePath={record.source_path}
              consentVersion={record.consent_version}
            />
          </div>
        ) : isLoading ? (
          <InboxDialogLoading />
        ) : null}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

function InvestorInterestEditForm({
  interest,
  onClose,
}: {
  interest: InvestorInterest;
  onClose: () => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [isUpdating, startUpdate] = useTransition();
  const form = useForm<UpdateInvestorInterestInput>({
    resolver: zodResolver(updateInvestorInterestSchema),
    mode: "onChange",
    defaultValues: toEditDefaults(interest),
  });
  const { errors, isDirty } = form.formState;

  function onUpdate(values: UpdateInvestorInterestInput) {
    startUpdate(async () => {
      try {
        const result = await updateInvestorInterest(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onClose();
        router.refresh();
      } catch {
        toast.error("The investor interest could not be updated. Please try again.");
      }
    });
  }

  const contactForm = form as unknown as UseFormReturn<InvestorContactEditValues>;

  return (
    <>
      <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
        <DialogTitle>Edit investor interest</DialogTitle>
        <DialogDescription>
          Update the submitted investor interest details.
        </DialogDescription>
      </DialogHeader>

      <form id={editFormId} onSubmit={form.handleSubmit(onUpdate)} noValidate>
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <InvestorContactEditFields
            form={contactForm}
            idPrefix="edit-investor-interest"
            disabled={isUpdating}
          />
          <Field data-invalid={Boolean(errors.focusNote)}>
            <AdminFormFieldLabel
              htmlFor="edit-investor-interest-focus"
              hint={`Optional · ${INVESTOR_INTEREST_FOCUS_NOTE_MIN}–${INVESTOR_INTEREST_FOCUS_NOTE_MAX} if filled`}
            >
              Focus note (optional)
            </AdminFormFieldLabel>
            <Textarea
              id="edit-investor-interest-focus"
              rows={5}
              disabled={isUpdating}
              maxLength={INVESTOR_INTEREST_FOCUS_NOTE_MAX}
              className="min-h-32"
              placeholder="Optional note about sectors, stages, or interest…"
              aria-invalid={Boolean(errors.focusNote)}
              {...form.register("focusNote")}
            />
            <AdminFieldError message={errors.focusNote?.message} />
          </Field>
          <InvestorCommsOptInField form={contactForm} disabled={isUpdating} />
        </FieldGroup>
      </form>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isUpdating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form={editFormId}
          disabled={isAdminFormSubmitDisabled({
            isPending: isUpdating,
            isDirty,
            errors,
          })}
        >
          {isUpdating ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <PencilIcon />
          )}
          {isUpdating ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function InvestorInterestEditDialog({
  open,
  interestId,
  onOpenChange,
}: {
  open: boolean;
  interestId: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: interestId,
    load: loadInvestorInterest,
    missingMessage: "Investor interest not found.",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_EDIT_DIALOG_CLASS}>
        {record ? (
          <InvestorInterestEditForm
            interest={record}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
              <DialogTitle>Edit investor interest</DialogTitle>
              <DialogDescription>
                Update the submitted investor interest details.
              </DialogDescription>
            </DialogHeader>
            {isLoading ? <InboxDialogLoading /> : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
