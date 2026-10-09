import type { Metadata } from "next";

import { BlogEditorForm } from "@/components/blogs/blog-editor-form";
import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
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

  return (
    <CmsEditorPage
      listPath={ROUTES.blogs}
      listLabel="Blogs"
      load={() => getBlogByIdForAdmin(id)}
      pageLabel={(record) => record.blog.title.trim() || "Edit blog"}
    >
      {(record) => (
        <BlogEditorForm mode="edit" blog={record.blog} heading="Edit blog" />
      )}
    </CmsEditorPage>
  );
}
