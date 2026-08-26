"use client";

import { useEffect, useRef, useTransition } from "react";
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
  createBlogSchema,
  type CreateBlogInput,
} from "@/validations/blog";

type BlogEditorFormProps = {
  mode: "create" | "edit";
  blog?: Blog;
};

export function BlogEditorForm({ mode, blog }: BlogEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  function onUploadCover(fileList: FileList | null) {
    if (!blog || !fileList?.[0]) return;
    const formData = new FormData();
    formData.set("file", fileList[0]);
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

  function onUploadAvatar(fileList: FileList | null) {
    if (!blog || !fileList?.[0]) return;
    const formData = new FormData();
    formData.set("file", fileList[0]);
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

  function onRemoveImage(kind: "thumbnail" | "author") {
    if (!blog) return;
    startTransition(async () => {
      const result = await removeBlogImage({ id: blog.id, kind });
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status === "published" ? "default" : "secondary"}>
            {status === "published" ? "Published" : "Draft"}
          </Badge>
          {isFeatured ? <Badge variant="outline">Featured hero</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-2">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            className="min-h-11"
            disabled={isPending}
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="blog-slug">Slug</Label>
          <Input
            id="blog-slug"
            className="min-h-11"
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
      </div>

      <div className="grid gap-2">
        <Label htmlFor="blog-summary">Summary</Label>
        <Textarea
          id="blog-summary"
          rows={3}
          className="min-h-24"
          disabled={isPending}
          aria-invalid={Boolean(errors.summary)}
          {...register("summary")}
        />
        {errors.summary ? (
          <p className="text-sm text-destructive">{errors.summary.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label>Body</Label>
        <Controller
          name="bodyHtml"
          control={control}
          render={({ field }) => (
            <BlogRichTextEditor
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        {errors.bodyHtml ? (
          <p className="text-sm text-destructive">{errors.bodyHtml.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label>Categories</Label>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="blog-author">Author name</Label>
          <Input
            id="blog-author"
            className="min-h-11"
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
      </div>

      {mode === "edit" && blog ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>Cover image</Label>
              <div className="flex gap-2">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => onUploadCover(event.target.files)}
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
                {blog.thumbnail_url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    disabled={isPending}
                    onClick={() => onRemoveImage("thumbnail")}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="relative aspect-[1.5] w-full overflow-hidden rounded-lg bg-muted">
              {blog.thumbnail_url ? (
                <Image
                  src={blog.thumbnail_url}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No cover yet
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label>Author avatar</Label>
              <div className="flex gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => onUploadAvatar(event.target.files)}
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
                {blog.author_avatar_url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    disabled={isPending}
                    onClick={() => onRemoveImage("author")}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="relative mx-auto size-28 overflow-hidden rounded-full bg-muted">
              {blog.author_avatar_url ? (
                <Image
                  src={blog.author_avatar_url}
                  alt={blog.author_name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <p className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No avatar
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Save the blog first, then upload a cover and author avatar.
        </p>
      )}
    </form>
  );
}
