import type { Metadata } from "next";

import { BlogEditorForm } from "@/components/blogs/blog-editor-form";
import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New blog | ASIP Editor",
};

export default function NewBlogPage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.blogs}
      listLabel="Blogs"
      pageLabel="New blog"
    >
      <BlogEditorForm mode="create" heading="New blog" />
    </CmsEditorPage>
  );
}
