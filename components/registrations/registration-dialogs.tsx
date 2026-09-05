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
import { AdminDetailRow } from "@/components/dashboard/admin-detail-row";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAdminDateTime } from "@/lib/admin-format";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import type { InterestRegistration } from "@/types/interest-registration";
import {
  INTEREST_REGISTRATION_COMPANY_MAX,
  INTEREST_REGISTRATION_COUNTRY_MAX,
  INTEREST_REGISTRATION_EMAIL_MAX,
  INTEREST_REGISTRATION_FULL_NAME_MAX,
  INTEREST_REGISTRATION_PHONE_MAX,
  INTEREST_REGISTRATION_PITCH_MAX,
  INTEREST_REGISTRATION_SECTOR_MAX,
  updateInterestRegistrationSchema,
  type UpdateInterestRegistrationInput,
} from "@/validations/interest-registration";

function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <FieldError>{message}</FieldError>;
}

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
    defaultValues: editDefaults,
  });

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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">
              {registration.full_name}
            </DialogTitle>
            <DialogDescription>Registration details</DialogDescription>
          </DialogHeader>
          <dl className="grid gap-3 text-sm">
            <AdminDetailRow label="Status">
              <InboxStatusBadge status={registration.inbox_status} />
            </AdminDetailRow>
            <AdminDetailRow label="Email">{registration.email}</AdminDetailRow>
            <AdminDetailRow label="Phone">{registration.phone}</AdminDetailRow>
            <AdminDetailRow label="Company">
              {registration.company_name}
            </AdminDetailRow>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminDetailRow label="Sector">
                {registration.sector}
              </AdminDetailRow>
              <AdminDetailRow label="Country">
                {registration.country}
              </AdminDetailRow>
            </div>
            <AdminDetailRow label="Pitch">{registration.pitch}</AdminDetailRow>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminDetailRow label="Consent">
                {registration.consent ? "Yes" : "No"}
              </AdminDetailRow>
              <AdminDetailRow label="Submitted">
                {formatAdminDateTime(registration.created_at)}
              </AdminDetailRow>
            </div>
          </dl>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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
                  <Label htmlFor={`edit-name-${registration.id}`}>
                    Full name
                  </Label>
                  <Input
                    id={`edit-name-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_FULL_NAME_MAX}
                    className="min-h-11"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                    {...form.register("fullName")}
                  />
                  <FormFieldError
                    message={form.formState.errors.fullName?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.email)}>
                  <Label htmlFor={`edit-email-${registration.id}`}>Email</Label>
                  <Input
                    id={`edit-email-${registration.id}`}
                    type="email"
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_EMAIL_MAX}
                    className="min-h-11"
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
                  <Label htmlFor={`edit-phone-${registration.id}`}>Phone</Label>
                  <Input
                    id={`edit-phone-${registration.id}`}
                    type="tel"
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_PHONE_MAX}
                    className="min-h-11"
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
                  <Label htmlFor={`edit-company-${registration.id}`}>
                    Company
                  </Label>
                  <Input
                    id={`edit-company-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_COMPANY_MAX}
                    className="min-h-11"
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
                  <Label htmlFor={`edit-sector-${registration.id}`}>
                    Sector
                  </Label>
                  <Input
                    id={`edit-sector-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_SECTOR_MAX}
                    className="min-h-11"
                    aria-invalid={Boolean(form.formState.errors.sector)}
                    {...form.register("sector")}
                  />
                  <FormFieldError
                    message={form.formState.errors.sector?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.country)}>
                  <Label htmlFor={`edit-country-${registration.id}`}>
                    Country
                  </Label>
                  <Input
                    id={`edit-country-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_COUNTRY_MAX}
                    className="min-h-11"
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
                  <Label htmlFor={`edit-role-${registration.id}`}>Role</Label>
                  <Input
                    id={`edit-role-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={80}
                    className="min-h-11"
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
                  <Label htmlFor={`edit-company-country-${registration.id}`}>
                    Company country
                  </Label>
                  <Input
                    id={`edit-company-country-${registration.id}`}
                    disabled={isUpdating}
                    maxLength={INTEREST_REGISTRATION_COUNTRY_MAX}
                    className="min-h-11"
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
                  <Label htmlFor={`edit-linkedin-${registration.id}`}>
                    LinkedIn
                  </Label>
                  <Input
                    id={`edit-linkedin-${registration.id}`}
                    type="url"
                    disabled={isUpdating}
                    maxLength={500}
                    className="min-h-11"
                    aria-invalid={Boolean(form.formState.errors.linkedin)}
                    {...form.register("linkedin")}
                  />
                  <FormFieldError
                    message={form.formState.errors.linkedin?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.website)}>
                  <Label htmlFor={`edit-website-${registration.id}`}>
                    Website
                  </Label>
                  <Input
                    id={`edit-website-${registration.id}`}
                    type="url"
                    disabled={isUpdating}
                    maxLength={500}
                    className="min-h-11"
                    aria-invalid={Boolean(form.formState.errors.website)}
                    {...form.register("website")}
                  />
                  <FormFieldError
                    message={form.formState.errors.website?.message}
                  />
                </Field>
              </div>
              <Field data-invalid={Boolean(form.formState.errors.pitch)}>
                <Label htmlFor={`edit-pitch-${registration.id}`}>
                  Note (optional)
                </Label>
                <Textarea
                  id={`edit-pitch-${registration.id}`}
                  rows={5}
                  disabled={isUpdating}
                  maxLength={INTEREST_REGISTRATION_PITCH_MAX}
                  className="min-h-32"
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
