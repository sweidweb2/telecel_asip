"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { BlogRichTextEditor } from "@/components/blogs/blog-rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RECOMMENDED_BLOG_CATEGORIES } from "@/constants/blog-categories";
import { ROUTES } from "@/constants/routes";
import { slugifyTitle } from "@/lib/blog-utils";
import type { Blog } from "@/types/blog";
import {
  BLOG_AUTHOR_NAME_MAX,
  BLOG_BODY_MAX,
  BLOG_CATEGORIES_MAX,
  BLOG_CATEGORY_MAX,
  BLOG_SLUG_MAX,
  BLOG_SUMMARY_MAX,
  BLOG_TITLE_MAX,
  createBlogSchema,
  type CreateBlogInput,
} from "@/validations/blog";

type BlogEditorFormProps = {
  mode: "create" | "edit";
  blog?: Blog;
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

export function BlogEditorForm({
  mode,
  blog,
  heading,
  description,
}: BlogEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(false);
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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBlogInput>({
    resolver: zodResolver(createBlogSchema),
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      summary: blog?.summary ?? "",
      bodyHtml: blog?.body_html ?? "",
      categories: blog?.categories ?? [],
      authorName: blog?.author_name ?? "",
      status: blog?.status ?? "draft",
      isFeatured: blog?.is_featured ?? false,
    },
  });

  const title = watch("title");
  const categories = watch("categories");
  const status = watch("status");
  const isFeatured = watch("isFeatured");

  useEffect(() => {
    if (mode === "create" && !slugTouched.current && title) {
      setValue("slug", slugifyTitle(title), { shouldValidate: true });
    }
  }, [mode, setValue, title]);

  useEffect(() => {
    if (!pendingCover) {
      setPendingCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingCover);
    setPendingCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingCover]);

  useEffect(() => {
    if (!pendingAvatar) {
      setPendingAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingAvatar);
    setPendingAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingAvatar]);

  function toggleCategory(name: string) {
    const next = categories.includes(name)
      ? categories.filter((item) => item !== name)
      : [...categories, name];
    setValue("categories", next, { shouldValidate: true });
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
          const upload = await uploadBlogThumbnail(result.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message);
          }
        }

        if (result.id && pendingAvatar) {
          const formData = new FormData();
          formData.set("file", pendingAvatar);
          const upload = await uploadAuthorAvatar(result.id, formData);
          if (upload.status === "error") {
            toast.error(upload.message);
          }
        }

        toast.success(result.message);
        if (result.id) {
          router.push(`${ROUTES.blogs}/${result.id}`);
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
    if (!window.confirm("Delete this blog post? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteBlog({ id: blog.id });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push(ROUTES.blogs);
      router.refresh();
    });
  }

  function onPickCover(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (mode === "create") {
      setPendingCover(file);
      return;
    }
    if (!blog || !file) return;
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadBlogThumbnail(blog.id, formData);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
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
      const result = await uploadAuthorAvatar(blog.id, formData);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  function onRemoveCover() {
    if (mode === "create") {
      setPendingCover(null);
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

  const coverPreview =
    mode === "create" ? pendingCoverPreview : blog?.thumbnail_url ?? null;
  const avatarPreview =
    mode === "create" ? pendingAvatarPreview : blog?.author_avatar_url ?? null;
  const hasCover = Boolean(coverPreview);
  const hasAvatar = Boolean(avatarPreview);

  return (
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
              onClick={onDelete}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {...register("title")}
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
                slugTouched.current = true;
              },
            })}
          />
          {errors.slug ? (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2 sm:col-span-2 lg:col-span-1">
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
        <FieldLabel htmlFor="blog-summary" hint={`2–${BLOG_SUMMARY_MAX} chars`}>
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
          <p className="text-sm text-destructive">{errors.bodyHtml.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <FieldLabel
          hint={`up to ${BLOG_CATEGORIES_MAX} · each max ${BLOG_CATEGORY_MAX} chars`}
        >
          Categories
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {RECOMMENDED_BLOG_CATEGORIES.map((name) => {
            const active = categories.includes(name);
            return (
              <Button
                key={name}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className="min-h-11"
                disabled={isPending}
                onClick={() => toggleCategory(name)}
              >
                {name}
              </Button>
            );
          })}
        </div>
        <Input
          className="min-h-11"
          placeholder="Add custom category and press Enter"
          disabled={isPending}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const value = event.currentTarget.value.trim();
            if (!value || categories.includes(value)) return;
            setValue("categories", [...categories, value], {
              shouldValidate: true,
            });
            event.currentTarget.value = "";
          }}
        />
        {categories.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {categories.map((name) => (
              <li key={name}>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="min-h-11"
                  disabled={isPending}
                  onClick={() => toggleCategory(name)}
                >
                  {name} ×
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {errors.categories ? (
          <p className="text-sm text-destructive">
            {errors.categories.message ?? errors.categories.root?.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="blog-published"
                checked={field.value === "published"}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  field.onChange(checked === true ? "published" : "draft")
                }
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
                disabled={isPending}
                onCheckedChange={(checked) =>
                  field.onChange(checked === true)
                }
                className="size-5"
              />
            )}
          />
          <Label htmlFor="blog-featured" className="font-normal">
            Featured hero (only one at a time)
          </Label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel hint="JPEG/PNG/WebP/GIF · max 5MB">
              Cover image
            </FieldLabel>
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
                  className="min-h-11"
                  disabled={isPending}
                  onClick={onRemoveCover}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
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
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No cover yet
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldLabel hint="JPEG/PNG/WebP/GIF · max 2MB">
              Author avatar
            </FieldLabel>
            <div className="flex gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => onPickAvatar(event.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={isPending}
                onClick={() => avatarInputRef.current?.click()}
              >
                <UploadIcon className="size-4" />
                Upload
              </Button>
              {hasAvatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11"
                  disabled={isPending}
                  onClick={onRemoveAvatar}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          <div className="relative mx-auto size-28 overflow-hidden rounded-full bg-muted">
            {avatarPreview ? (
              mode === "create" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt={watch("authorName") || "Author preview"}
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <Image
                  src={avatarPreview}
                  alt={watch("authorName") || "Author preview"}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              )
            ) : (
              <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No avatar
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
