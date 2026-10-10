"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useWatch } from "react-hook-form";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createBlog,
  deleteBlog,
  removeBlogImage,
  updateBlog,
  uploadAuthorAvatar,
  uploadBlogThumbnail,
} from "@/actions/blogs";
import { loadBlogLinkOptions } from "@/actions/admin-pickers";
import { AdminClearIconButton } from "@/components/dashboard/admin-clear-icon-button";
import { AdminFormDevTools } from "@/components/dashboard/admin-dummy-fill-button";
import { CmsEditorFrame } from "@/components/dashboard/cms-editor-frame";
import { AdminFieldError } from "@/components/dashboard/admin-field-error";
import { AdminFormSection } from "@/components/dashboard/admin-form-section";
import { AdminFormFieldLabel } from "@/components/dashboard/admin-form-layout";
import { AdminImageProcessingBanner } from "@/components/dashboard/admin-image-processing-banner";
import { EntitySelect } from "@/components/dashboard/entity-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dummyBlogValues } from "@/lib/admin/dummy-form-values";

const BlogRichTextEditor = dynamic(
  () =>
    import("@/components/blogs/blog-rich-text-editor").then(
      (mod) => mod.BlogRichTextEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[12rem] rounded-md border bg-muted/40"
        aria-hidden
      />
    ),
  },
);
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
import { Textarea } from "@/components/ui/textarea";
import { RECOMMENDED_BLOG_CATEGORIES } from "@/constants/blog-categories";
import { BLOG_EDITOR_HELP } from "@/constants/blog-editor-help";
import { ROUTES } from "@/constants/routes";
import { useDebouncedOptionSearch } from "@/hooks/use-debounced-option-search";
import { useCmsEditorForm } from "@/hooks/use-cms-editor-form";
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
};

const STREAM_SET = new Set<string>(RECOMMENDED_BLOG_CATEGORIES);

