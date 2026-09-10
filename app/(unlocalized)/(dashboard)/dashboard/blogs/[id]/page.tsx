import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { BlogEditorForm } from "@/components/blogs/blog-editor-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StaffMain } from "@/components/dashboard/skip-to-content";
import { ROUTES } from "@/constants/routes";
import { getBlogByIdForAdmin } from "@/data/blogs";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditBlogPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getBlogByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Blog | ASIP Editor" };
  }
  return { title: `${result.blog.title} | ASIP Editor` };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const result = await getBlogByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const pageLabel = result.blog.title.trim() || "Edit blog";

  return (
    <StaffMain>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.blogs} />}>
              Blogs
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {pageLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <BlogEditorForm
        mode="edit"
        blog={result.blog}
        heading="Edit blog"
      />
    </StaffMain>
  );
}
