"use client";

import { useId, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { loadApplication, updateApplication } from "@/actions/applications";
import {
  ADMIN_INBOX_EDIT_DIALOG_CLASS,
  ADMIN_INBOX_EDIT_HEADER_CLASS,
} from "@/components/dashboard/admin-detail-row";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { InboxDialogLoading } from "@/components/dashboard/inbox-dialog-loading";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import { useEditorRecord } from "@/hooks/use-editor-record";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import type { Application } from "@/types/application";
import {
  APPLICATION_COMPANY_MAX,
  APPLICATION_COUNTRY_MAX,
  APPLICATION_EMAIL_MAX,
  APPLICATION_FIT_MAX,
  APPLICATION_FIT_MIN,
  APPLICATION_FULL_NAME_MAX,
  APPLICATION_PHONE_MAX,
  APPLICATION_PROBLEM_MAX,
  APPLICATION_PROBLEM_MIN,
  APPLICATION_ROLE_MAX,
  APPLICATION_SECTOR_MAX,
  APPLICATION_TRACTION_MAX,
  APPLICATION_TRACTION_MIN,
  APPLICATION_URL_MAX,
  toUpdateApplicationInput,
  updateApplicationSchema,
  type UpdateApplicationInput,
} from "@/validations/application";

function ApplicationEditForm({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [isUpdating, startUpdate] = useTransition();
  const form = useForm<UpdateApplicationInput>({
    resolver: zodResolver(updateApplicationSchema),
    mode: "onChange",
    defaultValues: toUpdateApplicationInput(application),
  });
  const { errors, isDirty } = form.formState;

  function onUpdate(values: UpdateApplicationInput) {
    startUpdate(async () => {
      try {
        const result = await updateApplication(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onClose();
        router.refresh();
      } catch {
        toast.error("The application could not be updated. Please try again.");
      }
    });
  }

  return (
    <>
      <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
        <DialogTitle>Edit application</DialogTitle>
        <DialogDescription>
          Update the submitted application details.
        </DialogDescription>
      </DialogHeader>

      <form
        id={editFormId}
        onSubmit={form.handleSubmit(onUpdate)}
        noValidate
        className="min-w-0"
      >
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.fullName)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-name"
                hint={`2–${APPLICATION_FULL_NAME_MAX} chars`}
              >
                Full name
              </AdminFormFieldLabel>
              <Input
                id="edit-app-name"
                disabled={isUpdating}
                maxLength={APPLICATION_FULL_NAME_MAX}
                className="min-h-11"
                placeholder="e.g. Ama Mensah"
                aria-invalid={Boolean(errors.fullName)}
                {...form.register("fullName")}
              />
              <AdminFieldError message={errors.fullName?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.founderRole)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-role"
                hint={`2–${APPLICATION_ROLE_MAX} chars`}
              >
                Role
              </AdminFormFieldLabel>
              <Input
                id="edit-app-role"
                disabled={isUpdating}
                maxLength={APPLICATION_ROLE_MAX}
                className="min-h-11"
                placeholder="e.g. Founder / CEO"
                aria-invalid={Boolean(errors.founderRole)}
                {...form.register("founderRole")}
              />
              <AdminFieldError message={errors.founderRole?.message} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.email)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-email"
                hint={`max ${APPLICATION_EMAIL_MAX}`}
              >
                Email
              </AdminFormFieldLabel>
              <Input
                id="edit-app-email"
                type="email"
                disabled={isUpdating}
                maxLength={APPLICATION_EMAIL_MAX}
                className="min-h-11"
                placeholder="name@company.com"
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              <AdminFieldError message={errors.email?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.phone)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-phone"
                hint={`7–${APPLICATION_PHONE_MAX} · +()- spaces`}
              >
                Phone
              </AdminFormFieldLabel>
              <Input
                id="edit-app-phone"
                type="tel"
                disabled={isUpdating}
                maxLength={APPLICATION_PHONE_MAX}
                className="min-h-11"
                placeholder="+233 20 000 0000"
                aria-invalid={Boolean(errors.phone)}
                {...form.register("phone")}
              />
              <AdminFieldError message={errors.phone?.message} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.country)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-country"
                hint={`2–${APPLICATION_COUNTRY_MAX} chars`}
              >
                Country
              </AdminFormFieldLabel>
              <Input
                id="edit-app-country"
                disabled={isUpdating}
                maxLength={APPLICATION_COUNTRY_MAX}
                className="min-h-11"
                placeholder="e.g. Ghana"
                aria-invalid={Boolean(errors.country)}
                {...form.register("country")}
              />
              <AdminFieldError message={errors.country?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.linkedin)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-linkedin"
                hint={`Optional · http(s):// · max ${APPLICATION_URL_MAX}`}
              >
                LinkedIn
              </AdminFormFieldLabel>
              <UrlInput
                id="edit-app-linkedin"
                disabled={isUpdating}
                maxLength={APPLICATION_URL_MAX}
                className="min-h-11"
                placeholder="linkedin.com/in/…"
                aria-invalid={Boolean(errors.linkedin)}
                {...form.register("linkedin")}
              />
              <AdminFieldError message={errors.linkedin?.message} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.companyName)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-company"
                hint={`2–${APPLICATION_COMPANY_MAX} chars`}
              >
                Startup
              </AdminFormFieldLabel>
              <Input
                id="edit-app-company"
                disabled={isUpdating}
                maxLength={APPLICATION_COMPANY_MAX}
                className="min-h-11"
                placeholder="Startup name"
                aria-invalid={Boolean(errors.companyName)}
                {...form.register("companyName")}
              />
              <AdminFieldError message={errors.companyName?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.website)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-website"
                hint={`Optional · http(s):// · max ${APPLICATION_URL_MAX}`}
              >
                Website
              </AdminFormFieldLabel>
              <UrlInput
                id="edit-app-website"
                disabled={isUpdating}
                maxLength={APPLICATION_URL_MAX}
                className="min-h-11"
                placeholder="example.com"
                aria-invalid={Boolean(errors.website)}
                {...form.register("website")}
              />
              <AdminFieldError message={errors.website?.message} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.companyCountry)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-company-country"
                hint={`2–${APPLICATION_COUNTRY_MAX} chars`}
              >
                Company country
              </AdminFormFieldLabel>
              <Input
                id="edit-app-company-country"
                disabled={isUpdating}
                maxLength={APPLICATION_COUNTRY_MAX}
                className="min-h-11"
                placeholder="e.g. Ghana"
                aria-invalid={Boolean(errors.companyCountry)}
                {...form.register("companyCountry")}
              />
              <AdminFieldError message={errors.companyCountry?.message} />
            </Field>
            <Field data-invalid={Boolean(errors.sector)}>
              <AdminFormFieldLabel
                htmlFor="edit-app-sector"
                hint={`2–${APPLICATION_SECTOR_MAX} chars`}
              >
                Sector
              </AdminFormFieldLabel>
              <Input
                id="edit-app-sector"
                disabled={isUpdating}
                maxLength={APPLICATION_SECTOR_MAX}
                className="min-h-11"
                placeholder="e.g. Fintech"
                aria-invalid={Boolean(errors.sector)}
                {...form.register("sector")}
              />
              <AdminFieldError message={errors.sector?.message} />
            </Field>
          </div>
          <Field data-invalid={Boolean(errors.problemProduct)}>
            <AdminFormFieldLabel
              htmlFor="edit-app-problem"
              hint={`${APPLICATION_PROBLEM_MIN}–${APPLICATION_PROBLEM_MAX} chars`}
            >
              Problem & product
            </AdminFormFieldLabel>
            <Textarea
              id="edit-app-problem"
              rows={4}
              disabled={isUpdating}
              maxLength={APPLICATION_PROBLEM_MAX}
              className="min-h-28"
              placeholder="What problem they solve and what they built…"
              aria-invalid={Boolean(errors.problemProduct)}
              {...form.register("problemProduct")}
            />
            <AdminFieldError message={errors.problemProduct?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.traction)}>
            <AdminFormFieldLabel
              htmlFor="edit-app-traction"
              hint={`${APPLICATION_TRACTION_MIN}–${APPLICATION_TRACTION_MAX} chars`}
            >
              Traction
            </AdminFormFieldLabel>
            <Textarea
              id="edit-app-traction"
              rows={3}
              disabled={isUpdating}
              maxLength={APPLICATION_TRACTION_MAX}
              className="min-h-24"
              placeholder="Users, revenue, pilots, or other proof…"
              aria-invalid={Boolean(errors.traction)}
              {...form.register("traction")}
            />
            <AdminFieldError message={errors.traction?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.programmeFit)}>
            <AdminFormFieldLabel
              htmlFor="edit-app-fit"
              hint={`${APPLICATION_FIT_MIN}–${APPLICATION_FIT_MAX} chars`}
            >
              Program fit
            </AdminFormFieldLabel>
            <Textarea
              id="edit-app-fit"
              rows={3}
              disabled={isUpdating}
              maxLength={APPLICATION_FIT_MAX}
              className="min-h-24"
              placeholder="Why ASIP is a fit for this founder…"
              aria-invalid={Boolean(errors.programmeFit)}
              {...form.register("programmeFit")}
            />
            <AdminFieldError message={errors.programmeFit?.message} />
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

export function ApplicationEditDialog({
  open,
  applicationId,
  onOpenChange,
}: {
  open: boolean;
  applicationId: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: applicationId,
    load: loadApplication,
    missingMessage: "Application not found.",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_EDIT_DIALOG_CLASS}>
        {record ? (
          <ApplicationEditForm
            application={record}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
              <DialogTitle>Edit application</DialogTitle>
              <DialogDescription>
                Update the submitted application details.
              </DialogDescription>
            </DialogHeader>
            {isLoading ? <InboxDialogLoading /> : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