export function BlogEditorForm({
  mode,
  blog,
  startups: initialStartups = [],
  cohorts: initialCohorts = [],
}: BlogEditorFormProps) {
  const router = useRouter();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [sourceDraft, setSourceDraft] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [pendingCover, setPendingCover] = useState<File | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [pendingCoverPreview, setPendingCoverPreview] = useState<string | null>(
    null,
  );
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<
    string | null
  >(null);
  const [removeCoverOnSave, setRemoveCoverOnSave] = useState(false);
  const [removeAvatarOnSave, setRemoveAvatarOnSave] = useState(false);
  const [createdBlogId, setCreatedBlogId] = useState<string | null>(null);
  const isCreateSuccessOpen = Boolean(createdBlogId);
  const [startups, setStartups] = useState(initialStartups);
  const [cohorts, setCohorts] = useState(initialCohorts);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsEnabled, setOptionsEnabled] = useState(
    Boolean(blog?.startup_id || blog?.cohort_id),
  );
  const {
    search: founderSearch,
    setSearch: setFounderSearch,
    debouncedSearch: founderDebouncedSearch,
  } = useDebouncedOptionSearch(optionsEnabled);
  const {
    search: cohortSearch,
    setSearch: setCohortSearch,
    debouncedSearch: cohortDebouncedSearch,
  } = useDebouncedOptionSearch(optionsEnabled);

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

  const editor = useCmsEditorForm<CreateBlogInput>({
    mode,
    schema: createBlogSchema,
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
    recordId: blog?.id,
    listPath: ROUTES.blogs,
    detailPath: (id) => `${ROUTES.blogs}/${id}`,
    create: createBlog,
    update: updateBlog,
    remove: deleteBlog,
    saveError: "The blog could not be saved. Please try again.",
  });
  const { form, isPending, errors } = editor;
  const { register, control, setValue, getValues, reset, clearErrors } = form;

  const title = useWatch({ control, name: "title" });
  const categories = useWatch({ control, name: "categories" }) ?? [];
  const sources = useWatch({ control, name: "sources" }) ?? [];
  const status = useWatch({ control, name: "status" });
  const isFeatured = useWatch({ control, name: "isFeatured" });
  const startupId = useWatch({ control, name: "startupId" });
  const cohortId = useWatch({ control, name: "cohortId" });
  const primaryStream =
    categories[0] && STREAM_SET.has(categories[0]) ? categories[0] : null;

  useEffect(() => {
    if (!optionsEnabled) return;

    let cancelled = false;

    async function loadOptions() {
      setOptionsLoading(true);
      try {
        const result = await loadBlogLinkOptions({
          startupSearch: founderDebouncedSearch,
          cohortSearch: cohortDebouncedSearch,
          includeStartupId: startupId ?? blog?.startup_id,
          includeCohortId: cohortId ?? blog?.cohort_id,
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
  }, [
    optionsEnabled,
    founderDebouncedSearch,
    cohortDebouncedSearch,
    startupId,
    cohortId,
    blog?.startup_id,
    blog?.cohort_id,
  ]);

  function replacePendingCover(file: File | null) {
    setPendingCoverPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPendingCover(file);
  }

  function replacePendingAvatar(file: File | null) {
    setPendingAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setPendingAvatar(file);
  }

  /** First category must be an ASIP stream; other labels stay as free tags. */
  function setPrimaryStream(name: string) {
    const extras = categories.filter(
      (item) => item !== name && !STREAM_SET.has(item),
    );
    setValue("categories", [name, ...extras], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removeCategory(name: string) {
    setValue(
      "categories",
      categories.filter((item) => item !== name),
      { shouldDirty: true, shouldValidate: true },
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
    editor.run(async () => {
      if (mode === "create") {
        const result = await createBlog(values);
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }

        if (result.id && pendingCover) {
          const formData = new FormData();
          formData.set("file", pendingCover);
          setIsProcessingImage(true);
          const uploadToast = toast.loading("Processing image…");
          try {
            const upload = await uploadBlogThumbnail(result.id, formData);
            if (upload.status === "error") {
              toast.error(
                "Blog created, but the cover image could not be processed. Add it from the edit page.",
                { id: uploadToast },
              );
            } else {
              toast.dismiss(uploadToast);
            }
          } finally {
            setIsProcessingImage(false);
          }
        }

        if (result.id && pendingAvatar) {
          const formData = new FormData();
          formData.set("file", pendingAvatar);
          setIsProcessingImage(true);
          const uploadToast = toast.loading("Processing image…");
          try {
            const upload = await uploadAuthorAvatar(result.id, formData);
            if (upload.status === "error") {
              toast.error(
                "Blog created, but the author image could not be processed. Add it from the edit page.",
                { id: uploadToast },
              );
            } else {
              toast.dismiss(uploadToast);
            }
          } finally {
            setIsProcessingImage(false);
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

      if (pendingCover) {
        const formData = new FormData();
        formData.set("file", pendingCover);
        setIsProcessingImage(true);
        const uploadToast = toast.loading("Processing image…");
        try {
          const upload = await uploadBlogThumbnail(blog.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message, { id: uploadToast });
            return;
          }
          toast.dismiss(uploadToast);
        } finally {
          setIsProcessingImage(false);
        }
      } else if (removeCoverOnSave) {
        const remove = await removeBlogImage({
          id: blog.id,
          kind: "thumbnail",
        });
        if (remove.status === "error") {
          toast.error(remove.message);
          return;
        }
      }

      if (pendingAvatar) {
        const formData = new FormData();
        formData.set("file", pendingAvatar);
        setIsProcessingImage(true);
        const uploadToast = toast.loading("Processing image…");
        try {
          const upload = await uploadAuthorAvatar(blog.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message, { id: uploadToast });
            return;
          }
          toast.dismiss(uploadToast);
        } finally {
          setIsProcessingImage(false);
        }
      } else if (removeAvatarOnSave) {
        const remove = await removeBlogImage({ id: blog.id, kind: "author" });
        if (remove.status === "error") {
          toast.error(remove.message);
          return;
        }
      }

      replacePendingCover(null);
      replacePendingAvatar(null);
      setRemoveCoverOnSave(false);
      setRemoveAvatarOnSave(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
      if (avatarInputRef.current) avatarInputRef.current.value = "";

      toast.success(result.message);
      reset(values);
      router.refresh();
    });
  }

  function onPickCover(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (!file) return;
    replacePendingCover(file);
    setRemoveCoverOnSave(false);
  }

  function onPickAvatar(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (!file) return;
    replacePendingAvatar(file);
    setRemoveAvatarOnSave(false);
  }

  function onRemoveCover() {
    replacePendingCover(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (mode === "edit" && blog?.thumbnail_url) {
      setRemoveCoverOnSave(true);
    }
  }

  function onRemoveAvatar() {
    replacePendingAvatar(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    if (mode === "edit" && blog?.author_avatar_url) {
      setRemoveAvatarOnSave(true);
    }
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
    replacePendingAvatar(null);
    setRemoveCoverOnSave(false);
    setRemoveAvatarOnSave(false);
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
    pendingCoverPreview ??
    (removeCoverOnSave ? null : blog?.thumbnail_url ?? null);
  const hasCover = Boolean(coverPreview);
  const avatarPreview =
    pendingAvatarPreview ??
    (removeAvatarOnSave ? null : blog?.author_avatar_url ?? null);
  const hasAvatar = Boolean(avatarPreview);
  const hasPendingMediaChanges = Boolean(
    pendingCover ||
      pendingAvatar ||
      removeCoverOnSave ||
      removeAvatarOnSave,
  );

  return (
    <>
    <CmsEditorFrame
      isPending={isPending}
      isDirty={editor.isDirty}
      onSubmit={(event) => form.handleSubmit(onSubmit)(event)}
      formClassName=""
      toolbar={
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === "published" ? "default" : "secondary"}>
              {status === "published" ? "Published" : "Draft"}
            </Badge>
            {isFeatured ? <Badge variant="outline">Featured</Badge> : null}
          </div>
          <AdminFormDevTools
            disabled={isPending}
            onDummy={() => {
              reset(
                { ...getValues(), ...dummyBlogValues() },
                { keepDefaultValues: true },
              );
              setSlugTouched(true);
            }}
            onClear={() => {
              reset(emptyCreateValues, { keepDefaultValues: true });
              setSlugTouched(false);
              setPendingCover(null);
              setPendingAvatar(null);
              setPendingCoverPreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
              });
              setPendingAvatarPreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
              });
            }}
          />
        </div>
      }
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
            <Button
              type="submit"
              className="min-h-11 w-full sm:ml-auto sm:w-auto"
              disabled={editor.submitDisabled(hasPendingMediaChanges)}
            >
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  {isProcessingImage ? "Processing image…" : "Saving…"}
                </>
              ) : mode === "create" ? (
                "Create blog"
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      }
      deleteDialog={{
        open: editor.deleteOpen,
        onOpenChange: editor.setDeleteOpen,
        title: "Delete this blog?",
        description: blog?.title
          ? `This permanently deletes “${blog.title}”. This cannot be undone.`
          : "This permanently deletes the blog post. This cannot be undone.",
        confirmLabel: "Delete",
        onConfirm: editor.onDelete,
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start lg:gap-8">
        {/* Left: content fields */}
        <div className="grid min-w-0 gap-6">
          <AdminFormSection
            title="Basics"
            description="Title, URL slug, and author byline"
            help={BLOG_EDITOR_HELP.basics}
            contentClassName="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <div className="grid gap-2">
              <AdminFormFieldLabel htmlFor="blog-title" hint={`2–${BLOG_TITLE_MAX} chars`}>
                Title
              </AdminFormFieldLabel>
              <Input
                id="blog-title"
                className="min-h-11"
                placeholder="e.g. Improve your design skills"
                disabled={isPending}
                maxLength={BLOG_TITLE_MAX}
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
                <AdminFieldError message={errors.title.message} />
              ) : null}
            </div>
            <div className="grid gap-2">
              <AdminFormFieldLabel
                htmlFor="blog-slug"
                hint={`2–${BLOG_SLUG_MAX} · a-z 0-9 -`}
              >
                Slug
              </AdminFormFieldLabel>
              <Input
                id="blog-slug"
                className="min-h-11"
                placeholder="e.g. improve-your-design-skills"
                disabled={isPending}
                maxLength={BLOG_SLUG_MAX}
                aria-invalid={Boolean(errors.slug)}
                {...register("slug", {
                  onChange: () => {
                    setSlugTouched(true);
                  },
                })}
              />
              {errors.slug ? (
                <AdminFieldError message={errors.slug.message} />
              ) : null}
            </div>
            <div className="grid gap-2 sm:col-span-2 xl:col-span-1">
              <AdminFormFieldLabel
                htmlFor="blog-author"
                hint={`2–${BLOG_AUTHOR_NAME_MAX} chars`}
              >
                Author
              </AdminFormFieldLabel>
              <Input
                id="blog-author"
                className="min-h-11"
                placeholder="e.g. Amélie Laurent"
                disabled={isPending}
                maxLength={BLOG_AUTHOR_NAME_MAX}
                aria-invalid={Boolean(errors.authorName)}
                {...register("authorName")}
              />
              {errors.authorName ? (
                <AdminFieldError message={errors.authorName.message} />
              ) : null}
            </div>
          </AdminFormSection>

          <AdminFormSection
            title="Summary"
            description="Teaser for cards and default SEO description"
            help={BLOG_EDITOR_HELP.summary}
            contentClassName="grid gap-2"
          >
            <AdminFormFieldLabel
              htmlFor="blog-summary"
              hint={`2–${BLOG_SUMMARY_MAX} chars`}
            >
              Summary
            </AdminFormFieldLabel>
            <Textarea
              id="blog-summary"
              rows={3}
              className="min-h-24"
              placeholder="Short summary shown on cards and search results"
              disabled={isPending}
              maxLength={BLOG_SUMMARY_MAX}
              aria-invalid={Boolean(errors.summary)}
              {...register("summary")}
            />
            {errors.summary ? (
              <AdminFieldError message={errors.summary.message} />
            ) : null}
          </AdminFormSection>

          <AdminFormSection
            title="Body"
            description="Full article content on the Insights detail page"
            help={BLOG_EDITOR_HELP.body}
            contentClassName="grid gap-2"
          >
            <AdminFormFieldLabel hint={`max ${BLOG_BODY_MAX.toLocaleString()} chars`}>
              Body
            </AdminFormFieldLabel>
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
              <AdminFieldError message={errors.bodyHtml.message} />
            ) : null}
          </AdminFormSection>

          <AdminFormSection
            title="Related & SEO"
            description="Optional founder/cohort links, sources, and search metadata"
            help={BLOG_EDITOR_HELP.relatedSeo}
            contentClassName="grid gap-4 sm:grid-cols-2"
          >
              <div className="grid gap-2">
                <AdminFormFieldLabel htmlFor="blog-startup">Related founder</AdminFormFieldLabel>
                <Controller
                  control={control}
                  name="startupId"
                  render={({ field }) => (
                    <EntitySelect
                      id="blog-startup"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={startups.map((startup) => ({
                        id: startup.id,
                        label: startup.name,
                      }))}
                      placeholder={
                        optionsLoading
                          ? "Loading…"
                          : startups.length === 0
                            ? "No startups available"
                            : "None"
                      }
                      disabled={isPending}
                      onOpenChange={(open) => {
                        if (open) setOptionsEnabled(true);
                      }}
                      clearable
                      clearLabel="Clear founder"
                      searchValue={founderSearch}
                      onSearchChange={setFounderSearch}
                      searchPlaceholder="Search founders…"
                      emptyMessage={
                        optionsLoading
                          ? "Loading…"
                          : founderSearch.trim()
                            ? "No founders match"
                            : "No startups available"
                      }
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <AdminFormFieldLabel htmlFor="blog-cohort">Related cohort</AdminFormFieldLabel>
                <Controller
                  control={control}
                  name="cohortId"
                  render={({ field }) => (
                    <EntitySelect
                      id="blog-cohort"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={cohorts.map((cohort) => ({
                        id: cohort.id,
                        label: cohort.label,
                      }))}
                      placeholder={
                        optionsLoading
                          ? "Loading…"
                          : cohorts.length === 0
                            ? "No cohorts available"
                            : "None"
                      }
                      disabled={isPending}
                      onOpenChange={(open) => {
                        if (open) setOptionsEnabled(true);
                      }}
                      clearable
                      clearLabel="Clear cohort"
                      searchValue={cohortSearch}
                      onSearchChange={setCohortSearch}
                      searchPlaceholder="Search cohorts…"
                      emptyMessage={
                        optionsLoading
                          ? "Loading…"
                          : cohortSearch.trim()
                            ? "No cohorts match"
                            : "No cohorts available"
                      }
                    />
                  )}
                />
              </div>

              <div className="grid gap-2">
                <AdminFormFieldLabel htmlFor="blog-meta-title" hint={`max ${BLOG_META_TITLE_MAX}`}>
                  Meta title
                </AdminFormFieldLabel>
                <Input
                  id="blog-meta-title"
                  className="min-h-11"
                  maxLength={BLOG_META_TITLE_MAX}
                  disabled={isPending}
                  placeholder="e.g. Improve your design skills"
                  {...register("metaTitle")}
                />
                {errors.metaTitle ? (
                  <AdminFieldError message={errors.metaTitle.message} />
                ) : null}
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <AdminFormFieldLabel
                  htmlFor="blog-meta-description"
                  hint={`max ${BLOG_META_DESCRIPTION_MAX}`}
                >
                  Meta description
                </AdminFormFieldLabel>
                <Textarea
                  id="blog-meta-description"
                  rows={3}
                  maxLength={BLOG_META_DESCRIPTION_MAX}
                  disabled={isPending}
                  placeholder="Short description for search results"
                  {...register("metaDescription")}
                />
                {errors.metaDescription ? (
                  <AdminFieldError message={errors.metaDescription.message} />
                ) : null}
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <AdminFormFieldLabel hint={`up to ${BLOG_SOURCES_MAX} · max ${BLOG_SOURCE_MAX} chars`}>
                  Sources
                </AdminFormFieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    className="min-h-11"
                    placeholder="URL or citation, then Add"
                    value={sourceDraft}
                    disabled={isPending}
                    maxLength={BLOG_SOURCE_MAX}
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
                <AdminFieldError
                  message={
                    errors.sources?.message ?? errors.sources?.root?.message
                  }
                />
              </div>
          </AdminFormSection>

          <div className="grid gap-6 sm:grid-cols-2">
            <AdminFormSection
              title="Publishing"
              description="Visibility and featured placement"
              help={BLOG_EDITOR_HELP.publishing}
              contentClassName="grid gap-4"
            >
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
                    Featured (only one at a time)
                  </Label>
                </div>
                {errors.isFeatured ? (
                  <AdminFieldError message={errors.isFeatured.message} />
                ) : null}
            </AdminFormSection>

            <AdminFormSection
              title="Author avatar"
              description="JPEG/PNG/WebP/GIF · max 2MB"
              help={BLOG_EDITOR_HELP.authorAvatar}
            >
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => onPickAvatar(event.target.files)}
                />
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative size-20 shrink-0">
                    <div className="relative size-full overflow-hidden rounded-full border bg-muted">
                      {avatarPreview ? (
                        pendingAvatarPreview ? (
                          // Local File preview (blob:) — native img avoids next/image remote rules
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarPreview}
                            alt={
                              title
                                ? `${title} author avatar preview`
                                : "Author avatar preview"
                            }
                            className="size-full object-cover"
                          />
                        ) : (
                          <Image
                            src={avatarPreview}
                            alt={
                              title
                                ? `${title} author avatar`
                                : "Author avatar"
                            }
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        )
                      ) : (
                        <p className="flex size-full items-center justify-center px-2 text-center text-[0.65rem] leading-tight text-muted-foreground">
                          No avatar
                        </p>
                      )}
                    </div>
                    {hasAvatar ? (
                      <AdminClearIconButton
                        label="Clear avatar"
                        disabled={isPending}
                        className="-top-1 -right-1"
                        onClick={onRemoveAvatar}
                      />
                    ) : null}
                  </div>
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
                </div>
            </AdminFormSection>
          </div>
        </div>

        {/* Right: cover + categories */}
        <aside className="grid gap-6 lg:sticky lg:top-4">
          <AdminFormSection
            title="Cover image"
            description="JPEG/PNG/WebP/GIF · max 5MB"
            help={BLOG_EDITOR_HELP.cover}
            headerAction={
              <>
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
              </>
            }
          >
              <div className="relative aspect-[1.5] w-full overflow-hidden rounded-lg bg-muted">
                {coverPreview ? (
                  pendingCoverPreview ? (
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
                {hasCover ? (
                  <AdminClearIconButton
                    label="Clear cover image"
                    disabled={isPending}
                    onClick={onRemoveCover}
                  />
                ) : null}
              </div>
              <AdminImageProcessingBanner active={isProcessingImage} />
          </AdminFormSection>

          <AdminFormSection
            title="Categories"
            description={`First category must be an Insights stream · extra free tags allowed · up to ${BLOG_CATEGORIES_MAX} · each max ${BLOG_CATEGORY_MAX} chars`}
            help={BLOG_EDITOR_HELP.categories}
            contentClassName="grid gap-4"
          >
              {!primaryStream && categories.length > 0 ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  This post’s first category is not an ASIP stream (often from
                  older seed data). Click one of the five streams below to fix
                  it before saving.
                </p>
              ) : null}
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
                    shouldDirty: true,
                    shouldValidate: true,
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
              <AdminFieldError
                message={
                  typeof errors.categories?.message === "string"
                    ? errors.categories.message
                    : (errors.categories?.root?.message ??
                      errors.categories?.[0]?.message)
                }
              />
          </AdminFormSection>
        </aside>
      </div>

    </CmsEditorFrame>

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
    </>
  );
}
