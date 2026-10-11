"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRouter } from "nextjs-toploader/app";
import {
  ImageIcon,
  Loader2Icon,
  TriangleAlertIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { UPLOAD_MAX_BYTES } from "@/constants/upload";

import {
  createPartner,
  deletePartner,
  removePartnerLogo,
  updatePartner,
  uploadPartnerLogo,
} from "@/actions/partners";
import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import {
  CmsEditorFrame,
  CmsEditorSaveActions,
} from "@/components/dashboard/cms-editor-frame";
import { AdminImageProcessingBanner } from "@/components/dashboard/admin-image-processing-banner";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { PartnerContributionInput } from "@/components/partners/partner-contribution-input";
import { PartnerSortOrderMap } from "@/components/partners/partner-sort-order-map";
import {
  applyClearFormValues,
  applyDummyFormValues,
  dummyPartnerValues,
} from "@/lib/admin/dummy-form-values";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UrlInput } from "@/components/ui/url-input";
import { PARTNER_EDITOR_HELP } from "@/constants/partner-editor-help";
import { PARTNER_TYPE_LABELS } from "@/constants/partner-types";
import { partnerDetailPath, ROUTES } from "@/constants/routes";
import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";
import type { PartnerListItem, PartnerSortOrderOccupant } from "@/types/partner";
import {
  createPartnerSchema,
  PARTNER_CONTRIBUTION_MAX,
  PARTNER_LINK_MAX,
  PARTNER_NAME_MAX,
  PARTNER_ORG_MAX,
  PARTNER_SORT_ORDER_MAX,
  PARTNER_SORT_ORDER_MIN,
  PARTNER_TYPES,
  type CreatePartnerInput,
  type PartnerFormValues,
} from "@/validations/partner";
import { StepperContent } from "@/components/ui/stepper";

const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const LOGO_MAX_BYTES = UPLOAD_MAX_BYTES;

const PARTNER_EDITOR_STEPS = [
  {
    id: "main",
    title: "Main",
    description: "Details & logo",
    fields: ["name", "org", "type", "sortOrder"],
  },
  {
    id: "profile",
    title: "Profile",
    description: "Link & contribution",
    fields: ["link", "contribution"],
  },
  {
    id: "settings",
    title: "Settings",
    description: "Visibility & permission",
    fields: ["isActive", "logoPermission"],
  },
];

function defaultsFor(partner?: PartnerListItem): PartnerFormValues {
  return {
    name: partner?.name ?? "",
    org: partner?.org ?? "",
    type: partner?.type ?? "corporate",
    contribution: partner?.contribution ?? "",
    isActive: partner?.is_active ?? true,
    logoPermission: partner?.logo_permission ?? false,
    link: partner?.link ?? "",
    sortOrder: partner?.sort_order ?? PARTNER_SORT_ORDER_MIN,
  };
}

type PartnerEditorFormProps = {
  mode: "create" | "edit";
  partner?: PartnerListItem;
  heading: string;
  /** All partners' orders for the step-1 map + displacement preview. */
  orderSlots?: PartnerSortOrderOccupant[];
};

