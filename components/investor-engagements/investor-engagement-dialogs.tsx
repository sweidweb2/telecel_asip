"use client";

import { memo, useId, useTransition } from "react";
import {
  Controller,
  useForm,
  type Control,
  type Path,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  loadInvestorEngagement,
  updateInvestorEngagement,
  updateInvestorEngagementInboxStatus,
} from "@/actions/investor-engagements";
import {
  ADMIN_INBOX_EDIT_DIALOG_CLASS,
  ADMIN_INBOX_EDIT_HEADER_CLASS,
  ADMIN_INBOX_VIEW_DIALOG_CLASS,
  AdminDetailGrid,
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
  formatInvestorValues,
  InvestorCommsOptInField,
  InvestorContactEditFields,
  InvestorContactViewSections,
  InvestorContextViewSection,
  INVESTOR_ADMIN_LABELS,
  type InvestorContactEditValues,
} from "@/components/investor-inbox/investor-inbox-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  INVESTOR_ENGAGEMENT_INTENTS,
  INVESTOR_GEOGRAPHY_OPTIONS,
  INVESTOR_SECTOR_OPTIONS,
  INVESTOR_STAGES,
  INVESTOR_TICKET_SIZES,
  INVESTOR_TIMELINES,
} from "@/constants/investor-intake";
import { useEditorRecord } from "@/hooks/use-editor-record";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import { formatAdminDateTime } from "@/lib/admin-format";
import { isAdminFormSubmitDisabled } from "@/lib/admin/form-submit";
import type {
  InvestorEngagement,
  InvestorEngagementListItem,
} from "@/types/investor-engagement";
import {
  INVESTOR_ENGAGEMENT_MESSAGE_MAX,
  INVESTOR_ENGAGEMENT_MESSAGE_MIN,
  INVESTOR_ENGAGEMENT_REFERRED_BY_MAX,
  INVESTOR_ENGAGEMENT_THESIS_MAX,
  INVESTOR_ENGAGEMENT_THESIS_MIN,
  updateInvestorEngagementSchema,
  type UpdateInvestorEngagementInput,
} from "@/validations/investor-engagement";

function toEditDefaults(
  engagement: InvestorEngagement,
): UpdateInvestorEngagementInput {
  return {
    id: engagement.id,
    fullName: engagement.full_name,
    email: engagement.email,
    phone: engagement.phone ?? "",
    organization: engagement.organization,
    jobTitle: engagement.job_title ?? "",
    linkedin: engagement.linkedin ?? "",
    investorType: engagement.investor_type,
    stages: engagement.stages,
    ticketSize: engagement.ticket_size,
    sectors: engagement.sectors as UpdateInvestorEngagementInput["sectors"],
    geographies:
      engagement.geographies as UpdateInvestorEngagementInput["geographies"],
    engagementIntent: engagement.engagement_intent,
    thesis: engagement.thesis,
    timeline: engagement.timeline ?? undefined,
    referredBy: engagement.referred_by ?? "",
    message: engagement.message ?? "",
    commsOptIn: engagement.comms_opt_in,
  };
}

function AdminCheckboxGroup({
  legend,
  options,
  control,
  name,
  error,
  disabled,
}: {
  legend: string;
  options: { value: string; label: string }[];
  control: Control<UpdateInvestorEngagementInput>;
  name: Path<UpdateInvestorEngagementInput>;
  error?: string;
  disabled: boolean;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selected = (field.value as string[] | undefined) ?? [];
          return (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(next) => {
                        const isChecked = next === true;
                        field.onChange(
                          isChecked
                            ? [...selected, option.value]
                            : selected.filter((value) => value !== option.value),
                        );
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          );
        }}
      />
      <AdminFieldError message={error} />
    </fieldset>
  );
}

export const InvestorEngagementRowActions = memo(
  function InvestorEngagementRowActions({
    engagement,
    onView,
    onEdit,
    onDelete,
  }: {
    engagement: InvestorEngagementListItem;
    onView: (row: InvestorEngagementListItem) => void;
    onEdit: (row: InvestorEngagementListItem) => void;
    onDelete: (row: InvestorEngagementListItem) => void;
  }) {
    return (
      <AdminRowActionButtons
        viewLabel={`View ${engagement.full_name}`}
        editLabel={`Edit ${engagement.full_name}`}
        deleteLabel={`Delete ${engagement.full_name}`}
        onView={() => onView(engagement)}
        onEdit={() => onEdit(engagement)}
        onDelete={() => onDelete(engagement)}
        extra={
          <AdminInboxArchiveButton
            id={engagement.id}
            inboxStatus={engagement.inbox_status}
            updateAction={updateInvestorEngagementInboxStatus}
          />
        }
      />
    );
  },
);

