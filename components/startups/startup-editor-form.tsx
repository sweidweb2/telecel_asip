"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { useForm, useWatch } from "react-hook-form";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Card, CardContent } from "@/components/ui/card";
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
import { ROUTES } from "@/constants/routes";
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

type StartupEditorFormProps = {
  mode: "create" | "edit";
  startup?: StartupWithDetails;
  heading: string;
  description: string;
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
      foundedAt: "",
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
  description,
}: StartupEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<StartupFormValues>({
    resolver: zodResolver(createStartupSchema) as never,
    defaultValues: defaultsFromStartup(startup),
    mode: "onBlur",
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
          const upload = await uploadStartupLogo(result.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message);
            router.push(`${ROUTES.portfolio}/${result.id}`);
            router.refresh();
            return;
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
        const upload = await uploadStartupLogo(startup.id, formData);
        if (upload.status === "error") {
          toast.error(upload.message);
          return;
        }
        setPendingLogo(null);
        if (pendingLogoPreview) URL.revokeObjectURL(pendingLogoPreview);
        setPendingLogoPreview(null);
      }
      toast.success(result.message);
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

  const errors = form.formState.errors;

  return (
    <form
      className="mx-auto grid w-full max-w-6xl gap-6"
      onSubmit={form.handleSubmit(submit)}
      noValidate
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:justify-end">
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
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create startup" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
        <section className="min-w-0 space-y-4" aria-labelledby="startup-core-heading">
          <h3
            id="startup-core-heading"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Core
          </h3>
          <div className="grid gap-4">
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
                  className="min-h-11"
                  disabled={isPending}
                  {...form.register("name", {
                    onChange: (event) => onNameChange(event.target.value),
                  })}
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
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
                  className="min-h-11"
                  disabled={isPending}
                  {...form.register("slug", {
                    onChange: () => setSlugTouched(true),
                  })}
                />
                {errors.slug ? (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
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
                className="min-h-28"
                disabled={isPending}
                {...form.register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
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
                  <SelectTrigger id="status" className="min-h-11 w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status ? (
                  <p className="text-sm text-destructive">
                    {errors.status.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="foundedAt" hint="Optional · YYYY-MM-DD">
                  Founded at
                </FieldLabel>
                <Input
                  id="foundedAt"
                  type="date"
                  className="min-h-11"
                  disabled={isPending}
                  {...form.register("foundedAt")}
                />
                {errors.foundedAt ? (
                  <p className="text-sm text-destructive">
                    {errors.foundedAt.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-4" aria-labelledby="startup-logo-heading">
          <h3
            id="startup-logo-heading"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Logo
          </h3>
          <div className="grid gap-4">
            <FieldLabel hint="JPEG / PNG / WebP / GIF · max 5 MB">
              Image
            </FieldLabel>
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
              {mode === "edit" && logoUrl && !pendingLogo ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  disabled={isPending}
                  onClick={onRemoveLogo}
                >
                  Remove logo
                </Button>
              ) : null}
              {pendingLogo ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  disabled={isPending}
                  onClick={() => onLogoPicked(null)}
                >
                  Clear selection
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. On create, the file uploads after the startup is saved.
            </p>
          </div>
        </section>
      </div>

      <Card className="min-w-0 overflow-hidden py-0">
        <CardContent className="px-4 py-3 sm:px-6 sm:py-4">
          <Accordion
            defaultValue={mode === "edit" ? ["details"] : []}
            className="min-w-0"
          >
            <AccordionItem value="details" className="border-none">
              <AccordionTrigger className="min-h-0 items-center py-1 px-0 hover:no-underline">
                <span className="flex min-w-0 flex-col items-start gap-0.5 text-left">
                  <span className="font-heading text-lg font-semibold tracking-tight">
                    Details
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Optional — expand to add website, funding, and more (can stay
                    empty)
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pt-0">
                <div className="grid gap-4 pt-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
              <FieldLabel
                htmlFor="websiteUrl"
                hint={`Optional · http(s) · max ${STARTUP_URL_MAX}`}
              >
                Website URL
              </FieldLabel>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://"
                className="min-h-11"
                disabled={isPending}
                {...form.register("details.websiteUrl")}
              />
              {errors.details?.websiteUrl ? (
                <p className="text-sm text-destructive">
                  {errors.details.websiteUrl.message}
                </p>
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
                className="min-h-11"
                disabled={isPending}
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
                className="min-h-11"
                disabled={isPending}
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
                className="min-h-11"
                disabled={isPending}
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
                className="min-h-11"
                disabled={isPending}
                {...form.register("details.foundingYear")}
              />
              {errors.details?.foundingYear ? (
                <p className="text-sm text-destructive">
                  {errors.details.foundingYear.message}
                </p>
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
                className="min-h-11"
                disabled={isPending}
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
                className="min-h-11"
                disabled={isPending}
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
                className="min-h-24"
                disabled={isPending}
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
                className="min-h-24"
                disabled={isPending}
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
                className="min-h-20"
                disabled={isPending}
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
                className="min-h-20"
                disabled={isPending}
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
                className="min-h-11"
                disabled={isPending}
                {...form.register("details.fundingGoal")}
              />
              {errors.details?.fundingGoal ? (
                <p className="text-sm text-destructive">
                  {errors.details.fundingGoal.message}
                </p>
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
                className="min-h-11"
                disabled={isPending}
                {...form.register("details.amountRaised")}
              />
              {errors.details?.amountRaised ? (
                <p className="text-sm text-destructive">
                  {errors.details.amountRaised.message}
                </p>
              ) : null}
            </div>
          </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

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
  );
}
