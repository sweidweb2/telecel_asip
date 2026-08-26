import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogEditorForm } from "@/components/blogs/blog-editor-form";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { getBlogByIdForAdmin } from "@/data/blogs";
import { cn } from "@/lib/utils";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditBlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getBlogByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Blog | ASIP Admin" };
  }
  return { title: `${result.blog.title} | ASIP Admin` };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const result = await getBlogByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <Link
          href={ROUTES.blogs}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "min-h-11 gap-2 px-0 hover:bg-transparent",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to blogs
        </Link>
        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
          Edit blog
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update content, publish status, featured hero, and images.
        </p>
      </div>
      <BlogEditorForm mode="edit" blog={result.blog} />
    </main>
  );
}
