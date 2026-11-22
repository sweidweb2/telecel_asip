"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useWatch } from "react-hook-form";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createStartup,
  deleteStartup,
  removeStartupCover,
  removeStartupLogo,
  updateStartup,
  uploadStartupCover,
  uploadStartupLogo,
} from "@/actions/startups";
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
import { CmsEditorFrame } from "@/components/dashboard/cms-editor-frame";
import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminImagePreviewButton } from "@/components/dashboard/admin-image-preview-button";
import { AdminImageProcessingBanner } from "@/components/dashboard/admin-image-processing-banner";
import { StepperContent } from "@/components/ui/stepper";
import {
  applyClearFormValues,
  applyDummyFormValues,
  dummyStartupValues,
  todayIsoDate,
} from "@/lib/dummy-form-values";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UrlInput } from "@/components/ui/url-input";
import { portfolioEditPath, ROUTES } from "@/constants/routes";
import { STARTUP_EDITOR_HELP } from "@/constants/startup-editor-help";
import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";
import { slugifyTitle } from "@/lib/blog-utils";
import type { StartupWithDetails } from "@/types/startup";
import {
  STARTUP_DESCRIPTION_MAX,
  STARTUP_LOCATION_MAX,
  STARTUP_LONG_TEXT_MAX,
  STARTUP_NAME_MAX,
  STARTUP_SIZE_MAX,
  STARTUP_SLUG_MAX,
  STARTUP_TEAM_MAX,
  STARTUP_TEXT_SHORT_MAX,
  STARTUP_URL_MAX,
  createStartupSchema,
  type CreateStartupInput,
  type UpdateStartupInput,
} from "@/validations/startup";

/** Admin form surface — same height + fill on every Input / Select / Textarea. */
const FIELD = "min-h-11";
const TEXTAREA = "min-h-24";
const SELECT_TRIGGER = "min-h-11 w-full";

const STARTUP_EDITOR_STEPS = [
  {
    id: "core",
    title: "Core",
    description: "Main info & logo",
    fields: ["name", "slug", "description", "status", "foundedAt"],
  },
  {
    id: "profile",
    title: "Profile",
    description: "Public portfolio fields",
    fields: [
      "details.cohort",
      "details.countryCode",
      "details.sector",
      "details.founderNames",
      "details.coverImageUrl",
      "details.publicOutcome",
      "details.featured",
      "details.imageFocalX",
      "details.imageFocalY",
    ],
  },
  {
    id: "details",
    title: "Details",
    description: "Business & funding",
    fields: [
      "details.websiteUrl",
      "details.industry",
      "details.category",
      "details.location",
      "details.foundingYear",
      "details.size",
      "details.team",
      "details.problem",
      "details.solution",
      "details.targetMarket",
      "details.businessModel",
      "details.fundingGoal",
      "details.amountRaised",
    ],
  },
];

type StartupEditorFormProps = {
  mode: "create" | "edit";
  startup?: StartupWithDetails;
  heading: string;
};

function emptyDetails(): UpdateStartupInput["details"] {
  return {
    websiteUrl: "",
    industry: "",
    category: "",
    location: "",
    cohort: "",
    countryCode: "",
    sector: "",
    founderNames: "",
    coverImageUrl: "",
    publicOutcome: "",
    featured: false,
    imageFocalX: 50,
    imageFocalY: 50,
    foundingYear: undefined,
    team: "",
    size: "",
    problem: "",
    solution: "",
    targetMarket: "",
    businessModel: "",
    fundingGoal: undefined,
    amountRaised: undefined,
  };
}

type StartupFormValues = CreateStartupInput & {
  details: UpdateStartupInput["details"];
};

