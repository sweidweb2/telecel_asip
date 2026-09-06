"use client";

import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { EyeIcon, Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  deleteApplication,
  updateApplication,
  updateApplicationInboxStatus,
} from "@/actions/applications";
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
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import { formatAdminDateTime } from "@/lib/admin-format";
import type { Application } from "@/types/application";
import {
  APPLICATION_FIT_MAX,
  APPLICATION_FULL_NAME_MAX,
  APPLICATION_PROBLEM_MAX,
  APPLICATION_ROLE_MAX,
  APPLICATION_TRACTION_MAX,
  APPLICATION_URL_MAX,
  updateApplicationSchema,
  type UpdateApplicationInput,
} from "@/validations/application";

function FormFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <FieldError>{message}</FieldError>;
}

function toEditDefaults(application: Application): UpdateApplicationInput {
  return {
    id: application.id,
    fullName: application.full_name,
    founderRole: application.founder_role,
    email: application.email,
    phone: application.phone,
    country: application.country,
    linkedin: application.linkedin,
    companyName: application.company_name,
    website: application.website,
    companyCountry: application.company_country,
    sector: application.sector,
    problemProduct: application.problem_product,
    traction: application.traction,
    programmeFit: application.programme_fit,
    commsOptIn: application.comms_opt_in,
  };
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  const trimmed = href.trim();
  if (!trimmed) return null;
  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {label || trimmed}
    </a>
  );
}

