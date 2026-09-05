"use client";

import Image from "next/image";
import { useId, useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "nextjs-toploader/app";
import {
  ImageIcon,
  Loader2Icon,
  TriangleAlertIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  createPartner,
  deletePartner,
  removePartnerLogo,
  updatePartner,
  uploadPartnerLogo,
} from "@/actions/partners";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import {
  ADMIN_FORM_PAIR_FIELD,
  ADMIN_FORM_PAIR_ROW,
  AdminFormFieldLabel,
} from "@/components/dashboard/admin-form-layout";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
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
import { Textarea } from "@/components/ui/textarea";
import { PARTNER_TYPE_LABELS } from "@/constants/partner-types";
import { partnerDetailPath, ROUTES } from "@/constants/routes";
import type { PartnerListItem } from "@/types/partner";
import {
  createPartnerSchema,
  PARTNER_CONTRIBUTION_MAX,
  PARTNER_LINK_MAX,
  PARTNER_NAME_MAX,
  PARTNER_ORG_MAX,
  PARTNER_SORT_ORDER_MAX,
  PARTNER_TYPES,
  type CreatePartnerInput,
  type PartnerFormValues,
} from "@/validations/partner";

const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

function defaultsFor(partner?: PartnerListItem): PartnerFormValues {
  return {
    name: partner?.name ?? "",
    org: partner?.org ?? "",
    type: partner?.type ?? "corporate",
    contribution: partner?.contribution ?? "",
    isActive: partner?.is_active ?? true,
    logoPermission: partner?.logo_permission ?? false,
    link: partner?.link ?? "",
    sortOrder: partner?.sort_order ?? 0,
  };
}

type PartnerEditorFormProps = {
  mode: "create" | "edit";
  partner?: PartnerListItem;
  heading: string;
  description: string;
};

export function PartnerEditorForm({
  mode,
  partner,
  heading,
  description,
}: PartnerEditorFormProps) {
  const formId = useId();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storedLogoUrl, setStoredLogoUrl] = useState(partner?.logo_url ?? null);

  const form = useForm<PartnerFormValues, unknown, CreatePartnerInput>({
    resolver: zodResolver(createPartnerSchema),
    mode: "onBlur",
    defaultValues: defaultsFor(partner),
  });

  const logoPermission = useWatch({
    control: form.control,
    name: "logoPermission",
  });

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
      toast.error("Logo must be under 2 MB.");
      return;
    }
    replacePendingLogo(file);
  }

  function handleRemoveStoredLogo() {
    if (mode !== "edit" || !partner || !storedLogoUrl) return;

    startTransition(async () => {
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
    const result = await uploadPartnerLogo(partnerId, formData);
    if (result.status === "error") return false;
    replacePendingLogo(null);
    return true;
  }

  function onSubmit(values: CreatePartnerInput) {
    startTransition(async () => {
      try {
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
        }
        router.refresh();
      } catch {
        toast.error("The partner could not be saved. Please try again.");
      }
    });
  }

  function onDelete() {
    if (!partner) return;
    startTransition(async () => {
      try {
        const result = await deletePartner({ id: partner.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        router.push(ROUTES.partners);
        router.refresh();
      } catch {
        toast.error("The partner could not be deleted. Please try again.");
      }
    });
  }

  const displayLogo = previewUrl ?? storedLogoUrl;
  const errors = form.formState.errors;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl tracking-tight">{heading}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="grid max-w-2xl gap-6"
      >
        <FieldGroup>
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
              <AdminFormFieldLabel htmlFor={`${formId}-type`} hint="Required">
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
                hint={`Optional · 0–${PARTNER_SORT_ORDER_MAX} · lowest first`}
              >
                Display order
              </AdminFormFieldLabel>
              <Input
                id={`${formId}-sort`}
                type="number"
                min={0}
                max={PARTNER_SORT_ORDER_MAX}
                step={1}
                className="min-h-11"
                disabled={isPending}
                aria-invalid={Boolean(errors.sortOrder)}
                {...form.register("sortOrder")}
              />
              {errors.sortOrder ? (
                <FieldError>{errors.sortOrder.message}</FieldError>
              ) : null}
            </Field>
          </div>

          <Field data-invalid={Boolean(errors.link)}>
            <AdminFormFieldLabel
              htmlFor={`${formId}-link`}
              hint={`Optional · http(s):// · max ${PARTNER_LINK_MAX} chars`}
            >
              Link
            </AdminFormFieldLabel>
            <Input
              id={`${formId}-link`}
              type="url"
              inputMode="url"
              className="min-h-11"
              disabled={isPending}
              maxLength={PARTNER_LINK_MAX}
              placeholder="https://example.com"
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
              hint={`Optional · max ${PARTNER_CONTRIBUTION_MAX} chars`}
            >
              Role / contribution
            </AdminFormFieldLabel>
            <Textarea
              id={`${formId}-contribution`}
              rows={4}
              disabled={isPending}
              maxLength={PARTNER_CONTRIBUTION_MAX}
              placeholder="What this partner actually does with founders."
              aria-invalid={Boolean(errors.contribution)}
              {...form.register("contribution")}
            />
            {errors.contribution ? (
              <FieldError>{errors.contribution.message}</FieldError>
            ) : null}
          </Field>

          <div className="grid gap-4 rounded-lg border p-4">
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Label htmlFor={`${formId}-active`}>Active partner</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Turn off to move this partner to the historical section.
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
          </div>

          <Field>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <Label>Logo</Label>
              <span className="text-[0.6875rem] leading-4 text-muted-foreground">
                Optional · JPEG/PNG/WebP/GIF · max 2 MB
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
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

              <div className="flex min-w-0 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={LOGO_ACCEPT}
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 sm:min-h-8"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon />
                    {displayLogo ? "Replace" : "Upload"}
                  </Button>
                  {pendingFile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-11 text-destructive sm:min-h-8"
                      disabled={isPending}
                      onClick={() => replacePendingLogo(null)}
                    >
                      <XIcon />
                      Remove
                    </Button>
                  ) : storedLogoUrl ? (
                    <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
                      <AlertDialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-11 text-destructive sm:min-h-8"
                            disabled={isPending}
                          />
                        }
                      >
                        <XIcon />
                        Remove
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader className="text-left">
                          <AlertDialogTitle>Remove logo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This deletes the image from Storage immediately.
                            This cannot be undone.
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
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP, or GIF under 2 MB. Resized and converted to
                  WebP on upload.
                </p>
              </div>
            </div>

            {displayLogo && !logoPermission ? (
              <p className="flex items-start gap-2 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                This logo stays hidden on the public site until publication
                permission is granted.
              </p>
            ) : null}
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create partner" : "Save changes"}
          </Button>
          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 w-full sm:w-auto"
              disabled={isPending}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </form>

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        showTrigger={false}
        title="Delete partner?"
        description={
          partner
            ? `This permanently deletes ${partner.name} and removes the stored logo from Storage. This cannot be undone.`
            : "This permanently deletes the partner. This cannot be undone."
        }
        confirmLabel="Delete partner"
        isPending={isPending}
        onConfirm={onDelete}
      />
    </>
  );
}