function defaultsFromStartup(startup?: StartupWithDetails): StartupFormValues {
  if (!startup) {
    return {
      name: "",
      slug: "",
      description: "",
      status: "draft",
      foundedAt: todayIsoDate(),
      details: emptyDetails(),
    };
  }

  const d = startup.details;
  return {
    name: startup.name,
    slug: startup.slug,
    description: startup.description,
    status: startup.status,
    foundedAt: startup.founded_at ?? "",
    details: {
      websiteUrl: d?.website_url ?? "",
      industry: d?.industry ?? "",
      category: d?.category ?? "",
      location: d?.location ?? "",
      cohort: d?.cohort ?? "",
      countryCode: d?.country_code ?? "",
      sector: d?.sector ?? "",
      founderNames: d?.founder_names?.join(", ") ?? "",
      coverImageUrl: d?.cover_image_url ?? "",
      publicOutcome: d?.public_outcome ?? "",
      featured: d?.featured ?? false,
      imageFocalX: d?.image_focal_x ?? 50,
      imageFocalY: d?.image_focal_y ?? 50,
      foundingYear: d?.founding_year ?? undefined,
      team: d?.team ?? "",
      size: d?.size ?? "",
      problem: d?.problem ?? "",
      solution: d?.solution ?? "",
      targetMarket: d?.target_market ?? "",
      businessModel: d?.business_model ?? "",
      fundingGoal: d?.funding_goal ?? undefined,
      amountRaised: d?.amount_raised ?? undefined,
    },
  };
}

