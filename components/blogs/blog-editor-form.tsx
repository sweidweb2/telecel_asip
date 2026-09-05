"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createBlog,
  deleteBlog,
  loadBlogLinkOptions,
  removeBlogImage,
  updateBlog,
  uploadAuthorAvatar,
  uploadBlogThumbnail,
} from "@/actions/blogs";
import { BlogRichTextEditor } from "@/components/blogs/blog-rich-text-editor";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { RECOMMENDED_BLOG_CATEGORIES } from "@/constants/blog-categories";
import { ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { slugifyTitle } from "@/lib/blog-utils";
import type { Blog } from "@/types/blog";
import {
  BLOG_AUTHOR_NAME_MAX,
  BLOG_BODY_MAX,
  BLOG_CATEGORIES_MAX,
  BLOG_CATEGORY_MAX,
  BLOG_META_DESCRIPTION_MAX,
  BLOG_META_TITLE_MAX,
  BLOG_SLUG_MAX,
  BLOG_SOURCE_MAX,
  BLOG_SOURCES_MAX,
  BLOG_SUMMARY_MAX,
  BLOG_TITLE_MAX,
  createBlogSchema,
  type CreateBlogInput,
} from "@/validations/blog";

type BlogLinkOption = { id: string; name: string };

type BlogEditorFormProps = {
  mode: "create" | "edit";
  blog?: Blog;
  /** Optional seed; editor lazy-loads / searches the rest. */
  startups?: BlogLinkOption[];
  cohorts?: { id: string; label: string }[];
  heading: string;
  description: string;
};

const STREAM_SET = new Set<string>(RECOMMENDED_BLOG_CATEGORIES);

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

export function BlogEditorForm({
  mode,
  blog,
  startups: initialStartups = [],
  cohorts: initialCohorts = [],
  heading,
  description,
}: BlogEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(false);
  const [sourceDraft, setSourceDraft] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(
    null,
  );
  const [createdBlogId, setCreatedBlogId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isCreateSuccessOpen = Boolean(createdBlogId);
  const [startups, setStartups] = useState(initialStartups);
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const { search: optionSearch, setSearch: setOptionSearch, debouncedSearch } =
    useDebouncedOptionSearch(true);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const result = await loadBlogLinkOptions({
          search: debouncedSearch,
          includeStartupId: blog?.startup_id,
          includeCohortId: blog?.cohort_id,
        });
        if (cancelled) return;
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        setStartups(result.startups);
        setCohorts(result.cohorts);
      } catch {
        if (!cancelled) {
          toast.error("Could not load link options. Please try again.");
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, blog?.startup_id, blog?.cohort_id]);

  const emptyCreateValues: CreateBlogInput = {
    title: "",
    slug: "",
    summary: "",
    bodyHtml: "",
    categories: [],
    authorName: "",
    status: "draft",
    isFeatured: false,
    startupId: null,
    cohortId: null,
    sources: [],
    metaTitle: null,
    metaDescription: null,
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<CreateBlogInput>({
    resolver: zodResolver(createBlogSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      summary: blog?.summary ?? "",
      bodyHtml: blog?.body_html ?? "",
      categories: blog?.categories ?? [],
      authorName: blog?.author_name ?? "",
      status: blog?.status ?? "draft",
      isFeatured: blog?.is_featured ?? false,
      startupId: blog?.startup_id ?? null,
      cohortId: blog?.cohort_id ?? null,
      sources: blog?.sources ?? [],
      metaTitle: blog?.meta_title ?? null,
      metaDescription: blog?.meta_description ?? null,
    },
  });

  const title = useWatch({ control, name: "title" });
  const categories = useWatch({ control, name: "categories" }) ?? [];
  const sources = useWatch({ control, name: "sources" }) ?? [];
  const status = useWatch({ control, name: "status" });
  const isFeatured = useWatch({ control, name: "isFeatured" });
  const startupId = useWatch({ control, name: "startupId" });
  const cohortId = useWatch({ control, name: "cohortId" });
  const primaryStream =
    categories[0] && STREAM_SET.has(categories[0]) ? categories[0] : null;

  function replacePendingCover(file: File | null) {
    setPendingCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPendingCover(file);
  }

  /** First category must be an ASIP stream; other labels stay as free tags. */
  function setPrimaryStream(name: string) {
    const extras = categories.filter(
      (item) => item !== name && !STREAM_SET.has(item),
    );
    setValue("categories", [name, ...extras], { shouldValidate: false });
  }

  function removeCategory(name: string) {
    setValue(
      "categories",
      categories.filter((item) => item !== name),
      { shouldValidate: false },
    );
  }

  function addSource() {
    const value = sourceDraft.trim();
    if (!value || sources.includes(value) || sources.length >= BLOG_SOURCES_MAX) {
      return;
    }
    setValue("sources", [...sources, value], { shouldValidate: false });
    setSourceDraft("");
  }

  function removeSource(name: string) {
    setValue(
      "sources",
      sources.filter((item) => item !== name),
      { shouldValidate: false },
    );
  }

  function onSubmit(values: CreateBlogInput) {
    startTransition(async () => {
      if (mode === "create") {
        const result = await createBlog(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        if (result.id && pendingCover) {
          const formData = new FormData();
          formData.set("file", pendingCover);
          const uploadToast = toast.loading("Uploading image…");
          const upload = await uploadBlogThumbnail(result.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message, { id: uploadToast });
          } else {
            toast.dismiss(uploadToast);
          }
        }

        if (result.id && pendingAvatar) {
          const formData = new FormData();
          formData.set("file", pendingAvatar);
          const uploadToast = toast.loading("Uploading image…");
          const upload = await uploadAuthorAvatar(result.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message, { id: uploadToast });
          } else {
            toast.dismiss(uploadToast);
          }
        }

        toast.success(result.message);
        if (result.id) {
          setCreatedBlogId(result.id);
          router.refresh();
        }
        return;
      }

      if (!blog) return;
      const result = await updateBlog({ ...values, id: blog.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function onDelete() {
    if (!blog) return;
    startTransition(async () => {
      const result = await deleteBlog({ id: blog.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      setIsDeleteOpen(false);
      toast.success(result.message);
      router.push(ROUTES.blogs);
      router.refresh();
    });
  }

  function onPickCover(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (mode === "create") {
      replacePendingCover(file);
      return;
    }
    if (!blog || !file) return;
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const uploadToast = toast.loading("Uploading image…");
      const result = await uploadBlogThumbnail(blog.id, formData);
      if (result.status === "error") {
        toast.error(result.message, { id: uploadToast });
        return;
      }
      toast.success(result.message, { id: uploadToast });
      router.refresh();
    });
  }

  function onPickAvatar(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (mode === "create") {
      setPendingAvatar(file);
      return;
    }
    if (!blog || !file) return;
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const uploadToast = toast.loading("Uploading image…");
      const result = await uploadAuthorAvatar(blog.id, formData);
      if (result.status === "error") {
        toast.error(result.message, { id: uploadToast });
        return;
      }
      toast.success(result.message, { id: uploadToast });
      router.refresh();
    });
  }

  function onRemoveCover() {
    if (mode === "create") {
      replacePendingCover(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }
    if (!blog) return;
    startTransition(async () => {
      const result = await removeBlogImage({ id: blog.id, kind: "thumbnail" });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function onRemoveAvatar() {
    if (mode === "create") {
      setPendingAvatar(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }
    if (!blog) return;
    startTransition(async () => {
      const result = await removeBlogImage({ id: blog.id, kind: "author" });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function goToCreatedBlog() {
    if (!createdBlogId) return;
    router.push(`${ROUTES.blogs}/${createdBlogId}`);
    router.refresh();
  }

  function continueCreating() {
    setCreatedBlogId(null);
    setSlugTouched(false);
    replacePendingCover(null);
    setPendingAvatar(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    reset(emptyCreateValues);
    clearErrors();
    router.push(ROUTES.blogsNew);
    router.refresh();
  }

  function goToBlogsList() {
    setCreatedBlogId(null);
    router.push(ROUTES.blogs);
    router.refresh();
  }

  const coverPreview =
    mode === "create" ? pendingCoverPreview : blog?.thumbnail_url ?? null;
  const hasCover = Boolean(coverPreview);
  const avatarFileLabel =
    mode === "create"
      ? pendingAvatar?.name ?? null
      : blog?.author_avatar_url
        ? "Avatar uploaded"
        : null;
  const hasAvatar = Boolean(
    mode === "create" ? pendingAvatar : blog?.author_avatar_url,
  );

  return (
    <>
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {heading}
            </h2>
            <Badge variant={status === "published" ? "default" : "secondary"}>
              {status === "published" ? "Published" : "Draft"}
            </Badge>
            {isFeatured ? <Badge variant="outline">Featured hero</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              disabled={isPending}
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          ) : null}
          <Button type="submit" className="min-h-11" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="animate-spin" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create blog"
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start">
        {/* Left: content fields */}
        <div className="grid min-w-0 gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-2">
              <FieldLabel htmlFor="blog-title" hint={`2–${BLOG_TITLE_MAX} chars`}>
                Title
              </FieldLabel>
              <Input
                id="blog-title"
                className="min-h-11"
                placeholder="e.g. Improve your design skills"
                disabled={isPending}
                aria-invalid={Boolean(errors.title)}
                {...register("title", {
                  onChange: (event) => {
                    if (mode === "create" && !slugTouched) {
                      setValue("slug", slugifyTitle(event.target.value), {
                        shouldValidate: false,
                      });
                    }
                  },
                })}
              />
              {errors.title ? (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <FieldLabel
                htmlFor="blog-slug"
                hint={`2–${BLOG_SLUG_MAX} · a-z 0-9 -`}
              >
                Slug
              </FieldLabel>
              <Input
                id="blog-slug"
                className="min-h-11"
                placeholder="e.g. improve-your-design-skills"
                disabled={isPending}
                aria-invalid={Boolean(errors.slug)}
                {...register("slug", {
                  onChange: () => {
                    setSlugTouched(true);
                  },
                })}
              />
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2 sm:col-span-2 xl:col-span-1">
              <FieldLabel
                htmlFor="blog-author"
                hint={`2–${BLOG_AUTHOR_NAME_MAX} chars`}
              >
                Author
              </FieldLabel>
              <Input
                id="blog-author"
                className="min-h-11"
                placeholder="e.g. Amélie Laurent"
                disabled={isPending}
                aria-invalid={Boolean(errors.authorName)}
                {...register("authorName")}
              />
              {errors.authorName ? (
                <p className="text-sm text-destructive">
                  {errors.authorName.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <FieldLabel
              htmlFor="blog-summary"
              hint={`2–${BLOG_SUMMARY_MAX} chars`}
            >
              Summary
            </FieldLabel>
            <Textarea
              id="blog-summary"
              rows={3}
              className="min-h-24"
              placeholder="Short summary shown on cards and search results"
              disabled={isPending}
              aria-invalid={Boolean(errors.summary)}
              {...register("summary")}
            />
            {errors.summary ? (
              <p className="text-sm text-destructive">{errors.summary.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FieldLabel hint={`max ${BLOG_BODY_MAX.toLocaleString()} chars`}>
              Body
            </FieldLabel>
            <Controller
              name="bodyHtml"
              control={control}
              render={({ field }) => (
                <BlogRichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  placeholder="Write the article body…"
                />
              )}
            />
            {errors.bodyHtml ? (
              <p className="text-sm text-destructive">
                {errors.bodyHtml.message}
              </p>
            ) : null}
          </div>

          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Related & SEO</CardTitle>
              <p className="text-xs text-muted-foreground">
                Optional founder/cohort links, sources, and search metadata
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <FieldLabel htmlFor="blog-link-search">
                  Search founders & cohorts
                </FieldLabel>
                <Input
                  id="blog-link-search"
                  value={optionSearch}
                  onChange={(event) => setOptionSearch(event.target.value)}
                  maxLength={100}
                  placeholder="Search by name…"
                  className="min-h-11"
                  disabled={isPending}
                />
              </div>
              <div className="grid gap-2">
                <FieldLabel htmlFor="blog-startup">Related founder</FieldLabel>
                <Controller
                  control={control}
                  name="startupId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) =>
                        field.onChange(value && value.length > 0 ? value : null)
                      }
                      disabled={isPending || optionsLoading}
                    >
                      <SelectTrigger id="blog-startup" className="min-h-11 w-full">
                        <SelectValue
                          placeholder={
                            optionsLoading
                              ? "Loading…"
                              : startups.length === 0
                                ? "No startups available"
                                : "None"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {startups.map((startup) => (
                          <SelectItem key={startup.id} value={startup.id}>
                            {startup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {startupId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11 w-fit"
                    disabled={isPending}
                    onClick={() =>
                      setValue("startupId", null, { shouldValidate: false })
                    }
                  >
                    Clear founder
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="blog-cohort">Related cohort</FieldLabel>
                <Controller
                  control={control}
                  name="cohortId"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(value) =>
                        field.onChange(value && value.length > 0 ? value : null)
                      }
                      disabled={isPending || optionsLoading}
                    >
                      <SelectTrigger id="blog-cohort" className="min-h-11 w-full">
                        <SelectValue
                          placeholder={
                            optionsLoading
                              ? "Loading…"
                              : cohorts.length === 0
                                ? "No cohorts available"
                                : "None"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cohorts.map((cohort) => (
                          <SelectItem key={cohort.id} value={cohort.id}>
                            {cohort.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {cohortId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-11 w-fit"
                    disabled={isPending}
                    onClick={() =>
                      setValue("cohortId", null, { shouldValidate: false })
                    }
                  >
                    Clear cohort
                  </Button>
                ) : null}
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="blog-meta-title" hint={`max ${BLOG_META_TITLE_MAX}`}>
                  Meta title
                </FieldLabel>
                <Input
                  id="blog-meta-title"
                  className="min-h-11"
                  maxLength={BLOG_META_TITLE_MAX}
                  disabled={isPending}
                  {...register("metaTitle")}
                />
                {errors.metaTitle ? (
                  <p className="text-sm text-destructive">
                    {errors.metaTitle.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <FieldLabel
                  htmlFor="blog-meta-description"
                  hint={`max ${BLOG_META_DESCRIPTION_MAX}`}
                >
                  Meta description
                </FieldLabel>
                <Textarea
                  id="blog-meta-description"
                  rows={3}
                  maxLength={BLOG_META_DESCRIPTION_MAX}
                  disabled={isPending}
                  {...register("metaDescription")}
                />
                {errors.metaDescription ? (
                  <p className="text-sm text-destructive">
                    {errors.metaDescription.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <FieldLabel hint={`up to ${BLOG_SOURCES_MAX} · max ${BLOG_SOURCE_MAX} chars`}>
                  Sources
                </FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    className="min-h-11"
                    placeholder="URL or citation, then Add"
                    value={sourceDraft}
                    disabled={isPending}
                    onChange={(event) => setSourceDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSource();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 w-full sm:w-auto"
                    disabled={isPending}
                    onClick={addSource}
                  >
                    Add
                  </Button>
                </div>
                {sources.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {sources.map((source) => (
                      <li key={source}>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="min-h-11 max-w-full truncate"
                          disabled={isPending}
                          onClick={() => removeSource(source)}
                        >
                          {source} ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {errors.sources ? (
                  <p className="text-sm text-destructive">
                    {errors.sources.message ?? errors.sources.root?.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card size="sm" className="min-w-0">
              <CardHeader className="border-b">
                <CardTitle>Publishing</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Visibility and hero placement
                </p>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="blog-published"
                        checked={field.value === "published"}
                        disabled={isPending}
                        onCheckedChange={(checked) => {
                          const next =
                            checked === true ? "published" : "draft";
                          field.onChange(next);
                          if (next === "draft") {
                            setValue("isFeatured", false, {
                              shouldDirty: true,
                            });
                          }
                        }}
                        className="size-5"
                      />
                    )}
                  />
                  <Label htmlFor="blog-published" className="font-normal">
                    Published (visible on Insights)
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="blog-featured"
                        checked={field.value}
                        disabled={isPending || status !== "published"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        className="size-5"
                      />
                    )}
                  />
                  <Label
                    htmlFor="blog-featured"
                    className={
                      status !== "published"
                        ? "font-normal text-muted-foreground"
                        : "font-normal"
                    }
                  >
                    Featured hero (only one at a time)
                  </Label>
                </div>
                {errors.isFeatured ? (
                  <p className="text-sm text-destructive">
                    {errors.isFeatured.message}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card size="sm" className="min-w-0">
              <CardHeader className="border-b">
                <CardTitle>Author avatar</CardTitle>
                <p className="text-xs text-muted-foreground">
                  JPEG/PNG/WebP/GIF · max 2MB
                </p>
              </CardHeader>
              <CardContent>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => onPickAvatar(event.target.files)}
                />
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 shrink-0"
                    disabled={isPending}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <UploadIcon className="size-4" />
                    {hasAvatar ? "Replace" : "Choose file"}
                  </Button>
                  {hasAvatar ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-11 shrink-0"
                      disabled={isPending}
                      onClick={onRemoveAvatar}
                    >
                      Remove
                    </Button>
                  ) : null}
                  <span className="min-w-0 truncate text-sm text-muted-foreground">
                    {avatarFileLabel ?? "No file selected"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right: cover + categories */}
        <aside className="grid gap-4 lg:sticky lg:top-4">
          <Card size="sm">
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle>Cover image</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    JPEG/PNG/WebP/GIF · max 5MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => onPickCover(event.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11"
                    disabled={isPending}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <UploadIcon className="size-4" />
                    Upload
                  </Button>
                  {hasCover ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="min-h-11"
                      disabled={isPending}
                      onClick={onRemoveCover}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[1.5] w-full overflow-hidden rounded-lg bg-muted">
                {coverPreview ? (
                  mode === "create" ? (
                    // Local File preview (blob:) — native img avoids next/image remote rules
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPreview}
                      alt={title || "Cover preview"}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <Image
                      src={coverPreview}
                      alt={title || "Cover preview"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 22rem"
                    />
                  )
                ) : (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No cover yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle>Categories</CardTitle>
              <p className="text-xs text-muted-foreground">
                First category must be an Insights stream · extra free tags
                allowed · up to {BLOG_CATEGORIES_MAX} · each max{" "}
                {BLOG_CATEGORY_MAX} chars
              </p>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {RECOMMENDED_BLOG_CATEGORIES.map((name) => {
                  const active = primaryStream === name;
                  return (
                    <Button
                      key={name}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="min-h-11"
                      disabled={isPending}
                      onClick={() => setPrimaryStream(name)}
                    >
                      {name}
                    </Button>
                  );
                })}
              </div>
              <Input
                className="min-h-11"
                placeholder="Add custom tag and press Enter"
                disabled={isPending}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  const value = event.currentTarget.value.trim();
                  if (!value || categories.includes(value)) return;
                  if (!primaryStream) {
                    toast.error("Pick a content stream first");
                    return;
                  }
                  setValue("categories", [...categories, value], {
                    shouldValidate: false,
                  });
                  event.currentTarget.value = "";
                }}
              />
              {categories.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {categories.map((name, index) => (
                    <li key={`${name}-${index}`}>
                      <Button
                        type="button"
                        size="sm"
                        variant={index === 0 ? "default" : "secondary"}
                        className="min-h-11"
                        disabled={isPending || index === 0}
                        onClick={() => removeCategory(name)}
                      >
                        {index === 0 ? `${name} (stream)` : `${name} ×`}
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {errors.categories ? (
                <p className="text-sm text-destructive">
                  {typeof errors.categories.message === "string"
                    ? errors.categories.message
                    : errors.categories.root?.message ??
                      errors.categories[0]?.message}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>

    <Dialog
      open={isCreateSuccessOpen}
      onOpenChange={(open) => {
        if (!open) goToBlogsList();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Blog created</DialogTitle>
          <DialogDescription>
            Your post was saved. What would you like to do next?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-stretch">
          <Button
            type="button"
            className="min-h-11 w-full"
            onClick={goToCreatedBlog}
          >
            Edit this post
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            onClick={continueCreating}
          >
            Create another
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full"
            onClick={goToBlogsList}
          >
            Back to blogs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AdminDeleteDialog
      open={isDeleteOpen}
      onOpenChange={setIsDeleteOpen}
      showTrigger={false}
      title="Delete this blog?"
      description={
        blog?.title
          ? `This permanently deletes “${blog.title}”. This cannot be undone.`
          : "This permanently deletes the blog post. This cannot be undone."
      }
      confirmLabel="Delete"
      isPending={isPending}
      onConfirm={onDelete}
    />
    </>
  );
}
