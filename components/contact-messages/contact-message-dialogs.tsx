"use client";

import { useId, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { EyeIcon, Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  deleteContactMessage,
  updateContactMessage,
  updateContactMessageInboxStatus,
} from "@/actions/contact-messages";
import {
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailGrid,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminInboxArchiveButton } from "@/components/dashboard/admin-inbox-archive-button";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
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
  DialogTrigger,
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
import { formatAdminDateTime } from "@/lib/admin-format";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import type { ContactMessage } from "@/types/contact-message";
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

export function ContactMessageRowActions({
  message,
  viewOpen: controlledViewOpen,
  onViewOpenChange,
}: {
  message: ContactMessage;
  viewOpen?: boolean;
  onViewOpenChange?: (open: boolean) => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [uncontrolledViewOpen, setUncontrolledViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isUpdating, startUpdate] = useTransition();
  const isViewControlled = onViewOpenChange !== undefined;
  const viewOpen = isViewControlled
    ? Boolean(controlledViewOpen)
    : uncontrolledViewOpen;
  const setViewOpen = isViewControlled
    ? onViewOpenChange!
    : setUncontrolledViewOpen;
  const { onViewOpenChange: markReviewedOnOpen } = useMarkInboxReviewed({
    id: message.id,
    inboxStatus: message.inbox_status,
    updateAction: updateContactMessageInboxStatus,
    isOpen: viewOpen,
  });

  function handleViewOpenChange(open: boolean) {
    setViewOpen(open);
    markReviewedOnOpen(open);
  }

  const editDefaults = toEditDefaults(message);
  const form = useForm<UpdateContactMessageInput>({
    resolver: zodResolver(updateContactMessageSchema),
    defaultValues: editDefaults,
  });
  const enquiryType = useWatch({
    control: form.control,
    name: "enquiryType",
  });

  function handleEditOpen(next: boolean) {
    setEditOpen(next);
    if (next) form.reset(toEditDefaults(message));
  }

  function onUpdate(values: UpdateContactMessageInput) {
    startUpdate(async () => {
      try {
        const result = await updateContactMessage(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setEditOpen(false);
        router.refresh();
      } catch {
        toast.error("The message could not be updated. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog open={viewOpen} onOpenChange={handleViewOpenChange}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
              aria-label={`View ${message.subject}`}
            />
          }
        >
          <EyeIcon />
        </DialogTrigger>
        <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
          <DialogHeader className="min-w-0 gap-3">
            <div className="flex flex-wrap items-start gap-2 pr-8">
              <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
                {message.subject}
              </DialogTitle>
              <InboxStatusBadge status={message.inbox_status} />
            </div>
            <DialogDescription>
              Contact · submitted {formatAdminDateTime(message.created_at)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-w-0 gap-6">
            <AdminDetailSection title="Sender">
              <AdminDetailGrid>
                <AdminDetailRow label="Name">
                  {message.full_name}
                </AdminDetailRow>
                <AdminDetailRow label="Route">
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {CONTACT_ENQUIRY_ADMIN_LABELS[message.enquiry_type]}
                  </Badge>
                </AdminDetailRow>
                <AdminDetailRow label="Email">{message.email}</AdminDetailRow>
                <AdminDetailRow label="Phone">{message.phone}</AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>

            <AdminDetailSection title="Message">
              <AdminDetailRow label="Body">{message.message}</AdminDetailRow>
            </AdminDetailSection>
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <AdminInboxArchiveButton
        id={message.id}
        inboxStatus={message.inbox_status}
        updateAction={updateContactMessageInboxStatus}
      />

      <Dialog open={editOpen} onOpenChange={handleEditOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
              aria-label={`Edit ${message.subject}`}
            />
          }
        >
          <PencilIcon />
        </DialogTrigger>
        <DialogContent className={EDIT_DIALOG_CONTENT_CLASS}>
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
            <DialogDescription>
              Update the submitted contact details.
            </DialogDescription>
          </DialogHeader>

          <form
            id={editFormId}
            onSubmit={form.handleSubmit(onUpdate)}
            noValidate
          >
            <input type="hidden" {...form.register("id")} />
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.enquiryType)}>
                <AdminFormFieldLabel
                  htmlFor={`edit-enquiry-type-${message.id}`}
                  hint="Required"
                >
                  Enquiry route
                </AdminFormFieldLabel>
                <Select
                  value={enquiryType}
                  onValueChange={(value) => {
                    if (value) {
                      form.setValue(
                        "enquiryType",
                        value as ContactEnquiryType,
                        { shouldDirty: true },
                      );
                    }
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger
                    id={`edit-enquiry-type-${message.id}`}
                    className="min-h-11 w-full"
                  >
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
                <FormFieldError
                  message={form.formState.errors.enquiryType?.message}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.fullName)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-name-${message.id}`}
                    hint={`2–${CONTACT_MESSAGE_FULL_NAME_MAX} chars`}
                  >
                    Full name
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-name-${message.id}`}
                    disabled={isUpdating}
                    maxLength={CONTACT_MESSAGE_FULL_NAME_MAX}
                    className="min-h-11"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                    {...form.register("fullName")}
                  />
                  <FormFieldError
                    message={form.formState.errors.fullName?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.phone)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-phone-${message.id}`}
                    hint={`7–${CONTACT_MESSAGE_PHONE_MAX} · +()- spaces`}
                  >
                    Phone
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-phone-${message.id}`}
                    type="tel"
                    disabled={isUpdating}
                    maxLength={CONTACT_MESSAGE_PHONE_MAX}
                    className="min-h-11"
                    aria-invalid={Boolean(form.formState.errors.phone)}
                    {...form.register("phone")}
                  />
                  <FormFieldError
                    message={form.formState.errors.phone?.message}
                  />
                </Field>
              </div>
              <Field data-invalid={Boolean(form.formState.errors.email)}>
                <AdminFormFieldLabel
                  htmlFor={`edit-email-${message.id}`}
                  hint={`max ${CONTACT_MESSAGE_EMAIL_MAX}`}
                >
                  Email
                </AdminFormFieldLabel>
                <Input
                  id={`edit-email-${message.id}`}
                  type="email"
                  disabled={isUpdating}
                  maxLength={CONTACT_MESSAGE_EMAIL_MAX}
                  className="min-h-11"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register("email")}
                />
                <FormFieldError
                  message={form.formState.errors.email?.message}
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.subject)}>
                <AdminFormFieldLabel
                  htmlFor={`edit-subject-${message.id}`}
                  hint={`2–${CONTACT_MESSAGE_SUBJECT_MAX} chars`}
                >
                  Subject
                </AdminFormFieldLabel>
                <Input
                  id={`edit-subject-${message.id}`}
                  disabled={isUpdating}
                  maxLength={CONTACT_MESSAGE_SUBJECT_MAX}
                  className="min-h-11"
                  aria-invalid={Boolean(form.formState.errors.subject)}
                  {...form.register("subject")}
                />
                <FormFieldError
                  message={form.formState.errors.subject?.message}
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.message)}>
                <AdminFormFieldLabel
                  htmlFor={`edit-message-${message.id}`}
                  hint={`${CONTACT_MESSAGE_BODY_MIN}–${CONTACT_MESSAGE_BODY_MAX} chars`}
                >
                  Message
                </AdminFormFieldLabel>
                <Textarea
                  id={`edit-message-${message.id}`}
                  rows={5}
                  disabled={isUpdating}
                  maxLength={CONTACT_MESSAGE_BODY_MAX}
                  className="min-h-32"
                  aria-invalid={Boolean(form.formState.errors.message)}
                  {...form.register("message")}
                />
                <FormFieldError
                  message={form.formState.errors.message?.message}
                />
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" form={editFormId} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <PencilIcon />
              )}
              {isUpdating ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AdminRowDelete
        deleteAction={() => deleteContactMessage({ id: message.id })}
        fallbackError="The message could not be deleted. Please try again."
        title="Delete message?"
        description={
          <>
            This permanently deletes the message from {message.full_name} (
            {message.email}). This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        triggerLabel={`Delete ${message.subject}`}
      />
    </div>
  );
}
