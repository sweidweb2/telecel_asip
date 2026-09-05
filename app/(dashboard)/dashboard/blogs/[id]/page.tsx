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
import { ROUTES } from "@/constants/routes";
import { getBlogByIdForAdmin } from "@/data/blogs";
import { getCohortsForBlogPicker } from "@/data/cohorts";
import { getStartupsForStoryPicker } from "@/data/founder-stories";

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
  const [result, startupsResult, cohortsResult] = await Promise.all([
    getBlogByIdForAdmin(id),
    getStartupsForStoryPicker(),
    getCohortsForBlogPicker(),
  ]);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();
  if (
    startupsResult.status === "forbidden" ||
    cohortsResult.status === "forbidden"
  ) {
    redirect(ROUTES.dashboard);
  }

  const pageLabel = result.blog.title.trim() || "Edit blog";

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
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
        startups={startupsResult.startups}
        cohorts={cohortsResult.cohorts}
        heading="Edit blog"
        description="Update content, publish status, featured hero, and images."
      />
    </main>
  );
}