export function ApplicationRowActions({
  application,
  viewOpen,
  onViewOpenChange,
}: {
  application: Application;
  viewOpen?: boolean;
  onViewOpenChange?: (open: boolean) => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isUpdating, startUpdate] = useTransition();
  const isControlled = onViewOpenChange !== undefined;
  const { onViewOpenChange: markReviewedOnOpen } = useMarkInboxReviewed({
    id: application.id,
    inboxStatus: application.inbox_status,
    updateAction: updateApplicationInboxStatus,
    isOpen: isControlled ? viewOpen : undefined,
  });

  const form = useForm<UpdateApplicationInput>({
    resolver: zodResolver(updateApplicationSchema),
    defaultValues: toEditDefaults(application),
  });

  function handleViewOpenChange(open: boolean) {
    onViewOpenChange?.(open);
    markReviewedOnOpen(open);
  }

  function handleEditOpen(next: boolean) {
    setEditOpen(next);
    if (next) form.reset(toEditDefaults(application));
  }

  function onUpdate(values: UpdateApplicationInput) {
    startUpdate(async () => {
      try {
        const result = await updateApplication(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setEditOpen(false);
        router.refresh();
      } catch {
        toast.error("The application could not be updated. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Dialog
        open={isControlled ? viewOpen : undefined}
        onOpenChange={handleViewOpenChange}
      >
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
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
              {formatAdminDateTime(application.created_at)}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid gap-4">
            <AdminDetailRow label="Status">
              <InboxStatusBadge status={application.inbox_status} />
            </AdminDetailRow>
            <AdminDetailRow label="Role">
              {application.founder_role}
            </AdminDetailRow>
            <AdminDetailRow label="Email">{application.email}</AdminDetailRow>
            <AdminDetailRow label="Phone">{application.phone}</AdminDetailRow>
            <AdminDetailRow label="Country">
              {application.country}
            </AdminDetailRow>
            <AdminDetailRow label="LinkedIn">
              <ExternalLink
                href={application.linkedin}
                label={application.linkedin}
              />
            </AdminDetailRow>
            <AdminDetailRow label="Startup">
              {application.company_name}
            </AdminDetailRow>
            <AdminDetailRow label="Website">
              <ExternalLink
                href={application.website}
                label={application.website}
              />
            </AdminDetailRow>
            <AdminDetailRow label="Company country">
              {application.company_country}
            </AdminDetailRow>
            <AdminDetailRow label="Sector">{application.sector}</AdminDetailRow>
            <AdminDetailRow label="Problem & product">
              {application.problem_product}
            </AdminDetailRow>
            <AdminDetailRow label="Traction">
              {application.traction}
            </AdminDetailRow>
            <AdminDetailRow label="Programme fit">
              {application.programme_fit}
            </AdminDetailRow>
            <AdminDetailRow label="Comms opt-in">
              {application.comms_opt_in ? "Yes" : "No"}
            </AdminDetailRow>
          </dl>
        </DialogContent>
      </Dialog>

      <AdminInboxArchiveButton
        id={application.id}
        inboxStatus={application.inbox_status}
        updateAction={updateApplicationInboxStatus}
      />

      <Dialog open={editOpen} onOpenChange={handleEditOpen}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={ADMIN_ICON_BUTTON_CLASS}
              aria-label={`Edit ${application.full_name}`}
            />
          }
        >
          <PencilIcon />
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit application</DialogTitle>
            <DialogDescription>
              Update the submitted application details.
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
                  <Label htmlFor={`edit-app-name-${application.id}`}>
                    Full name
                  </Label>
                  <Input
                    id={`edit-app-name-${application.id}`}
                    disabled={isUpdating}
                    maxLength={APPLICATION_FULL_NAME_MAX}
                    className="min-h-11"
                    placeholder="e.g. Ama Mensah"
                    aria-invalid={Boolean(form.formState.errors.fullName)}
                    {...form.register("fullName")}
                  />
                  <FormFieldError
                    message={form.formState.errors.fullName?.message}
                  />
                </Field>
                <Field
                  data-invalid={Boolean(form.formState.errors.founderRole)}
                >
                  <Label htmlFor={`edit-app-role-${application.id}`}>
                    Role
                  </Label>
                  <Input
                    id={`edit-app-role-${application.id}`}
                    disabled={isUpdating}
                    maxLength={APPLICATION_ROLE_MAX}
                    className="min-h-11"
                    placeholder="e.g. Founder / CEO"
                    aria-invalid={Boolean(form.formState.errors.founderRole)}
                    {...form.register("founderRole")}
                  />
                  <FormFieldError
                    message={form.formState.errors.founderRole?.message}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.email)}>
                  <Label htmlFor={`edit-app-email-${application.id}`}>
                    Email
                  </Label>
                  <Input
                    id={`edit-app-email-${application.id}`}
                    type="email"
                    disabled={isUpdating}
                    maxLength={254}
                    className="min-h-11"
                    placeholder="name@company.com"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                  <FormFieldError
                    message={form.formState.errors.email?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.phone)}>
                  <Label htmlFor={`edit-app-phone-${application.id}`}>
                    Phone
                  </Label>
                  <Input
                    id={`edit-app-phone-${application.id}`}
                    type="tel"
                    disabled={isUpdating}
                    maxLength={20}
                    className="min-h-11"
                    placeholder="+233 20 000 0000"
                    aria-invalid={Boolean(form.formState.errors.phone)}
                    {...form.register("phone")}
                  />
                  <FormFieldError
                    message={form.formState.errors.phone?.message}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(form.formState.errors.country)}>
                  <Label htmlFor={`edit-app-country-${application.id}`}>
                    Country
                  </Label>
                  <Input
                    id={`edit-app-country-${application.id}`}
                    disabled={isUpdating}
                    maxLength={80}
                    className="min-h-11"
                    placeholder="e.g. Ghana"
                    aria-invalid={Boolean(form.formState.errors.country)}
                    {...form.register("country")}
                  />
                  <FormFieldError
                    message={form.formState.errors.country?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.linkedin)}>
                  <Label htmlFor={`edit-app-linkedin-${application.id}`}>
                    LinkedIn
                  </Label>
                  <Input
                    id={`edit-app-linkedin-${application.id}`}
                    type="url"
                    disabled={isUpdating}
                    maxLength={APPLICATION_URL_MAX}
                    className="min-h-11"
                    placeholder="https://linkedin.com/in/…"
                    aria-invalid={Boolean(form.formState.errors.linkedin)}
                    {...form.register("linkedin")}
                  />
                  <FormFieldError
                    message={form.formState.errors.linkedin?.message}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  data-invalid={Boolean(form.formState.errors.companyName)}
                >
                  <Label htmlFor={`edit-app-company-${application.id}`}>
                    Startup
                  </Label>
                  <Input
                    id={`edit-app-company-${application.id}`}
                    disabled={isUpdating}
                    maxLength={120}
                    className="min-h-11"
                    placeholder="Startup name"
                    aria-invalid={Boolean(form.formState.errors.companyName)}
                    {...form.register("companyName")}
                  />
                  <FormFieldError
                    message={form.formState.errors.companyName?.message}
                  />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.website)}>
                  <Label htmlFor={`edit-app-website-${application.id}`}>
                    Website
                  </Label>
                  <Input
                    id={`edit-app-website-${application.id}`}
                    type="url"
                    disabled={isUpdating}
                    maxLength={APPLICATION_URL_MAX}
                    className="min-h-11"
                    placeholder="https://example.com"
                    aria-invalid={Boolean(form.formState.errors.website)}
                    {...form.register("website")}
                  />
                  <FormFieldError
                    message={form.formState.errors.website?.message}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  data-invalid={Boolean(form.formState.errors.companyCountry)}
                >
                  <Label
                    htmlFor={`edit-app-company-country-${application.id}`}
                  >
                    Company country
                  </Label>
                  <Input
                    id={`edit-app-company-country-${application.id}`}
                    disabled={isUpdating}
                    maxLength={80}
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
                <Field data-invalid={Boolean(form.formState.errors.sector)}>
                  <Label htmlFor={`edit-app-sector-${application.id}`}>
                    Sector
                  </Label>
                  <Input
                    id={`edit-app-sector-${application.id}`}
                    disabled={isUpdating}
                    maxLength={80}
                    className="min-h-11"
                    placeholder="e.g. Fintech"
                    aria-invalid={Boolean(form.formState.errors.sector)}
                    {...form.register("sector")}
                  />
                  <FormFieldError
                    message={form.formState.errors.sector?.message}
                  />
                </Field>
              </div>
              <Field
                data-invalid={Boolean(form.formState.errors.problemProduct)}
              >
                <Label htmlFor={`edit-app-problem-${application.id}`}>
                  Problem & product
                </Label>
                <Textarea
                  id={`edit-app-problem-${application.id}`}
                  rows={4}
                  disabled={isUpdating}
                  maxLength={APPLICATION_PROBLEM_MAX}
                  className="min-h-28"
                  placeholder="What problem they solve and what they built…"
                  aria-invalid={Boolean(form.formState.errors.problemProduct)}
                  {...form.register("problemProduct")}
                />
                <FormFieldError
                  message={form.formState.errors.problemProduct?.message}
                />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.traction)}>
                <Label htmlFor={`edit-app-traction-${application.id}`}>
                  Traction
                </Label>
                <Textarea
                  id={`edit-app-traction-${application.id}`}
                  rows={3}
                  disabled={isUpdating}
                  maxLength={APPLICATION_TRACTION_MAX}
                  className="min-h-24"
                  placeholder="Users, revenue, pilots, or other proof…"
                  aria-invalid={Boolean(form.formState.errors.traction)}
                  {...form.register("traction")}
                />
                <FormFieldError
                  message={form.formState.errors.traction?.message}
                />
              </Field>
              <Field
                data-invalid={Boolean(form.formState.errors.programmeFit)}
              >
                <Label htmlFor={`edit-app-fit-${application.id}`}>
                  Programme fit
                </Label>
                <Textarea
                  id={`edit-app-fit-${application.id}`}
                  rows={3}
                  disabled={isUpdating}
                  maxLength={APPLICATION_FIT_MAX}
                  className="min-h-24"
                  placeholder="Why ASIP is a fit for this founder…"
                  aria-invalid={Boolean(form.formState.errors.programmeFit)}
                  {...form.register("programmeFit")}
                />
                <FormFieldError
                  message={form.formState.errors.programmeFit?.message}
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