export function InvestorEngagementViewDialog({
  open,
  engagementId,
  inboxStatus,
  onOpenChange,
}: {
  open: boolean;
  engagementId: string | undefined;
  inboxStatus: InvestorEngagement["inbox_status"] | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: engagementId,
    load: loadInvestorEngagement,
    missingMessage: "Investor engagement not found.",
  });
  useMarkInboxReviewed({
    id: engagementId ?? "",
    inboxStatus: inboxStatus ?? "reviewed",
    updateAction: updateInvestorEngagementInboxStatus,
    isOpen: open && Boolean(engagementId),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
              {record?.full_name ?? "Investor engagement"}
            </DialogTitle>
            {record ? <InboxStatusBadge status={record.inbox_status} /> : null}
          </div>
          <DialogDescription>
            {record
              ? `Investor engagement · submitted ${formatAdminDateTime(record.created_at)}`
              : "Investor engagement details"}
          </DialogDescription>
        </DialogHeader>

        {record ? (
          <div className="grid min-w-0 gap-6">
            <InvestorContactViewSections record={record} />
            <AdminDetailSection title="Focus">
              <AdminDetailGrid>
                <AdminDetailRow label="Stages">
                  {formatInvestorValues(
                    record.stages,
                    INVESTOR_ADMIN_LABELS.stageLabels,
                  )}
                </AdminDetailRow>
                <AdminDetailRow label="Ticket size">
                  {INVESTOR_ADMIN_LABELS.ticketLabels[record.ticket_size] ??
                    record.ticket_size}
                </AdminDetailRow>
                <AdminDetailRow label="Sectors" className="sm:col-span-2">
                  {formatInvestorValues(record.sectors)}
                </AdminDetailRow>
                <AdminDetailRow label="Geographies" className="sm:col-span-2">
                  {formatInvestorValues(record.geographies)}
                </AdminDetailRow>
                <AdminDetailRow label="Intent">
                  {INVESTOR_ADMIN_LABELS.intentLabels[
                    record.engagement_intent
                  ] ?? record.engagement_intent}
                </AdminDetailRow>
                <AdminDetailRow label="Timeline">
                  {record.timeline
                    ? (INVESTOR_ADMIN_LABELS.timelineLabels[record.timeline] ??
                      record.timeline)
                    : null}
                </AdminDetailRow>
              </AdminDetailGrid>
            </AdminDetailSection>
            <AdminDetailSection title="Thesis">
              <AdminDetailRow label="Thesis">{record.thesis}</AdminDetailRow>
              <AdminDetailRow label="Referral">{record.referred_by}</AdminDetailRow>
              <AdminDetailRow label="Message">{record.message}</AdminDetailRow>
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

function InvestorEngagementEditForm({
  engagement,
  onClose,
}: {
  engagement: InvestorEngagement;
  onClose: () => void;
}) {
  const editFormId = useId();
  const router = useRouter();
  const [isUpdating, startUpdate] = useTransition();
  const form = useForm<UpdateInvestorEngagementInput>({
    resolver: zodResolver(
      updateInvestorEngagementSchema,
    ) as Resolver<UpdateInvestorEngagementInput>,
    mode: "onChange",
    defaultValues: toEditDefaults(engagement),
  });
  const { control } = form;
  const { errors, isDirty } = form.formState;

  function onUpdate(values: UpdateInvestorEngagementInput) {
    startUpdate(async () => {
      try {
        const result = await updateInvestorEngagement(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        onClose();
        router.refresh();
      } catch {
        toast.error(
          "The investor engagement could not be updated. Please try again.",
        );
      }
    });
  }

  const contactForm = form as unknown as UseFormReturn<InvestorContactEditValues>;

  return (
    <>
      <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
        <DialogTitle>Edit investor engagement</DialogTitle>
        <DialogDescription>
          Update the submitted investor engagement details.
        </DialogDescription>
      </DialogHeader>

      <form id={editFormId} onSubmit={form.handleSubmit(onUpdate)} noValidate>
        <input type="hidden" {...form.register("id")} />
        <FieldGroup>
          <InvestorContactEditFields
            form={contactForm}
            idPrefix="edit-investor-engagement"
            disabled={isUpdating}
          />
          <AdminCheckboxGroup
            legend="Stages of interest"
            options={INVESTOR_STAGES.map((value) => ({
              value,
              label: INVESTOR_ADMIN_LABELS.stageLabels[value] ?? value,
            }))}
            control={control}
            name="stages"
            error={errors.stages?.message}
            disabled={isUpdating}
          />
          <Field data-invalid={Boolean(errors.ticketSize)}>
            <AdminFormFieldLabel htmlFor="edit-investor-engagement-ticket">
              Ticket size
            </AdminFormFieldLabel>
            <Controller
              control={control}
              name="ticketSize"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value);
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger
                    id="edit-investor-engagement-ticket"
                    className="min-h-11 w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTOR_TICKET_SIZES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {INVESTOR_ADMIN_LABELS.ticketLabels[value] ?? value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <AdminFieldError message={errors.ticketSize?.message} />
          </Field>
          <AdminCheckboxGroup
            legend="Sectors"
            options={INVESTOR_SECTOR_OPTIONS.map((value) => ({
              value,
              label: value,
            }))}
            control={control}
            name="sectors"
            error={errors.sectors?.message}
            disabled={isUpdating}
          />
          <AdminCheckboxGroup
            legend="Geographies"
            options={INVESTOR_GEOGRAPHY_OPTIONS.map((value) => ({
              value,
              label: value,
            }))}
            control={control}
            name="geographies"
            error={errors.geographies?.message}
            disabled={isUpdating}
          />
          <Field data-invalid={Boolean(errors.engagementIntent)}>
            <AdminFormFieldLabel htmlFor="edit-investor-engagement-intent">
              Engagement intent
            </AdminFormFieldLabel>
            <Controller
              control={control}
              name="engagementIntent"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value);
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger
                    id="edit-investor-engagement-intent"
                    className="min-h-11 w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTOR_ENGAGEMENT_INTENTS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {INVESTOR_ADMIN_LABELS.intentLabels[value] ?? value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <AdminFieldError message={errors.engagementIntent?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.thesis)}>
            <AdminFormFieldLabel
              htmlFor="edit-investor-engagement-thesis"
              hint={`${INVESTOR_ENGAGEMENT_THESIS_MIN}–${INVESTOR_ENGAGEMENT_THESIS_MAX}`}
            >
              Thesis
            </AdminFormFieldLabel>
            <Textarea
              id="edit-investor-engagement-thesis"
              rows={5}
              disabled={isUpdating}
              maxLength={INVESTOR_ENGAGEMENT_THESIS_MAX}
              className="min-h-32"
              aria-invalid={Boolean(errors.thesis)}
              {...form.register("thesis")}
            />
            <AdminFieldError message={errors.thesis?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.timeline)}>
            <AdminFormFieldLabel htmlFor="edit-investor-engagement-timeline">
              Timeline (optional)
            </AdminFormFieldLabel>
            <Controller
              control={control}
              name="timeline"
              render={({ field }) => (
                <Select
                  value={field.value ?? "__none__"}
                  onValueChange={(value) => {
                    field.onChange(
                      !value || value === "__none__" ? undefined : value,
                    );
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger
                    id="edit-investor-engagement-timeline"
                    className="min-h-11 w-full"
                  >
                    <SelectValue placeholder="Not set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not set</SelectItem>
                    {INVESTOR_TIMELINES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {INVESTOR_ADMIN_LABELS.timelineLabels[value] ?? value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <AdminFieldError message={errors.timeline?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.referredBy)}>
            <AdminFormFieldLabel
              htmlFor="edit-investor-engagement-referred"
              hint={`Optional · max ${INVESTOR_ENGAGEMENT_REFERRED_BY_MAX}`}
            >
              Referral (optional)
            </AdminFormFieldLabel>
            <Input
              id="edit-investor-engagement-referred"
              disabled={isUpdating}
              maxLength={INVESTOR_ENGAGEMENT_REFERRED_BY_MAX}
              aria-invalid={Boolean(errors.referredBy)}
              {...form.register("referredBy")}
            />
            <AdminFieldError message={errors.referredBy?.message} />
          </Field>
          <Field data-invalid={Boolean(errors.message)}>
            <AdminFormFieldLabel
              htmlFor="edit-investor-engagement-message"
              hint={`Optional · ${INVESTOR_ENGAGEMENT_MESSAGE_MIN}–${INVESTOR_ENGAGEMENT_MESSAGE_MAX} if filled`}
            >
              Message (optional)
            </AdminFormFieldLabel>
            <Textarea
              id="edit-investor-engagement-message"
              rows={4}
              disabled={isUpdating}
              maxLength={INVESTOR_ENGAGEMENT_MESSAGE_MAX}
              className="min-h-28"
              aria-invalid={Boolean(errors.message)}
              {...form.register("message")}
            />
            <AdminFieldError message={errors.message?.message} />
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

export function InvestorEngagementEditDialog({
  open,
  engagementId,
  onOpenChange,
}: {
  open: boolean;
  engagementId: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id: engagementId,
    load: loadInvestorEngagement,
    missingMessage: "Investor engagement not found.",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_EDIT_DIALOG_CLASS}>
        {record ? (
          <InvestorEngagementEditForm
            engagement={record}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <DialogHeader className={ADMIN_INBOX_EDIT_HEADER_CLASS}>
              <DialogTitle>Edit investor engagement</DialogTitle>
              <DialogDescription>
                Update the submitted investor engagement details.
              </DialogDescription>
            </DialogHeader>
            {isLoading ? <InboxDialogLoading /> : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
