"use client";

import { memo, useId, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  loadInterestRegistration,
  updateInterestRegistration,
  updateInterestRegistrationInboxStatus,
} from "@/actions/interest-registrations";
import {
  ADMIN_INBOX_EDIT_HEADER_CLASS,
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailGrid,
  AdminDetailRow,
  AdminDetailSection,
} from "@/components/dashboard/admin-detail-row";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminInboxArchiveButton } from "@/components/dashboard/admin-inbox-archive-button";
import { AdminRowActionButtons } from "@/components/dashboard/admin-row-action-buttons";
import { InboxDialogLoading } from "@/components/dashboard/inbox-dialog-loading";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
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
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import { useEditorRecord } from "@/hooks/use-editor-record";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import { formatAdminDateTime } from "@/lib/admin-format";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import type {
  InterestRegistration,
  InterestRegistrationListItem,
} from "@/types/interest-registration";
import {
  INTEREST_REGISTRATION_COMPANY_MAX,
  INTEREST_REGISTRATION_COUNTRY_MAX,
  INTEREST_REGISTRATION_EMAIL_MAX,
  INTEREST_REGISTRATION_FULL_NAME_MAX,
  INTEREST_REGISTRATION_PHONE_MAX,
  INTEREST_REGISTRATION_PITCH_MAX,
  INTEREST_REGISTRATION_PITCH_MIN,
  INTEREST_REGISTRATION_ROLE_MAX,
  INTEREST_REGISTRATION_SECTOR_MAX,
  INTEREST_REGISTRATION_URL_MAX,
  updateInterestRegistrationSchema,
  type UpdateInterestRegistrationInput,
} from "@/validations/interest-registration";

function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <FieldError>{message}</FieldError>;
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  const trimmed = href.trim();
  if (!trimmed) return null;
  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-primary hover:underline"
    >
      {label || trimmed}
    </a>
  );
}

const EDIT_DIALOG_CONTENT_CLASS =
  "max-h-[90vh] w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-lg";

function toEditDefaults(
  registration: InterestRegistration,
): UpdateInterestRegistrationInput {
  return {
    id: registration.id,
    fullName: registration.full_name,
    founderRole: registration.founder_role ?? "",
    email: registration.email,
    phone: registration.phone,
    country: registration.country,
    linkedin: registration.linkedin ?? "",
    companyName: registration.company_name,
    website: registration.website ?? "",
    companyCountry: registration.company_country,
    sector: registration.sector,
    pitch: registration.pitch ?? "",
    commsOptIn: registration.comms_opt_in,
  };
}

export const RegistrationRowActions = memo(function RegistrationRowActions({
  registration,
  onView,
  onEdit,
  onDelete,
}: {
  registration: InterestRegistrationListItem;
  onView: (row: InterestRegistrationListItem) => void;
  onEdit: (row: InterestRegistrationListItem) => void;
  onDelete: (row: InterestRegistrationListItem) => void;
}) {
  return (
    <AdminRowActionButtons
      viewLabel={`View ${registration.full_name}`}
      editLabel={`Edit ${registration.full_name}`}
      deleteLabel={`Delete ${registration.full_name}`}
      onView={() => onView(registration)}
      onEdit={() => onEdit(registration)}
      onDelete={() => onDelete(registration)}
      extra={
        <AdminInboxArchiveButton
          id={registration.id}
          inboxStatus={registration.inbox_status}
          updateAction={updateInterestRegistrationInboxStatus}
        />
      }
    />
  );
});

