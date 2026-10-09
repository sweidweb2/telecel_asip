"use client";

import { memo, useId, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  loadContactMessage,
  updateContactMessage,
  updateContactMessageInboxStatus,
} from "@/actions/contact-messages";
import {
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailGrid,
  AdminDetailRow,
  ADMIN_INBOX_EDIT_HEADER_CLASS,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminInboxArchiveButton } from "@/components/dashboard/admin-inbox-archive-button";
import { AdminRowActionButtons } from "@/components/dashboard/admin-row-action-buttons";
import { InboxDialogLoading } from "@/components/dashboard/inbox-dialog-loading";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_ENQUIRY_ADMIN_LABELS,
  CONTACT_ENQUIRY_TYPES,
  type ContactEnquiryType,
} from "@/constants/contact-enquiry";
import { useEditorRecord } from "@/hooks/use-editor-record";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import { formatAdminDateTime } from "@/lib/admin-format";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import type {
  ContactMessage,
  ContactMessageListItem,
} from "@/types/contact-message";
import {
  CONTACT_MESSAGE_BODY_MAX,
  CONTACT_MESSAGE_BODY_MIN,
  CONTACT_MESSAGE_EMAIL_MAX,
  CONTACT_MESSAGE_FULL_NAME_MAX,
  CONTACT_MESSAGE_PHONE_MAX,
  CONTACT_MESSAGE_SUBJECT_MAX,
  updateContactMessageSchema,
  type UpdateContactMessageInput,
} from "@/validations/contact-message";

function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <FieldError>{message}</FieldError>;
}

const EDIT_DIALOG_CONTENT_CLASS =
  "max-h-[90vh] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-lg";

function toEditDefaults(message: ContactMessage): UpdateContactMessageInput {
  return {
    id: message.id,
    enquiryType: message.enquiry_type,
    fullName: message.full_name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
  };
}

export const ContactMessageRowActions = memo(function ContactMessageRowActions({
  message,
  onView,
  onEdit,
  onDelete,
}: {
  message: ContactMessageListItem;
  onView: (row: ContactMessageListItem) => void;
  onEdit: (row: ContactMessageListItem) => void;
  onDelete: (row: ContactMessageListItem) => void;
}) {
  return (
    <AdminRowActionButtons
      viewLabel={`View ${message.full_name}`}
      editLabel={`Edit ${message.full_name}`}
      deleteLabel={`Delete ${message.full_name}`}
      onView={() => onView(message)}
      onEdit={() => onEdit(message)}
      onDelete={() => onDelete(message)}
      extra={
        <AdminInboxArchiveButton
          id={message.id}
          inboxStatus={message.inbox_status}
          updateAction={updateContactMessageInboxStatus}
        />
      }
    />
  );
});

