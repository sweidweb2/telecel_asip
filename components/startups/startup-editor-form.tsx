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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <Label htmlFor={htmlFor}>{children}</Label>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

function emptyDetails(): CreateStartupInput["details"] {
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

function defaultsFromStartup(startup?: StartupWithDetails): CreateStartupInput {
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

  const form = useForm<CreateStartupInput>({
    // zod input/output diverge slightly on optional coercions; cast keeps RHF aligned.
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

  function submit(values: CreateStartupInput) {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createStartup(values);
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
      const result = await updateStartup({ ...values, id: startup.id });
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
      className="mx-auto grid w-full max-w-3xl gap-6"
      onSubmit={form.handleSubmit(submit)}
      noValidate
    >
      <div className="min-w-0">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <FieldLabel htmlFor="name" hint={`Max ${STARTUP_NAME_MAX}`}>
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
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="slug" hint={`Max ${STARTUP_SLUG_MAX}`}>
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
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel
              htmlFor="description"
              hint={`Max ${STARTUP_DESCRIPTION_MAX}`}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (!value) return;
                  form.setValue(
                    "status",
                    value as CreateStartupInput["status"],
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
              <FieldLabel htmlFor="foundedAt">Founded at</FieldLabel>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative aspect-[16/10] w-full max-w-md overflow-hidden rounded-xl border bg-muted">
            {previewSrc ? (
              // Local File preview (blob:) — native img avoids next/image remote rules
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
                  sizes="(max-width: 768px) 100vw, 28rem"
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
            JPEG, PNG, WebP, or GIF up to 5 MB. Uploaded after save on create.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <FieldLabel htmlFor="websiteUrl" hint={`Max ${STARTUP_URL_MAX}`}>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel
                htmlFor="industry"
                hint={`Max ${STARTUP_TEXT_SHORT_MAX}`}
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
                hint={`Max ${STARTUP_TEXT_SHORT_MAX}`}
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel
                htmlFor="location"
                hint={`Max ${STARTUP_LOCATION_MAX}`}
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
              <FieldLabel htmlFor="foundingYear">Founding year</FieldLabel>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="size" hint={`Max ${STARTUP_SIZE_MAX}`}>
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
            <div className="grid gap-2">
              <FieldLabel htmlFor="team" hint={`Max ${STARTUP_TEAM_MAX}`}>
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

          <div className="grid gap-2">
            <FieldLabel htmlFor="problem" hint={`Max ${STARTUP_LONG_TEXT_MAX}`}>
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
            <FieldLabel htmlFor="solution" hint={`Max ${STARTUP_LONG_TEXT_MAX}`}>
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
              hint={`Max ${STARTUP_TEAM_MAX}`}
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
              hint={`Max ${STARTUP_TEAM_MAX}`}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel htmlFor="fundingGoal">Funding goal</FieldLabel>
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
              <FieldLabel htmlFor="amountRaised">Amount raised</FieldLabel>
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
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {mode === "edit" ? (
          <Button
            type="button"
            variant="destructive"
            className="min-h-11"
            disabled={isPending}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="size-4" />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={isPending}
            onClick={() => router.push(ROUTES.portfolio)}
          >
            Cancel
          </Button>
          <Button type="submit" className="min-h-11" disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : null}
            {mode === "create" ? "Create startup" : "Save changes"}
          </Button>
        </div>
      </div>

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