export function RegistrationViewDialog({
  open,
  registrationId,
  inboxStatus,
  onOpenChange,
}: {
  open: boolean;
  registrationId: string | undefined;
  inboxStatus: InterestRegistration["inbox_status"] | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: registrationId,
    load: loadInterestRegistration,
    missingMessage: "Registration not found.",
  });
  useMarkInboxReviewed({
    id: registrationId ?? "",
    inboxStatus: inboxStatus ?? "reviewed",
    updateAction: updateInterestRegistrationInboxStatus,
    isOpen: open && Boolean(registrationId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
              {record?.full_name ?? "Registration"}
            </DialogTitle>
            {record ? <InboxStatusBadge status={record.inbox_status} /> : null}
          </div>
          <DialogDescription>
            {record
              ? `Registration · submitted ${formatAdminDateTime(record.created_at)}`
              : "Registration details"}
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <div className="grid min-w-0 gap-6">
            <AdminDetailSection title="Contact">
              <AdminDetailGrid>
                <AdminDetailRow label="Role">{record.founder_role}</AdminDetailRow>
                <AdminDetailRow label="Country">{record.country}</AdminDetailRow>
                <AdminDetailRow label="Email">{record.email}</AdminDetailRow>
                <AdminDetailRow label="Phone">{record.phone}</AdminDetailRow>
                <AdminDetailRow label="LinkedIn" className="sm:col-span-2">
                  {record.linkedin ? (
                    <ExternalLink href={record.linkedin} label={record.linkedin} />
                  ) : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>
            <AdminDetailSection title="Company">
              <AdminDetailGrid>
                <AdminDetailRow label="Name">{record.company_name}</AdminDetailRow>
                <AdminDetailRow label="Sector">{record.sector}</AdminDetailRow>
                <AdminDetailRow label="Company country">
                  {record.company_country}
                </AdminDetailRow>
                <AdminDetailRow label="Consent">
                  {record.consent ? "Yes" : "No"}
                </AdminDetailRow>
                <AdminDetailRow label="Communications">
                  {record.comms_opt_in ? "Opted in" : "Not opted in"}
                </AdminDetailRow>
                <AdminDetailRow label="Website" className="sm:col-span-2">
                  {record.website ? (
                    <ExternalLink href={record.website} label={record.website} />
                  ) : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>
            <AdminDetailSection title="Note">
              <AdminDetailRow label="Pitch">{record.pitch}</AdminDetailRow>
            </AdminDetailSection>
            <AdminDetailSection title="Submission context">
              <AdminDetailGrid>
                <AdminDetailRow label="Locale">{record.locale.toUpperCase()}</AdminDetailRow>
                <AdminDetailRow label="Source">{record.source_path}</AdminDetailRow>
                <AdminDetailRow label="Consent version">
                  {record.consent_version}
                </AdminDetailRow>
              </AdminDetailGrid>
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

function RegistrationEditForm({
  registration,
  onClose,
}: {
  registration: InterestRegistration;
  onClose: () => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [isUpdating, startUpdate] = useTransition();
  const form = useForm<UpdateInterestRegistrationInput>({
    resolver: zodResolver(updateInterestRegistrationSchema),
    mode: "onChange",
    defaultValues: toEditDefaults(registration),
  });
  const { errors, isDirty } = form.formState;

  function onUpdate(values: UpdateInterestRegistrationInput) {
    startUpdate(async () => {
      try {
        const result = await updateInterestRegistration(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onClose();
        router.refresh();
      } catch {
        toast.error("The registration could not be updated. Please try again.");
      }
    });
  }

  return (
    <>
      <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
        <DialogTitle>Edit registration</DialogTitle>
        <DialogDescription>
          Update the submitted interest details.
        </DialogDescription>
      </DialogHeader>

      <form id={editFormId} onSubmit={form.handleSubmit(onUpdate)} noValidate>
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(form.formState.errors.fullName)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-name"
                hint={`2–${INTEREST_REGISTRATION_FULL_NAME_MAX} chars`}
              >
                Full name
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-name"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_FULL_NAME_MAX}
                className="min-h-11"
                placeholder="e.g. Ama Mensah"
                aria-invalid={Boolean(form.formState.errors.fullName)}
                {...form.register("fullName")}
              />
              <FormFieldError message={form.formState.errors.fullName?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-email"
                hint={`max ${INTEREST_REGISTRATION_EMAIL_MAX}`}
              >
                Email
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-email"
                type="email"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_EMAIL_MAX}
                className="min-h-11"
                placeholder="name@company.com"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FormFieldError message={form.formState.errors.email?.message} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(form.formState.errors.phone)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-phone"
                hint={`7–${INTEREST_REGISTRATION_PHONE_MAX} · +()- spaces`}
              >
                Phone
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-phone"
                type="tel"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_PHONE_MAX}
                className="min-h-11"
                placeholder="+233 20 000 0000"
                aria-invalid={Boolean(form.formState.errors.phone)}
                {...form.register("phone")}
              />
              <FormFieldError message={form.formState.errors.phone?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.companyName)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-company"
                hint={`2–${INTEREST_REGISTRATION_COMPANY_MAX} chars`}
              >
                Company
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-company"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_COMPANY_MAX}
                className="min-h-11"
                placeholder="Startup or company name"
                aria-invalid={Boolean(form.formState.errors.companyName)}
                {...form.register("companyName")}
              />
              <FormFieldError
                message={form.formState.errors.companyName?.message}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(form.formState.errors.sector)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-sector"
                hint={`2–${INTEREST_REGISTRATION_SECTOR_MAX} chars`}
              >
                Sector
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-sector"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_SECTOR_MAX}
                className="min-h-11"
                placeholder="e.g. Fintech"
                aria-invalid={Boolean(form.formState.errors.sector)}
                {...form.register("sector")}
              />
              <FormFieldError message={form.formState.errors.sector?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.country)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-country"
                hint={`2–${INTEREST_REGISTRATION_COUNTRY_MAX} chars`}
              >
                Country
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-country"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_COUNTRY_MAX}
                className="min-h-11"
                placeholder="e.g. Ghana"
                aria-invalid={Boolean(form.formState.errors.country)}
                {...form.register("country")}
              />
              <FormFieldError message={form.formState.errors.country?.message} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(form.formState.errors.founderRole)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-role"
                hint={`max ${INTEREST_REGISTRATION_ROLE_MAX}`}
              >
                Role
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-role"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_ROLE_MAX}
                className="min-h-11"
                placeholder="e.g. Founder / CEO"
                aria-invalid={Boolean(form.formState.errors.founderRole)}
                {...form.register("founderRole")}
              />
              <FormFieldError
                message={form.formState.errors.founderRole?.message}
              />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.companyCountry)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-company-country"
                hint={`2–${INTEREST_REGISTRATION_COUNTRY_MAX} chars`}
              >
                Company country
              </AdminFormFieldLabel>
              <Input
                id="edit-reg-company-country"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_COUNTRY_MAX}
                className="min-h-11"
                placeholder="e.g. Ghana"
                aria-invalid={Boolean(form.formState.errors.companyCountry)}
                {...form.register("companyCountry")}
              />
              <FormFieldError
                message={form.formState.errors.companyCountry?.message}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(form.formState.errors.linkedin)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-linkedin"
                hint={`Optional · http(s):// · max ${INTEREST_REGISTRATION_URL_MAX}`}
              >
                LinkedIn
              </AdminFormFieldLabel>
              <UrlInput
                id="edit-reg-linkedin"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_URL_MAX}
                className="min-h-11"
                placeholder="linkedin.com/in/…"
                aria-invalid={Boolean(form.formState.errors.linkedin)}
                {...form.register("linkedin")}
              />
              <FormFieldError message={form.formState.errors.linkedin?.message} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.website)}>
              <AdminFormFieldLabel
                htmlFor="edit-reg-website"
                hint={`Optional · http(s):// · max ${INTEREST_REGISTRATION_URL_MAX}`}
              >
                Website
              </AdminFormFieldLabel>
              <UrlInput
                id="edit-reg-website"
                disabled={isUpdating}
                maxLength={INTEREST_REGISTRATION_URL_MAX}
                className="min-h-11"
                placeholder="example.com"
                aria-invalid={Boolean(form.formState.errors.website)}
                {...form.register("website")}
              />
              <FormFieldError message={form.formState.errors.website?.message} />
            </Field>
          </div>
          <Field data-invalid={Boolean(form.formState.errors.pitch)}>
            <AdminFormFieldLabel
              htmlFor="edit-reg-pitch"
              hint={`Optional · ${INTEREST_REGISTRATION_PITCH_MIN}–${INTEREST_REGISTRATION_PITCH_MAX} if filled`}
            >
              Note (optional)
            </AdminFormFieldLabel>
            <Textarea
              id="edit-reg-pitch"
              rows={5}
              disabled={isUpdating}
              maxLength={INTEREST_REGISTRATION_PITCH_MAX}
              className="min-h-32"
              placeholder="Optional note about the startup or interest…"
              aria-invalid={Boolean(form.formState.errors.pitch)}
              {...form.register("pitch")}
            />
            <FormFieldError message={form.formState.errors.pitch?.message} />
          </Field>
          <Field>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 size-4"
                disabled={isUpdating}
                {...form.register("commsOptIn")}
              />
              <span>Comms opt-in</span>
            </label>
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

export function RegistrationEditDialog({
  open,
  registrationId,
  onOpenChange,
}: {
  open: boolean;
  registrationId: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: registrationId,
    load: loadInterestRegistration,
    missingMessage: "Registration not found.",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={EDIT_DIALOG_CONTENT_CLASS}>
        {record ? (
          <RegistrationEditForm
            registration={record}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
              <DialogTitle>Edit registration</DialogTitle>
              <DialogDescription>
                Update the submitted interest details.
              </DialogDescription>
            </DialogHeader>
            {isLoading ? <InboxDialogLoading /> : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