export function StartupEditorForm({
  mode,
  startup,
  heading,
}: StartupEditorFormProps) {
  const router = useRouter();
  const editor = useCmsEditorForm<StartupFormValues>({
    mode,
    schema: createStartupSchema,
    defaultValues: defaultsFromStartup(startup),
    recordId: startup?.id,
    listPath: ROUTES.portfolio,
    detailPath: portfolioEditPath,
    create: createStartup,
    update: updateStartup,
    remove: deleteStartup,
    saveError: "The startup could not be saved. Please try again.",
    steps: STARTUP_EDITOR_STEPS,
  });
  const { form, isPending, errors, step, setStep } = editor;
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(
    null,
  );
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(
    null,
  );
  /** `undefined` = use prop; otherwise local override after remove/upload. */
  const [coverOverride, setCoverOverride] = useState<
    string | null | undefined
  >(undefined);
  const storedCoverUrl =
    coverOverride !== undefined
      ? coverOverride
      : (startup?.details?.cover_image_url ?? null);

  const status = useWatch({ control: form.control, name: "status" });
  const logoUrl = startup?.logo_url ?? null;
  const previewSrc = pendingLogoPreview ?? logoUrl;
  const coverPreviewSrc = pendingCoverPreview ?? storedCoverUrl;

  function onNameChange(value: string) {
    form.setValue("name", value, { shouldDirty: true });
    if (!slugTouched) {
      form.setValue("slug", slugifyTitle(value), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function onLogoPicked(file: File | null) {
    if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
    if (!file) {
      setPendingLogo(null);
      setPendingLogoPreview(null);
      return;
    }
    setPendingLogo(file);
    setPendingLogoPreview(URL.createObjectURL(file));
  }

  function onCoverPicked(file: File | null) {
    if (pendingCoverPreview) URL.revokeObjectURL(pendingCoverPreview);
    if (!file) {
      setPendingCover(null);
      setPendingCoverPreview(null);
      return;
    }
    setPendingCover(file);
    setPendingCoverPreview(URL.createObjectURL(file));
  }

  async function uploadPendingLogo(startupId: string): Promise<boolean> {
    if (!pendingLogo) return true;
    const formData = new FormData();
    formData.set("file", pendingLogo);
    setIsProcessingImage(true);
    const uploadToast = toast.loading("Processing logo…");
    try {
      const upload = await uploadStartupLogo(startupId, formData);
      if (upload.status === "error") {
        toast.error(upload.message, { id: uploadToast });
        return false;
      }
      toast.dismiss(uploadToast);
      onLogoPicked(null);
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

  async function uploadPendingCover(startupId: string): Promise<boolean> {
    if (!pendingCover) return true;
    const formData = new FormData();
    formData.set("file", pendingCover);
    setIsProcessingImage(true);
    const uploadToast = toast.loading("Processing cover image…");
    try {
      const upload = await uploadStartupCover(startupId, formData);
      if (upload.status === "error") {
        toast.error(upload.message, { id: uploadToast });
        return false;
      }
      toast.dismiss(uploadToast);
      onCoverPicked(null);
      return true;
    } catch {
      toast.error(
        "The cover image could not be uploaded. Check that it is under 10 MB and try again.",
        { id: uploadToast },
      );
      return false;
    } finally {
      setIsProcessingImage(false);
    }
  }

  function submit(values: StartupFormValues) {
    editor.run(async () => {
      if (mode === "create") {
        const result = await createStartup({
          name: values.name,
          slug: values.slug,
          description: values.description,
          status: values.status,
          foundedAt: values.foundedAt,
          details: values.details,
        });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        if (!result.id) {
          toast.success(result.message);
          router.push(ROUTES.portfolio);
          router.refresh();
          return;
        }

        const logoOk = await uploadPendingLogo(result.id);
        const coverOk = logoOk ? await uploadPendingCover(result.id) : false;
        if (!logoOk || !coverOk) {
          toast.error(
            "Startup created, but an image could not be uploaded. Add it from this page.",
          );
          router.push(`${ROUTES.portfolio}/${result.id}`);
          router.refresh();
          return;
        }

        toast.success(result.message);
        router.push(`${ROUTES.portfolio}/${result.id}`);
        router.refresh();
        return;
      }

      if (!startup) return;
      const result = await updateStartup({
        id: startup.id,
        name: values.name,
        slug: values.slug,
        description: values.description,
        status: values.status,
        foundedAt: values.foundedAt,
        details: values.details,
      });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      const logoOk = await uploadPendingLogo(startup.id);
      if (!logoOk) {
        form.reset(form.getValues());
        return;
      }
      const coverOk = await uploadPendingCover(startup.id);
      if (!coverOk) {
        form.reset(form.getValues());
        return;
      }

      toast.success(result.message);
      form.reset(form.getValues());
      router.refresh();
    });
  }

  function onRemoveLogo() {
    if (!startup) return;
    editor.run(async () => {
      const result = await removeStartupLogo(startup.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      onLogoPicked(null);
      toast.success(result.message);
      router.refresh();
    });
  }

  function onRemoveCover() {
    if (!startup) return;
    editor.run(async () => {
      const result = await removeStartupCover(startup.id);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      onCoverPicked(null);
      setCoverOverride(null);
      form.setValue("details.coverImageUrl", "", { shouldDirty: true });
      toast.success(result.message);
      router.refresh();
    });
  }

  const saveDisabled = editor.submitDisabled(
    Boolean(pendingLogo || pendingCover),
  );
  const saveLabel = mode === "create" ? "Create startup" : "Save changes";
  const pendingLabel = isProcessingImage
    ? "Processing image…"
    : mode === "create"
      ? "Creating…"
      : "Saving…";

  const stepIndex = STARTUP_EDITOR_STEPS.findIndex((s) => s.id === step);
  const isLastStep = stepIndex === STARTUP_EDITOR_STEPS.length - 1;
  const isFirstStep = stepIndex <= 0;

  async function goToNextStep() {
    const current = STARTUP_EDITOR_STEPS[stepIndex];
    if (!current) return;
    const ok = await form.trigger([...current.fields] as never, {
      shouldFocus: true,
    });
    if (!ok) {
      toast.error("Fix the highlighted fields before continuing.");
      return;
    }
    const next = STARTUP_EDITOR_STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  }

  function goToPreviousStep() {
    const prev = STARTUP_EDITOR_STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  }

  function onStepChange(nextId: string) {
    const nextIndex = STARTUP_EDITOR_STEPS.findIndex((s) => s.id === nextId);
    if (nextIndex < 0) return;
    if (nextIndex <= stepIndex) {
      setStep(nextId);
      return;
    }
    if (nextIndex === stepIndex + 1) {
      void goToNextStep();
    }
  }

  return (
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={form.handleSubmit(submit, editor.onInvalid)}
      steps={STARTUP_EDITOR_STEPS}
      step={step}
      onStepChange={onStepChange}
      isStepDisabled={(index) => index > stepIndex + 1}
      heading={heading}
      formClassName="mx-auto max-w-6xl"
      stepperClassName="flex flex-col gap-6"
      navClassName=""
      panelClassName="w-full"
      onDummy={() => {
        applyDummyFormValues(form, dummyStartupValues(form.getValues()));
        setSlugTouched(true);
      }}
      onClear={() => {
        applyClearFormValues(form, defaultsFromStartup());
        setSlugTouched(false);
        onLogoPicked(null);
        onCoverPicked(null);
      }}
      actions={
        <div className="flex w-full flex-col gap-3">
          <AdminImageProcessingBanner active={isProcessingImage} />
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            {mode === "edit" ? (
              <Button
                type="button"
                variant="destructive"
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending}
                onClick={() => editor.setDeleteOpen(true)}
              >
                <Trash2Icon className="size-4" />
                Delete
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full sm:w-auto"
                disabled={isPending || isFirstStep}
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              {isLastStep ? (
                <Button
                  type="submit"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={saveDisabled}
                >
                  {isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : null}
                  {isPending ? pendingLabel : saveLabel}
                </Button>
              ) : (
                <Button
                  type="button"
                  className="min-h-11 w-full sm:w-auto"
                  disabled={isPending}
                  onClick={() => void goToNextStep()}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete this startup?",
        description:
          "This permanently removes the startup, its details, and logo. This cannot be undone.",
        confirmLabel: "Delete",
        onConfirm: editor.onDelete,
      }}
    >
          <StepperContent value="core" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:items-start lg:gap-8">
            <AdminFormSection
              className="min-w-0"
              title="Core"
              description="Name, slug, description, status, and founding date"
              help={STARTUP_EDITOR_HELP.core}
              contentClassName="grid gap-4"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="name"
                      hint={`Required · 2–${STARTUP_NAME_MAX} chars`}
                    >
                      Name
                    </AdminFormFieldLabel>
                    <Input
                      id="name"
                      className={FIELD}
                      disabled={isPending}
                      maxLength={STARTUP_NAME_MAX}
                      placeholder="e.g. HealthCo"
                      {...form.register("name", {
                        onChange: (event) => onNameChange(event.target.value),
                      })}
                    />
                    {errors.name ? (
                      <AdminFieldError message={errors.name.message} />
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="slug"
                      hint={`Required · 2–${STARTUP_SLUG_MAX} · a-z 0-9 hyphens`}
                    >
                      Slug
                    </AdminFormFieldLabel>
                    <Input
                      id="slug"
                      className={FIELD}
                      disabled={isPending}
                      maxLength={STARTUP_SLUG_MAX}
                      placeholder="e.g. healthco"
                      {...form.register("slug", {
                        onChange: () => setSlugTouched(true),
                      })}
                    />
                    {errors.slug ? (
                      <AdminFieldError message={errors.slug.message} />
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="description"
                    hint={`Required · 2–${STARTUP_DESCRIPTION_MAX} chars`}
                  >
                    Description
                  </AdminFormFieldLabel>
                  <Textarea
                    id="description"
                    className={TEXTAREA}
                    disabled={isPending}
                    maxLength={STARTUP_DESCRIPTION_MAX}
                    placeholder="What the startup builds and for whom"
                    {...form.register("description")}
                  />
                  {errors.description ? (
                    <AdminFieldError message={errors.description.message} />
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <AdminFormFieldLabel
                      htmlFor="status"
                      hint="draft · active · inactive"
                    >
                      Status
                    </AdminFormFieldLabel>
                    <Select
                      value={status}
                      onValueChange={(value) => {
                        if (!value) return;
                        form.setValue(
                          "status",
                          value as StartupFormValues["status"],
                          { shouldDirty: true, shouldValidate: true },
                        );
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger id="status" className={SELECT_TRIGGER}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status ? (
                      <AdminFieldError message={errors.status.message} />
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <AdminFormFieldLabel htmlFor="foundedAt" hint="Optional · YYYY-MM-DD">
                      Founded at
                    </AdminFormFieldLabel>
                    <Controller
                      control={form.control}
                      name="foundedAt"
                      render={({ field }) => (
                        <DatePicker
                          id="foundedAt"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                          placeholder="Select founding date"
                          aria-invalid={Boolean(errors.foundedAt)}
                        />
                      )}
                    />
                    {errors.foundedAt ? (
                      <AdminFieldError message={errors.foundedAt.message} />
                    ) : null}
                  </div>
                </div>
            </AdminFormSection>

            <AdminFormSection
              className="min-w-0"
              title="Logo"
              description="JPEG / PNG / WebP / GIF · max 10 MB"
              help={STARTUP_EDITOR_HELP.logo}
              contentClassName="grid gap-4"
            >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-muted">
                  {previewSrc ? (
                    pendingLogoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pendingLogoPreview}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Image
                        src={previewSrc}
                        alt={startup?.name ?? "Startup logo"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 28rem"
                      />
                    )
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                      No logo yet
                    </div>
                  )}
                  {previewSrc ? (
                    <>
                      <AdminImagePreviewButton
                        src={previewSrc}
                        alt={startup?.name ?? "Startup logo"}
                        label="View full logo"
                        disabled={isPending}
                      />
                      <AdminClearIconButton
                        label={
                          pendingLogo ? "Clear logo selection" : "Remove logo"
                        }
                        disabled={isPending}
                        onClick={() => {
                          if (pendingLogo) {
                            onLogoPicked(null);
                            return;
                          }
                          onRemoveLogo();
                        }}
                      />
                    </>
                  ) : null}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => {
                    onLogoPicked(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11"
                    disabled={isPending}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <UploadIcon className="size-4" />
                    {pendingLogo || logoUrl ? "Replace logo" : "Choose logo"}
                  </Button>
                </div>
                <AdminImageProcessingBanner active={isProcessingImage} />
                <p className="text-xs text-muted-foreground">
                  Optional. On create, the file uploads after the startup row is
                  saved. Clear the selection before save to skip the upload.
                  Percent and cancel are not available while processing.
                </p>
            </AdminFormSection>
          </div>
          </StepperContent>

          <StepperContent value="profile" className="space-y-6">
          <AdminFormSection
            className="min-w-0"
            title="Public profile"
            description="Cohort, country, sector, founders, cover, and featured placement"
            help={STARTUP_EDITOR_HELP.publicProfile}
            contentClassName="grid gap-4"
          >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="cohort" hint="Optional · max 40">
                    Cohort
                  </AdminFormFieldLabel>
                  <Input
                    id="cohort"
                    placeholder="Cohort 4"
                    disabled={isPending}
                    maxLength={40}
                    className={FIELD}
                    {...form.register("details.cohort")}
                  />
                </div>
                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="countryCode">Country code</AdminFormFieldLabel>
                  <Input
                    id="countryCode"
                    placeholder="GH"
                    maxLength={2}
                    className={cn(FIELD, "uppercase")}
                    disabled={isPending}
                    {...form.register("details.countryCode")}
                  />
                </div>
                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="sector"
                    hint={`Optional · max ${STARTUP_TEXT_SHORT_MAX}`}
                  >
                    Sector
                  </AdminFormFieldLabel>
                  <Input
                    id="sector"
                    placeholder="Health technology"
                    disabled={isPending}
                    maxLength={STARTUP_TEXT_SHORT_MAX}
                    className={FIELD}
                    {...form.register("details.sector")}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <AdminFormFieldLabel
                  htmlFor="founderNames"
                  hint="Comma-separated · max 500"
                >
                  Founder names
                </AdminFormFieldLabel>
                <Input
                  id="founderNames"
                  placeholder="First Founder, Second Founder"
                  disabled={isPending}
                  maxLength={500}
                  className={FIELD}
                  {...form.register("details.founderNames")}
                />
              </div>
              <div className="grid gap-3">
                <AdminFormFieldLabel hint="Optional · JPEG / PNG / WebP / GIF · max 10 MB">
                  Cover image
                </AdminFormFieldLabel>
                <div className="relative aspect-[16/9] w-full max-w-xl overflow-hidden rounded-lg border border-border bg-muted">
                  {coverPreviewSrc ? (
                    pendingCoverPreview ? (
                      // Local blob preview — next/image cannot optimize object URLs.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverPreviewSrc}
                        alt="Cover preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Image
                        src={coverPreviewSrc}
                        alt={startup?.name ?? "Startup cover"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 36rem"
                      />
                    )
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                      No cover image yet
                    </div>
                  )}
                  {coverPreviewSrc ? (
                    <>
                      <AdminImagePreviewButton
                        src={coverPreviewSrc}
                        alt={startup?.name ?? "Startup cover"}
                        label="View full cover"
                        disabled={isPending}
                      />
                      <AdminClearIconButton
                        label={
                          pendingCover
                            ? "Clear cover selection"
                            : "Remove cover image"
                        }
                        disabled={isPending}
                        onClick={() => {
                          if (pendingCover) {
                            onCoverPicked(null);
                            return;
                          }
                          onRemoveCover();
                        }}
                      />
                    </>
                  ) : null}
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file && file.size > UPLOAD_MAX_BYTES) {
                      toast.error("Image must be under 10 MB.");
                      event.currentTarget.value = "";
                      return;
                    }
                    onCoverPicked(file);
                    event.currentTarget.value = "";
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11"
                    disabled={isPending}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <UploadIcon className="size-4" />
                    {pendingCover || storedCoverUrl
                      ? "Replace cover"
                      : "Choose cover"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional portfolio hero. On create, the file uploads after the
                  startup row is saved. Images are resized and stored as WebP in
                  the startups bucket.
                </p>
              </div>
              <div className="grid gap-2">
                <AdminFormFieldLabel
                  htmlFor="publicOutcome"
                  hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                >
                  Approved public outcome
                </AdminFormFieldLabel>
                <Textarea
                  id="publicOutcome"
                  className={TEXTAREA}
                  disabled={isPending}
                  maxLength={STARTUP_TEAM_MAX}
                  placeholder="Approved result you can show publicly"
                  {...form.register("details.publicOutcome")}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex min-h-11 items-center gap-3 rounded-lg border border-input px-3">
                  <Controller
                    control={form.control}
                    name="details.featured"
                    render={({ field }) => (
                      <Checkbox
                        id="featured"
                        checked={field.value === true}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        className="size-5"
                      />
                    )}
                  />
                  <Label htmlFor="featured" className="font-normal">
                    Featured profile
                  </Label>
                </div>
                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="imageFocalX">Image focus X (%)</AdminFormFieldLabel>
                  <Input
                    id="imageFocalX"
                    type="number"
                    min={0}
                    max={100}
                    disabled={isPending}
                    className={FIELD}
                    placeholder="50"
                    {...form.register("details.imageFocalX")}
                  />
                </div>
                <div className="grid gap-2">
                  <AdminFormFieldLabel htmlFor="imageFocalY">Image focus Y (%)</AdminFormFieldLabel>
                  <Input
                    id="imageFocalY"
                    type="number"
                    min={0}
                    max={100}
                    disabled={isPending}
                    className={FIELD}
                    placeholder="50"
                    {...form.register("details.imageFocalY")}
                  />
                </div>
              </div>
          </AdminFormSection>
          </StepperContent>

          <StepperContent value="details" className="space-y-6">
          <AdminFormSection
            className="min-w-0"
            title="Company details"
            description="Website, narrative, and funding fields"
            help={STARTUP_EDITOR_HELP.detailsExtra}
            contentClassName="grid gap-4"
          >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
                  <AdminFormFieldLabel
                    htmlFor="websiteUrl"
                    hint={`Optional · http(s) · max ${STARTUP_URL_MAX}`}
                  >
                    Website URL
                  </AdminFormFieldLabel>
                  <UrlInput
                    id="websiteUrl"
                    placeholder="example.com"
                    className={FIELD}
                    disabled={isPending}
                    maxLength={STARTUP_URL_MAX}
                    {...form.register("details.websiteUrl")}
                  />
                  {errors.details?.websiteUrl ? (
                    <AdminFieldError message={errors.details.websiteUrl.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="industry"
                    hint={`Optional · max ${STARTUP_TEXT_SHORT_MAX}`}
                  >
                    Industry
                  </AdminFormFieldLabel>
                  <Input
                    id="industry"
                    className={FIELD}
                    disabled={isPending}
                    maxLength={STARTUP_TEXT_SHORT_MAX}
                    placeholder="e.g. Fintech"
                    {...form.register("details.industry")}
                  />
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="category"
                    hint={`Optional · max ${STARTUP_TEXT_SHORT_MAX}`}
                  >
                    Category
                  </AdminFormFieldLabel>
                  <Input
                    id="category"
                    className={FIELD}
                    disabled={isPending}
                    maxLength={STARTUP_TEXT_SHORT_MAX}
                    placeholder="e.g. B2B SaaS"
                    {...form.register("details.category")}
                  />
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="location"
                    hint={`Optional · max ${STARTUP_LOCATION_MAX}`}
                  >
                    Location
                  </AdminFormFieldLabel>
                  <Input
                    id="location"
                    className={FIELD}
                    disabled={isPending}
                    maxLength={STARTUP_LOCATION_MAX}
                    placeholder="e.g. Accra, Ghana"
                    {...form.register("details.location")}
                  />
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="foundingYear"
                    hint="Optional · 1900–2100"
                  >
                    Founding year
                  </AdminFormFieldLabel>
                  <Input
                    id="foundingYear"
                    type="number"
                    className={FIELD}
                    disabled={isPending}
                    placeholder="e.g. 2021"
                    {...form.register("details.foundingYear")}
                  />
                  {errors.details?.foundingYear ? (
                    <AdminFieldError message={errors.details.foundingYear.message} />
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="size"
                    hint={`Optional · max ${STARTUP_SIZE_MAX}`}
                  >
                    Company size
                  </AdminFormFieldLabel>
                  <Input
                    id="size"
                    placeholder="e.g. 1-10"
                    className={FIELD}
                    disabled={isPending}
                    maxLength={STARTUP_SIZE_MAX}
                    {...form.register("details.size")}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2 lg:col-span-3">
                  <AdminFormFieldLabel
                    htmlFor="team"
                    hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                  >
                    Team
                  </AdminFormFieldLabel>
                  <Input
                    id="team"
                    className={FIELD}
                    disabled={isPending}
                    maxLength={STARTUP_TEAM_MAX}
                    placeholder="e.g. 3 founders, 8 employees"
                    {...form.register("details.team")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="problem"
                    hint={`Optional · max ${STARTUP_LONG_TEXT_MAX}`}
                  >
                    Problem
                  </AdminFormFieldLabel>
                  <Textarea
                    id="problem"
                    className={TEXTAREA}
                    disabled={isPending}
                    maxLength={STARTUP_LONG_TEXT_MAX}
                    placeholder="The problem founders are solving"
                    {...form.register("details.problem")}
                  />
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="solution"
                    hint={`Optional · max ${STARTUP_LONG_TEXT_MAX}`}
                  >
                    Solution
                  </AdminFormFieldLabel>
                  <Textarea
                    id="solution"
                    className={TEXTAREA}
                    disabled={isPending}
                    maxLength={STARTUP_LONG_TEXT_MAX}
                    placeholder="What they built to solve it"
                    {...form.register("details.solution")}
                  />
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="targetMarket"
                    hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                  >
                    Target market
                  </AdminFormFieldLabel>
                  <Textarea
                    id="targetMarket"
                    className={TEXTAREA}
                    disabled={isPending}
                    maxLength={STARTUP_TEAM_MAX}
                    placeholder="Who they sell to"
                    {...form.register("details.targetMarket")}
                  />
                </div>

                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="businessModel"
                    hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                  >
                    Business model
                  </AdminFormFieldLabel>
                  <Textarea
                    id="businessModel"
                    className={TEXTAREA}
                    disabled={isPending}
                    maxLength={STARTUP_TEAM_MAX}
                    placeholder="How they make money"
                    {...form.register("details.businessModel")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="fundingGoal"
                    hint="Optional · number ≥ 0"
                  >
                    Funding goal
                  </AdminFormFieldLabel>
                  <Input
                    id="fundingGoal"
                    type="number"
                    min={0}
                    step="any"
                    className={FIELD}
                    disabled={isPending}
                    placeholder="e.g. 500000"
                    {...form.register("details.fundingGoal")}
                  />
                  {errors.details?.fundingGoal ? (
                    <AdminFieldError message={errors.details.fundingGoal.message} />
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <AdminFormFieldLabel
                    htmlFor="amountRaised"
                    hint="Optional · ≥ 0 · ≤ funding goal"
                  >
                    Amount raised
                  </AdminFormFieldLabel>
                  <Input
                    id="amountRaised"
                    type="number"
                    min={0}
                    step="any"
                    className={FIELD}
                    disabled={isPending}
                    placeholder="e.g. 120000"
                    {...form.register("details.amountRaised")}
                  />
                  {errors.details?.amountRaised ? (
                    <AdminFieldError message={errors.details.amountRaised.message} />
                  ) : null}
                </div>
              </div>
          </AdminFormSection>
          </StepperContent>
    </CmsEditorFrame>
  );
}