export function PartnerEditorForm({
  mode,
  partner,
  orderSlots = [],
}: PartnerEditorFormProps) {
  const formId = useId();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useCmsEditorForm<PartnerFormValues, CreatePartnerInput>({
    mode,
    schema: createPartnerSchema,
    defaultValues: defaultsFor(partner),
    recordId: partner?.id,
    listPath: ROUTES.partners,
    detailPath: partnerDetailPath,
    create: createPartner,
    update: updatePartner,
    remove: deletePartner,
    saveError: "The partner could not be saved. Please try again.",
    deleteError: "The partner could not be deleted. Please try again.",
    steps: PARTNER_EDITOR_STEPS,
  });
  const { form, isPending, errors, step, setStep } = editor;
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storedLogoUrl, setStoredLogoUrl] = useState(partner?.logo_url ?? null);

  const logoPermission = useWatch({
    control: form.control,
    name: "logoPermission",
  });
  const sortOrderValue = useWatch({
    control: form.control,
    name: "sortOrder",
  });
  const selectedSortOrder = Number(sortOrderValue ?? 0);

  function replacePendingLogo(file: File | null) {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPendingFile(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Logo must be under 10 MB.");
      return;
    }
    replacePendingLogo(file);
  }

  function handleRemoveStoredLogo() {
    if (mode !== "edit" || !partner || !storedLogoUrl) return;

    editor.run(async () => {
      const result = await removePartnerLogo(partner.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      setStoredLogoUrl(null);
      setRemoveOpen(false);
      toast.success(result.message);
      router.refresh();
    });
  }

  async function uploadPendingLogo(partnerId: string): Promise<boolean> {
    if (!pendingFile) return true;
    const formData = new FormData();
    formData.append("file", pendingFile);
    setIsProcessingImage(true);
    const uploadToast = toast.loading("Processing image…");
    try {
      const result = await uploadPartnerLogo(partnerId, formData);
      if (result.status === "error") {
        toast.error(result.message, { id: uploadToast });
        return false;
      }
      toast.dismiss(uploadToast);
      replacePendingLogo(null);
      return true;
    } catch {
      toast.error(
        "The logo could not be uploaded. Check that it is under 10 MB and try again.",
        { id: uploadToast },
      );
      return false;
    } finally {
      setIsProcessingImage(false);
    }
  }

  function onSubmit(values: CreatePartnerInput) {
    editor.run(async () => {
      const result =
        mode === "create"
          ? await createPartner(values)
          : await updatePartner({ ...values, id: partner!.id });

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      const logoUploaded = result.id
        ? await uploadPendingLogo(result.id)
        : true;

      if (logoUploaded) {
        toast.success(result.message);
      } else {
        toast.error(
          mode === "create"
            ? "Partner created, but the logo could not be uploaded. Add it from this page."
            : "Partner saved, but the logo could not be uploaded. Try again.",
        );
      }

      if (mode === "create" && result.id) {
        router.push(partnerDetailPath(result.id));
      } else if (mode === "edit") {
        // Mark current field values as the new baseline so Save disables again.
        form.reset(form.getValues());
      }
      router.refresh();
    });
  }

  const displayLogo = previewUrl ?? storedLogoUrl;
  const pendingLabel = isProcessingImage
    ? "Processing image…"
    : mode === "create"
      ? "Creating…"
      : "Saving…";

  function fillDummy() {
    applyDummyFormValues(form, dummyPartnerValues());
  }

  function clearForm() {
    applyClearFormValues(form, defaultsFor());
    replacePendingLogo(null);
  }

  return (
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={form.handleSubmit(onSubmit, editor.onInvalid)}
      steps={PARTNER_EDITOR_STEPS}
      step={step}
      onStepChange={setStep}
      formId={formId}
      formClassName=""
      stepperClassName="flex flex-col gap-6"
      navClassName=""
      panelClassName="w-full"
      onDummy={fillDummy}
      onClear={clearForm}
      actions={
        <CmsEditorSaveActions
          mode={mode}
          isPending={isPending}
          disabled={editor.submitDisabled(Boolean(pendingFile))}
          createLabel="Create partner"
          pendingLabel={pendingLabel}
          onDelete={() => editor.setDeleteOpen(true)}
        />
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete partner?",
        description: partner
          ? `This permanently deletes ${partner.name} and removes the stored logo from Storage. This cannot be undone.`
          : "This permanently deletes the partner. This cannot be undone.",
        confirmLabel: "Delete partner",
        onConfirm: editor.onDelete,
      }}
    >
            <StepperContent value="main" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start lg:gap-8">
                <AdminFormSection
                  title={PARTNER_EDITOR_HELP.identity.title}
                  description={PARTNER_EDITOR_HELP.identity.intro}
                  help={PARTNER_EDITOR_HELP.identity}
                  contentClassName="grid gap-4"
                >
                  <div className={ADMIN_FORM_PAIR_ROW}>
                    <Field
                      className={ADMIN_FORM_PAIR_FIELD}
                      data-invalid={Boolean(errors.name)}
                    >
                      <AdminFormFieldLabel
                        htmlFor={`${formId}-name`}
                        hint={`Required · 2–${PARTNER_NAME_MAX} chars`}
                      >
                        Name
                      </AdminFormFieldLabel>
                      <Input
                        id={`${formId}-name`}
                        className="min-h-11"
                        disabled={isPending}
                        required
                        maxLength={PARTNER_NAME_MAX}
                        placeholder="Person or partner name"
                        aria-invalid={Boolean(errors.name)}
                        {...form.register("name")}
                      />
                      {errors.name ? (
                        <FieldError>{errors.name.message}</FieldError>
                      ) : null}
                    </Field>

                    <Field
                      className={ADMIN_FORM_PAIR_FIELD}
                      data-invalid={Boolean(errors.org)}
                    >
                      <AdminFormFieldLabel
                        htmlFor={`${formId}-org`}
                        hint={`Optional · 2–${PARTNER_ORG_MAX} chars`}
                      >
                        Organisation
                      </AdminFormFieldLabel>
                      <Input
                        id={`${formId}-org`}
                        className="min-h-11"
                        disabled={isPending}
                        maxLength={PARTNER_ORG_MAX}
                        placeholder="Leave empty for solo mentors"
                        aria-invalid={Boolean(errors.org)}
                        {...form.register("org")}
                      />
                      {errors.org ? (
                        <FieldError>{errors.org.message}</FieldError>
                      ) : null}
                    </Field>
                  </div>

                  <div className={ADMIN_FORM_PAIR_ROW}>
                    <Field
                      className={ADMIN_FORM_PAIR_FIELD}
                      data-invalid={Boolean(errors.type)}
                    >
                      <AdminFormFieldLabel
                        htmlFor={`${formId}-type`}
                        hint="Required"
                      >
                        Type
                      </AdminFormFieldLabel>
                      <Controller
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              if (value) field.onChange(value);
                            }}
                            disabled={isPending}
                          >
                            <SelectTrigger
                              id={`${formId}-type`}
                              className="min-h-11 w-full"
                            >
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                              {PARTNER_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {PARTNER_TYPE_LABELS[type]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.type ? (
                        <FieldError>{errors.type.message}</FieldError>
                      ) : null}
                    </Field>

                    <Field
                      className={ADMIN_FORM_PAIR_FIELD}
                      data-invalid={Boolean(errors.sortOrder)}
                    >
                      <AdminFormFieldLabel
                        htmlFor={`${formId}-sort`}
                        hint={`Required · ${PARTNER_SORT_ORDER_MIN}–${PARTNER_SORT_ORDER_MAX} · lowest first`}
                      >
                        Display order
                      </AdminFormFieldLabel>
                      <Input
                        id={`${formId}-sort`}
                        type="number"
                        min={PARTNER_SORT_ORDER_MIN}
                        max={PARTNER_SORT_ORDER_MAX}
                        step={1}
                        className="min-h-11"
                        disabled={isPending}
                        placeholder="e.g. 10"
                        aria-invalid={Boolean(errors.sortOrder)}
                        {...form.register("sortOrder")}
                      />
                      {errors.sortOrder ? (
                        <FieldError>{errors.sortOrder.message}</FieldError>
                      ) : null}
                    </Field>
                  </div>

                  <PartnerSortOrderMap
                    partners={orderSlots}
                    currentPartnerId={partner?.id}
                    value={
                      Number.isFinite(selectedSortOrder)
                        ? selectedSortOrder
                        : 0
                    }
                    disabled={isPending}
                    onChange={(order) => {
                      form.setValue("sortOrder", order, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </AdminFormSection>

                <AdminFormSection
                  title={PARTNER_EDITOR_HELP.logo.title}
                  description={PARTNER_EDITOR_HELP.logo.intro}
                  help={PARTNER_EDITOR_HELP.logo}
                >
                  <Field>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <Label>Logo</Label>
                      <span className="text-[0.6875rem] leading-4 text-muted-foreground">
                        Optional · JPEG/PNG/WebP/GIF · max 10 MB
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative size-20 shrink-0">
                        <div className="flex size-full items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                          {displayLogo ? (
                            previewUrl ? (
                              // Local blob preview — no optimization possible.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={previewUrl}
                                alt="Selected logo preview"
                                className="size-full object-contain"
                              />
                            ) : (
                              <Image
                                src={displayLogo}
                                alt={`${partner?.name ?? "Partner"} logo`}
                                width={80}
                                height={80}
                                sizes="80px"
                                className="size-full object-contain"
                              />
                            )
                          ) : (
                            <ImageIcon className="size-6 text-muted-foreground" />
                          )}
                        </div>
                        {pendingFile ? (
                          <AdminClearIconButton
                            label="Clear logo selection"
                            disabled={isPending}
                            className="-top-1 -right-1"
                            onClick={() => replacePendingLogo(null)}
                          />
                        ) : storedLogoUrl ? (
                          <AdminClearIconButton
                            label="Remove logo"
                            disabled={isPending}
                            className="-top-1 -right-1"
                            onClick={() => setRemoveOpen(true)}
                          />
                        ) : null}
                      </div>

                      <div className="flex min-w-0 flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={LOGO_ACCEPT}
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-11 w-fit sm:min-h-8"
                          disabled={isPending}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadIcon />
                          {displayLogo ? "Replace" : "Upload"}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPEG, PNG, WebP, or GIF under 10 MB. Resized and
                          converted to WebP on save. Clear the selection before
                          save to skip the upload.
                        </p>
                      </div>
                    </div>
                    <AdminImageProcessingBanner active={isProcessingImage} />

                    <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader className="text-left">
                          <AlertDialogTitle>Remove logo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This deletes the image from Storage immediately. This
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isPending}>
                            Cancel
                          </AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={handleRemoveStoredLogo}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Loader2Icon className="animate-spin" />
                            ) : (
                              <XIcon />
                            )}
                            {isPending ? "Removing…" : "Remove logo"}
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {displayLogo && !logoPermission ? (
                      <p className="flex items-start gap-2 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                        <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                        This logo stays hidden on the public site until
                        publication permission is granted.
                      </p>
                    ) : null}
                  </Field>
                </AdminFormSection>
              </div>
            </StepperContent>

            <StepperContent value="profile" className="space-y-6">
              <AdminFormSection
                title={PARTNER_EDITOR_HELP.profile.title}
                description={PARTNER_EDITOR_HELP.profile.intro}
                help={PARTNER_EDITOR_HELP.profile}
                contentClassName="grid gap-4"
              >
                <Field data-invalid={Boolean(errors.link)}>
                  <AdminFormFieldLabel
                    htmlFor={`${formId}-link`}
                    hint={`Optional · http(s):// · max ${PARTNER_LINK_MAX} chars`}
                  >
                    Link
                  </AdminFormFieldLabel>
                  <UrlInput
                    id={`${formId}-link`}
                    className="min-h-11"
                    disabled={isPending}
                    maxLength={PARTNER_LINK_MAX}
                    placeholder="example.com"
                    aria-invalid={Boolean(errors.link)}
                    {...form.register("link")}
                  />
                  {errors.link ? (
                    <FieldError>{errors.link.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.contribution)}>
                  <AdminFormFieldLabel
                    htmlFor={`${formId}-contribution`}
                    hint={`Optional · max ${PARTNER_CONTRIBUTION_MAX} · type to filter suggestions`}
                  >
                    Role / contribution
                  </AdminFormFieldLabel>
                  <Controller
                    control={form.control}
                    name="contribution"
                    render={({ field }) => (
                      <PartnerContributionInput
                        id={`${formId}-contribution`}
                        className="min-h-11"
                        disabled={isPending}
                        maxLength={PARTNER_CONTRIBUTION_MAX}
                        placeholder="e.g. Technology Partner"
                        aria-invalid={Boolean(errors.contribution)}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.contribution ? (
                    <FieldError>{errors.contribution.message}</FieldError>
                  ) : null}
                </Field>
              </AdminFormSection>
            </StepperContent>

            <StepperContent value="settings" className="space-y-6">
              <AdminFormSection
                title={PARTNER_EDITOR_HELP.visibility.title}
                description={PARTNER_EDITOR_HELP.visibility.intro}
                help={PARTNER_EDITOR_HELP.visibility}
                contentClassName="grid gap-4"
              >
                <Controller
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <Label htmlFor={`${formId}-active`}>
                          Active partner
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Turn off to move this partner to the historical
                          section.
                        </p>
                      </div>
                      <Switch
                        id={`${formId}-active`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name="logoPermission"
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4 border-t pt-4">
                      <div className="min-w-0">
                        <Label htmlFor={`${formId}-permission`}>
                          Logo publication permission
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Only granted logos are rendered on the public site.
                        </p>
                      </div>
                      <Switch
                        id={`${formId}-permission`}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </div>
                  )}
                />
              </AdminFormSection>
            </StepperContent>
    </CmsEditorFrame>
  );
}