export function ContactMessageViewDialog({
  open,
  messageId,
  inboxStatus,
  onOpenChange,
}: {
  open: boolean;
  messageId: string | undefined;
  inboxStatus: ContactMessage["inbox_status"] | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: messageId,
    load: loadContactMessage,
    missingMessage: "Message not found.",
  });
  useMarkInboxReviewed({
    id: messageId ?? "",
    inboxStatus: inboxStatus ?? "reviewed",
    updateAction: updateContactMessageInboxStatus,
    isOpen: open && Boolean(messageId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
              {record?.subject ?? "Contact message"}
            </DialogTitle>
            {record ? <InboxStatusBadge status={record.inbox_status} /> : null}
          </div>
          <DialogDescription>
            {record
              ? `Contact · submitted ${formatAdminDateTime(record.created_at)}`
              : "Contact details"}
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <div className="grid min-w-0 gap-6">
            <AdminDetailSection title="Sender">
              <AdminDetailGrid>
                <AdminDetailRow label="Name">{record.full_name}</AdminDetailRow>
                <AdminDetailRow label="Route">
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {CONTACT_ENQUIRY_ADMIN_LABELS[record.enquiry_type]}
                  </Badge>
                </AdminDetailRow>
                <AdminDetailRow label="Email">{record.email}</AdminDetailRow>
                <AdminDetailRow label="Phone">{record.phone}</AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>
            <AdminDetailSection title="Message">
              <AdminDetailRow label="Body">{record.message}</AdminDetailRow>
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

function ContactMessageEditForm({
  message,
  onClose,
}: {
  message: ContactMessage;
  onClose: () => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [isUpdating, startUpdate] = useTransition();
  const form = useForm<UpdateContactMessageInput>({
    resolver: zodResolver(updateContactMessageSchema),
    mode: "onChange",
    defaultValues: toEditDefaults(message),
  });
  const { errors, isDirty } = form.formState;
  const enquiryType = useWatch({
    control: form.control,
    name: "enquiryType",
  });

  function onUpdate(values: UpdateContactMessageInput) {
    startUpdate(async () => {
      try {
        const result = await updateContactMessage(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onClose();
        router.refresh();
      } catch {
        toast.error("The message could not be updated. Please try again.");
      }
    });
  }

  return (
    <>
      <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
        <DialogTitle>Edit message</DialogTitle>
        <DialogDescription>
          Update the submitted contact details.
        </DialogDescription>
      </DialogHeader>

      <form id={editFormId} onSubmit={form.handleSubmit(onUpdate)} noValidate>
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <Field data-invalid={Boolean(form.formState.errors.enquiryType)}>
            <AdminFormFieldLabel htmlFor="edit-msg-enquiry-type" hint="Required">
              Enquiry route
            </AdminFormFieldLabel>
            <Select
              value={enquiryType}
              onValueChange={(value) => {
                if (value) {
                  form.setValue("enquiryType", value as ContactEnquiryType, {
                    shouldDirty: true,
                  });
                }
              }}
              disabled={isUpdating}
            >
              <SelectTrigger id="edit-msg-enquiry-type" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_ENQUIRY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {CONTACT_ENQUIRY_ADMIN_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormFieldError message={form.formState.errors.enquiryType?.message} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(form.formState.errors.fullName)}>
              <AdminFormFieldLabel
                htmlFor="edit-msg-name"
                hint={`2–${CONTACT_MESSAGE_FULL_NAME_MAX} chars`}
              >
                Full name
              </AdminFormFieldLabel>
              <Input
                id="edit-msg-name"
                disabled={isUpdating}
                maxLength={CONTACT_MESSAGE_FULL_NAME_MAX}
                className="min-h-11"
                placeholder="e.g. Ama Mensah"
                aria-invalid={Boolean(form.formState.errors.fullName)}
                {...form.register("fullName")}
              />
              <FormFieldError message={form.formState.errors.fullName?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.phone)}>
              <AdminFormFieldLabel
                htmlFor="edit-msg-phone"
                hint={`7–${CONTACT_MESSAGE_PHONE_MAX} · +()- spaces`}
              >
                Phone
              </AdminFormFieldLabel>
              <Input
                id="edit-msg-phone"
                type="tel"
                disabled={isUpdating}
                maxLength={CONTACT_MESSAGE_PHONE_MAX}
                className="min-h-11"
                placeholder="+233 20 000 0000"
                aria-invalid={Boolean(form.formState.errors.phone)}
                {...form.register("phone")}
              />
              <FormFieldError message={form.formState.errors.phone?.message} />
            </Field>
          </div>
          <Field data-invalid={Boolean(form.formState.errors.email)}>
            <AdminFormFieldLabel
              htmlFor="edit-msg-email"
              hint={`max ${CONTACT_MESSAGE_EMAIL_MAX}`}
            >
              Email
            </AdminFormFieldLabel>
            <Input
              id="edit-msg-email"
              type="email"
              disabled={isUpdating}
              maxLength={CONTACT_MESSAGE_EMAIL_MAX}
              className="min-h-11"
              placeholder="name@company.com"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            <FormFieldError message={form.formState.errors.email?.message} />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.subject)}>
            <AdminFormFieldLabel
              htmlFor="edit-msg-subject"
              hint={`2–${CONTACT_MESSAGE_SUBJECT_MAX} chars`}
            >
              Subject
            </AdminFormFieldLabel>
            <Input
              id="edit-msg-subject"
              disabled={isUpdating}
              maxLength={CONTACT_MESSAGE_SUBJECT_MAX}
              className="min-h-11"
              placeholder="e.g. Partnership enquiry"
              aria-invalid={Boolean(form.formState.errors.subject)}
              {...form.register("subject")}
            />
            <FormFieldError message={form.formState.errors.subject?.message} />
          </Field>
          <Field data-invalid={Boolean(form.formState.errors.message)}>
            <AdminFormFieldLabel
              htmlFor="edit-msg-body"
              hint={`${CONTACT_MESSAGE_BODY_MIN}–${CONTACT_MESSAGE_BODY_MAX} chars`}
            >
              Message
            </AdminFormFieldLabel>
            <Textarea
              id="edit-msg-body"
              rows={5}
              disabled={isUpdating}
              maxLength={CONTACT_MESSAGE_BODY_MAX}
              className="min-h-32"
              placeholder="What they want to discuss…"
              aria-invalid={Boolean(form.formState.errors.message)}
              {...form.register("message")}
            />
            <FormFieldError message={form.formState.errors.message?.message} />
          </Field>
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

export function ContactMessageEditDialog({
  open,
  messageId,
  onOpenChange,
}: {
  open: boolean;
  messageId: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: messageId,
    load: loadContactMessage,
    missingMessage: "Message not found.",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={EDIT_DIALOG_CONTENT_CLASS}>
        {record ? (
          <ContactMessageEditForm
            message={record}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
              <DialogTitle>Edit message</DialogTitle>
              <DialogDescription>
                Update the submitted contact details.
              </DialogDescription>
            </DialogHeader>
            {isLoading ? <InboxDialogLoading /> : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
