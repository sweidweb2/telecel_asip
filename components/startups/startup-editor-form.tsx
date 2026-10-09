"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createStartup,
  deleteStartup,
  removeStartupLogo,
  updateStartup,
  uploadStartupLogo,
} from "@/actions/startups";
import {
  ADMIN_EDITOR_ACTIONS_SAFE_AREA,
  AdminEditorActionsBar,
} from "@/components/dashboard/admin-editor-actions-bar";
import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormSectionHelp } from "@/components/dashboard/admin-form-section-help";
import { AdminImageProcessingBanner } from "@/components/dashboard/admin-image-processing-banner";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  applyClearFormValues,
  applyDummyFormValues,
  dummyStartupValues,
  todayIsoDate,
} from "@/lib/admin/dummy-form-values";
import { cn } from "@/lib/utils";
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ROUTES } from "@/constants/routes";
import { STARTUP_EDITOR_HELP } from "@/constants/startup-editor-help";
import { UnsavedChangesGuard } from "@/components/dashboard/unsaved-changes-guard";
import {
  firstInvalidEditorStep,
  isAdminFormSubmitDisabled,
} from "@/lib/admin/form-submit";
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

function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint ? (
        <span className="max-w-full text-right text-xs text-muted-foreground text-pretty">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

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
  const [isPending, startTransition] = useTransition();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [step, setStep] = useState<string>(STARTUP_EDITOR_STEPS[0].id);

  const form = useForm<StartupFormValues>({
    resolver: zodResolver(createStartupSchema) as never,
    defaultValues: defaultsFromStartup(startup),
    mode: "onChange",
    shouldUnregister: false,
  });

  const status = useWatch({ control: form.control, name: "status" });
  const logoUrl = startup?.logo_url ?? null;
  const previewSrc = pendingLogoPreview ?? logoUrl;

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

  function submit(values: StartupFormValues) {
    startTransition(async () => {
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
        if (pendingLogo && result.id) {
          const formData = new FormData();
          formData.set("file", pendingLogo);
          setIsProcessingImage(true);
          const uploadToast = toast.loading("Processing image…");
          try {
            const upload = await uploadStartupLogo(result.id, formData);
            if (upload.status === "error") {
              toast.error(
                "Startup created, but the logo could not be processed. Add it from this page.",
                { id: uploadToast },
              );
              router.push(`${ROUTES.portfolio}/${result.id}`);
              router.refresh();
              return;
            }
            toast.dismiss(uploadToast);
          } finally {
            setIsProcessingImage(false);
          }
        }
        toast.success(result.message);
        router.push(
          result.id ? `${ROUTES.portfolio}/${result.id}` : ROUTES.portfolio,
        );
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
      if (pendingLogo) {
        const formData = new FormData();
        formData.set("file", pendingLogo);
        setIsProcessingImage(true);
        const uploadToast = toast.loading("Processing image…");
        try {
          const upload = await uploadStartupLogo(startup.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message, { id: uploadToast });
            // Fields already saved — clear dirty so only pending logo keeps Save open.
            form.reset(form.getValues());
            return;
          }
          toast.dismiss(uploadToast);
          setPendingLogo(null);
          if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
          setPendingLogoPreview(null);
        } finally {
          setIsProcessingImage(false);
        }
      }
      toast.success(result.message);
      form.reset(form.getValues());
      router.refresh();
    });
  }

  function onDelete() {
    if (!startup) return;
    startTransition(async () => {
      const result = await deleteStartup({ id: startup.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleteOpen(false);
      router.push(ROUTES.portfolio);
      router.refresh();
    });
  }

  function onRemoveLogo() {
    if (!startup) return;
    startTransition(async () => {
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

  const { errors, isDirty } = form.formState;
  const saveDisabled = isAdminFormSubmitDisabled({
    isPending,
    isDirty,
    errors,
    hasExternalChanges: Boolean(pendingLogo),
  });
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
    <div className="grid w-full gap-6">
      <UnsavedChangesGuard enabled={isDirty && !isPending} />
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl tracking-tight">{heading}</h2>
        <AdminFormDevTools
          disabled={isPending}
          onDummy={() => {
            applyDummyFormValues(
              form,
              dummyStartupValues(form.getValues()),
            );
            setSlugTouched(true);
          }}
          onClear={() => {
            applyClearFormValues(form, defaultsFromStartup());
            setSlugTouched(false);
            onLogoPicked(null);
          }}
        />
      </div>

      <form
        className={`mx-auto grid w-full max-w-6xl gap-6 ${ADMIN_EDITOR_ACTIONS_SAFE_AREA}`}
        onSubmit={form.handleSubmit(submit, (errors) => {
          const next = firstInvalidEditorStep(errors, STARTUP_EDITOR_STEPS);
          if (next) setStep(next);
        })}
        noValidate
      >
      <Stepper
        steps={STARTUP_EDITOR_STEPS}
        value={step}
        onValueChange={onStepChange}
        orientation="horizontal"
        className="flex flex-col gap-6"
      >
        <StepperNav>
          {STARTUP_EDITOR_STEPS.map((s, index) => (
            <StepperItem
              key={s.id}
              stepId={s.id}
              disabled={index > stepIndex + 1}
              className="relative flex-1"
            >
              <StepperTrigger className="flex w-full flex-col items-center gap-2.5">
                <StepperIndicator>{index + 1}</StepperIndicator>
                <div className="min-w-0 text-center">
                  <StepperTitle>{s.title}</StepperTitle>
                  <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                    {s.description}
                  </p>
                </div>
              </StepperTrigger>
              {index < STARTUP_EDITOR_STEPS.length - 1 ? (
                <StepperSeparator
                  className={cn(
                    "absolute inset-x-0 top-4",
                    "right-[calc(-50%+18px)] left-[calc(50%+18px)]",
                    "m-0 h-0.5 flex-none",
                  )}
                />
              ) : null}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel className="w-full">
          <StepperContent value="core" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:items-start lg:gap-4">
            <Card size="sm" className="min-w-0">
              <CardHeader className="border-b bg-brand-soft">
                <CardTitle>Core</CardTitle>
                <CardDescription>
                  Name, slug, description, status, and founding date
                </CardDescription>
                <CardAction>
                  <AdminFormSectionHelp help={STARTUP_EDITOR_HELP.core} />
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel
                      htmlFor="name"
                      hint={`Required · 2–${STARTUP_NAME_MAX} chars`}
                    >
                      Name
                    </FieldLabel>
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
                    <FieldLabel
                      htmlFor="slug"
                      hint={`Required · 2–${STARTUP_SLUG_MAX} · a-z 0-9 hyphens`}
                    >
                      Slug
                    </FieldLabel>
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
                  <FieldLabel
                    htmlFor="description"
                    hint={`Required · 2–${STARTUP_DESCRIPTION_MAX} chars`}
                  >
                    Description
                  </FieldLabel>
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
                    <FieldLabel
                      htmlFor="status"
                      hint="draft · active · inactive"
                    >
                      Status
                    </FieldLabel>
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
                    <FieldLabel htmlFor="foundedAt" hint="Optional · YYYY-MM-DD">
                      Founded at
                    </FieldLabel>
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
              </CardContent>
            </Card>

            <Card size="sm" className="min-w-0">
              <CardHeader className="border-b bg-brand-soft">
                <CardTitle>Logo</CardTitle>
                <CardDescription>
                  JPEG / PNG / WebP / GIF · max 5 MB
                </CardDescription>
                <CardAction>
                  <AdminFormSectionHelp help={STARTUP_EDITOR_HELP.logo} />
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-4">
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
              </CardContent>
            </Card>
          </div>
          </StepperContent>

          <StepperContent value="profile" className="space-y-6">
          <Card size="sm" className="min-w-0">
            <CardHeader className="border-b bg-brand-soft">
              <CardTitle>Public profile</CardTitle>
              <CardDescription>
                Cohort, country, sector, founders, cover, and featured placement
              </CardDescription>
              <CardAction>
                <AdminFormSectionHelp help={STARTUP_EDITOR_HELP.publicProfile} />
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4 pb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <FieldLabel htmlFor="cohort" hint="Optional · max 40">
                    Cohort
                  </FieldLabel>
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
                  <FieldLabel htmlFor="countryCode">Country code</FieldLabel>
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
                  <FieldLabel
                    htmlFor="sector"
                    hint={`Optional · max ${STARTUP_TEXT_SHORT_MAX}`}
                  >
                    Sector
                  </FieldLabel>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <FieldLabel
                    htmlFor="founderNames"
                    hint="Comma-separated · max 500"
                  >
                    Founder names
                  </FieldLabel>
                  <Input
                    id="founderNames"
                    placeholder="First Founder, Second Founder"
                    disabled={isPending}
                    maxLength={500}
                    className={FIELD}
                    {...form.register("details.founderNames")}
                  />
                </div>
                <div className="grid gap-2">
                  <FieldLabel
                    htmlFor="coverImageUrl"
                    hint={`Optional · http(s) · max ${STARTUP_URL_MAX}`}
                  >
                    Cover image URL
                  </FieldLabel>
                  <UrlInput
                    id="coverImageUrl"
                    placeholder="example.com/cover.jpg"
                    disabled={isPending}
                    maxLength={STARTUP_URL_MAX}
                    className={FIELD}
                    {...form.register("details.coverImageUrl")}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <FieldLabel
                  htmlFor="publicOutcome"
                  hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                >
                  Approved public outcome
                </FieldLabel>
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
                  <FieldLabel htmlFor="imageFocalX">Image focus X (%)</FieldLabel>
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
                  <FieldLabel htmlFor="imageFocalY">Image focus Y (%)</FieldLabel>
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
            </CardContent>
          </Card>
          </StepperContent>

          <StepperContent value="details" className="space-y-6">
          <Card size="sm" className="min-w-0">
            <CardHeader className="border-b bg-brand-soft">
              <CardTitle>Company details</CardTitle>
              <CardDescription>
                Website, narrative, and funding fields
              </CardDescription>
              <CardAction>
                <AdminFormSectionHelp help={STARTUP_EDITOR_HELP.detailsExtra} />
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4 pb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
                  <FieldLabel
                    htmlFor="websiteUrl"
                    hint={`Optional · http(s) · max ${STARTUP_URL_MAX}`}
                  >
                    Website URL
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="industry"
                    hint={`Optional · max ${STARTUP_TEXT_SHORT_MAX}`}
                  >
                    Industry
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="category"
                    hint={`Optional · max ${STARTUP_TEXT_SHORT_MAX}`}
                  >
                    Category
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="location"
                    hint={`Optional · max ${STARTUP_LOCATION_MAX}`}
                  >
                    Location
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="foundingYear"
                    hint="Optional · 1900–2100"
                  >
                    Founding year
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="size"
                    hint={`Optional · max ${STARTUP_SIZE_MAX}`}
                  >
                    Company size
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="team"
                    hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                  >
                    Team
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="problem"
                    hint={`Optional · max ${STARTUP_LONG_TEXT_MAX}`}
                  >
                    Problem
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="solution"
                    hint={`Optional · max ${STARTUP_LONG_TEXT_MAX}`}
                  >
                    Solution
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="targetMarket"
                    hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                  >
                    Target market
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="businessModel"
                    hint={`Optional · max ${STARTUP_TEAM_MAX}`}
                  >
                    Business model
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="fundingGoal"
                    hint="Optional · number ≥ 0"
                  >
                    Funding goal
                  </FieldLabel>
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
                  <FieldLabel
                    htmlFor="amountRaised"
                    hint="Optional · ≥ 0 · ≤ funding goal"
                  >
                    Amount raised
                  </FieldLabel>
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
            </CardContent>
          </Card>
          </StepperContent>
        </StepperPanel>
      </Stepper>

      <AdminEditorActionsBar>
        <div className="flex w-full flex-col gap-3">
          <AdminImageProcessingBanner active={isProcessingImage} />
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
      </AdminEditorActionsBar>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this startup?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the startup, its details, and logo. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              disabled={isPending}
              onClick={onDelete}
            >
              {isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
    </div>
  );
}
