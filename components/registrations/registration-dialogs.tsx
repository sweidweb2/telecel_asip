"use client";

import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { EyeIcon, Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  deleteInterestRegistration,
  updateInterestRegistration,
  updateInterestRegistrationInboxStatus,
} from "@/actions/interest-registrations";
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
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import { formatAdminDateTime } from "@/lib/admin-format";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import type { InterestRegistration } from "@/types/interest-registration";
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

export function RegistrationRowActions({
  registration,
  viewOpen: controlledViewOpen,
  onViewOpenChange,
}: {
  registration: InterestRegistration;
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
    id: registration.id,
    inboxStatus: registration.inbox_status,
    updateAction: updateInterestRegistrationInboxStatus,
    isOpen: viewOpen,
  });

  function handleViewOpenChange(open: boolean) {
    setViewOpen(open);
    markReviewedOnOpen(open);
  }

  const editDefaults = toEditDefaults(registration);
  const form = useForm<UpdateInterestRegistrationInput>({
    resolver: zodResolver(updateInterestRegistrationSchema),
    mode: "onChange",
    defaultValues: editDefaults,
  });
  const { errors, isDirty } = form.formState;

  function handleEditOpen(next: boolean) {
    setEditOpen(next);
    if (next) form.reset(toEditDefaults(registration));
  }

  function onUpdate(values: UpdateInterestRegistrationInput) {
    startUpdate(async () => {
      try {
        const result = await updateInterestRegistration(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setEditOpen(false);
        router.refresh();
      } catch {
        toast.error("The registration could not be updated. Please try again.");
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
              aria-label={`View ${registration.full_name}`}
            />
          }
        >
          <EyeIcon />
        </DialogTrigger>
        <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
          <DialogHeader className="min-w-0 gap-3">
            <div className="flex flex-wrap items-start gap-2 pr-8">
              <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
                {registration.full_name}
              </DialogTitle>
              <InboxStatusBadge status={registration.inbox_status} />
            </div>
            <DialogDescription>
              Registration · submitted{" "}
              {formatAdminDateTime(registration.created_at)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-w-0 gap-6">
            <AdminDetailSection title="Contact">
              <AdminDetailGrid>
                <AdminDetailRow label="Role">
                  {registration.founder_role}
                </AdminDetailRow>
                <AdminDetailRow label="Country">
                  {registration.country}
                </AdminDetailRow>
                <AdminDetailRow label="Email">
                  {registration.email}
                </AdminDetailRow>
                <AdminDetailRow label="Phone">
                  {registration.phone}
                </AdminDetailRow>
                <AdminDetailRow label="LinkedIn" className="sm:col-span-2">
                  {registration.linkedin ? (
                    <ExternalLink
                      href={registration.linkedin}
                      label={registration.linkedin}
                    />
                  ) : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>

            <AdminDetailSection title="Company">
              <AdminDetailGrid>
                <AdminDetailRow label="Name">
                  {registration.company_name}
                </AdminDetailRow>
                <AdminDetailRow label="Sector">
                  {registration.sector}
                </AdminDetailRow>
                <AdminDetailRow label="Company country">
                  {registration.company_country}
                </AdminDetailRow>
                <AdminDetailRow label="Consent">
                  {registration.consent ? "Yes" : "No"}
                </AdminDetailRow>
                <AdminDetailRow label="Website" className="sm:col-span-2">
                  {registration.website ? (
                    <ExternalLink
                      href={registration.website}
                      label={registration.website}
                    />
                  ) : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>

            <AdminDetailSection title="Note">
              <AdminDetailRow label="Pitch">{registration.pitch}</AdminDetailRow>
            </AdminDetailSection>
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <AdminInboxArchiveButton
        id={registration.id}
        inboxStatus={registration.inbox_status}
        updateAction={updateInterestRegistrationInboxStatus}
      />

      <Dialog open={editOpen} onOpenChange={handleEditOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
              aria-label={`Edit ${registration.full_name}`}
            />
          }
        >
          <PencilIcon />
        </DialogTrigger>
        <DialogContent className={EDIT_DIALOG_CONTENT_CLASS}>
          <DialogHeader>
            <DialogTitle>Edit registration</DialogTitle>
            <DialogDescription>
              Update the submitted interest details.
            </DialogDescription>
          </DialogHeader>

          <form
            id={editFormId}
            onSubmit={form.handleSubmit(onUpdate)}
            noValidate
          >
            <input type="hidden" {...form.register("id")} />
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.fullName)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-name-${registration.id}`}
                    hint={`2–${INTEREST_REGISTRATION_FULL_NAME_MAX} chars`}
                  >
                    Full name
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-name-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_FULL_NAME_MAX}
                    className="min-h-11"
                    placeholder="e.g. Ama Mensah"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                    {...form.register("fullName")}
                  />
                  <FormFieldError
                    message={form.formState.errors.fullName?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.email)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-email-${registration.id}`}
                    hint={`max ${INTEREST_REGISTRATION_EMAIL_MAX}`}
                  >
                    Email
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-email-${registration.id}`}
                    type="email"
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_EMAIL_MAX}
                    className="min-h-11"
                    placeholder="name@company.com"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                  <FormFieldError
                    message={form.formState.errors.email?.message}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.phone)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-phone-${registration.id}`}
                    hint={`7–${INTEREST_REGISTRATION_PHONE_MAX} · +()- spaces`}
                  >
                    Phone
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-phone-${registration.id}`}
                    type="tel"
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_PHONE_MAX}
                    className="min-h-11"
                    placeholder="+233 20 000 0000"
                    aria-invalid={Boolean(form.formState.errors.phone)}
                    {...form.register("phone")}
                  />
                  <FormFieldError
                    message={form.formState.errors.phone?.message}
                  />
                </Field>
                <Field
                  data-invalid={Boolean(form.formState.errors.companyName)}
                >
                  <AdminFormFieldLabel
                    htmlFor={`edit-company-${registration.id}`}
                    hint={`2–${INTEREST_REGISTRATION_COMPANY_MAX} chars`}
                  >
                    Company
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-company-${registration.id}`}
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
                    htmlFor={`edit-sector-${registration.id}`}
                    hint={`2–${INTEREST_REGISTRATION_SECTOR_MAX} chars`}
                  >
                    Sector
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-sector-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_SECTOR_MAX}
                    className="min-h-11"
                    placeholder="e.g. Fintech"
                    aria-invalid={Boolean(form.formState.errors.sector)}
                    {...form.register("sector")}
                  />
                  <FormFieldError
                    message={form.formState.errors.sector?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.country)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-country-${registration.id}`}
                    hint={`2–${INTEREST_REGISTRATION_COUNTRY_MAX} chars`}
                  >
                    Country
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-country-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_COUNTRY_MAX}
                    className="min-h-11"
                    placeholder="e.g. Ghana"
                    aria-invalid={Boolean(form.formState.errors.country)}
                    {...form.register("country")}
                  />
                  <FormFieldError
                    message={form.formState.errors.country?.message}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.founderRole)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-role-${registration.id}`}
                    hint={`max ${INTEREST_REGISTRATION_ROLE_MAX}`}
                  >
                    Role
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-role-${registration.id}`}
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
                <Field
                  data-invalid={Boolean(form.formState.errors.companyCountry)}
                >
                  <AdminFormFieldLabel
                    htmlFor={`edit-company-country-${registration.id}`}
                    hint={`2–${INTEREST_REGISTRATION_COUNTRY_MAX} chars`}
                  >
                    Company country
                  </AdminFormFieldLabel>
                  <Input
                    id={`edit-company-country-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_COUNTRY_MAX}
                    className="min-h-11"
                    placeholder="e.g. Ghana"
                    aria-invalid={Boolean(
                      form.formState.errors.companyCountry,
                    )}
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
                    htmlFor={`edit-linkedin-${registration.id}`}
                    hint={`Optional · http(s):// · max ${INTEREST_REGISTRATION_URL_MAX}`}
                  >
                    LinkedIn
                  </AdminFormFieldLabel>
                  <UrlInput
                    id={`edit-linkedin-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_URL_MAX}
                    className="min-h-11"
                    placeholder="linkedin.com/in/…"
                    aria-invalid={Boolean(form.formState.errors.linkedin)}
                    {...form.register("linkedin")}
                  />
                  <FormFieldError
                    message={form.formState.errors.linkedin?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.website)}>
                  <AdminFormFieldLabel
                    htmlFor={`edit-website-${registration.id}`}
                    hint={`Optional · http(s):// · max ${INTEREST_REGISTRATION_URL_MAX}`}
                  >
                    Website
                  </AdminFormFieldLabel>
                  <UrlInput
                    id={`edit-website-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_URL_MAX}
                    className="min-h-11"
                    placeholder="example.com"
                    aria-invalid={Boolean(form.formState.errors.website)}
                    {...form.register("website")}
                  />
                  <FormFieldError
                    message={form.formState.errors.website?.message}
                  />
                </Field>
              </div>
              <Field data-invalid={Boolean(form.formState.errors.pitch)}>
                <AdminFormFieldLabel
                  htmlFor={`edit-pitch-${registration.id}`}
                  hint={`Optional · ${INTEREST_REGISTRATION_PITCH_MIN}–${INTEREST_REGISTRATION_PITCH_MAX} if filled`}
                >
                  Note (optional)
                </AdminFormFieldLabel>
                <Textarea
                  id={`edit-pitch-${registration.id}`}
                  rows={5}
                  disabled={isUpdating}
                  maxLength={INTEREST_REGISTRATION_PITCH_MAX}
                  className="min-h-32"
                  placeholder="Optional note about the startup or interest…"
                  aria-invalid={Boolean(form.formState.errors.pitch)}
                  {...form.register("pitch")}
                />
                <FormFieldError
                  message={form.formState.errors.pitch?.message}
                />
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
              onClick={() => setEditOpen(false)}
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
        </DialogContent>
      </Dialog>

      <AdminRowDelete
        deleteAction={() =>
          deleteInterestRegistration({ id: registration.id })
        }
        fallbackError="The registration could not be deleted. Please try again."
        title="Delete registration?"
        description={
          <>
            This permanently deletes the interest registration from{" "}
            {registration.full_name} ({registration.email}). This cannot be
            undone.
          </>
        }
        confirmLabel="Delete"
        triggerLabel={`Delete ${registration.full_name}`}
      />
    </div>
  );
}
